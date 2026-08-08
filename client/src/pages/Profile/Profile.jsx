import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getMe } from "../../api/auth";
import { updateProfile, getConnections } from "../../api/users";
import "./Profile.css";

const AVAILABILITY_OPTIONS = ["Available", "Busy", "Open to Offers"];
const TABS = ["Info", "Education", "About", "Résumé"];

function TagField({ label, placeholder, values, onAdd, onRemove }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    onAdd(v);
    setDraft("");
  };

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="tag-input">
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <button type="button" className="tag-add" onClick={commit}>
          Add
        </button>
      </div>
      <div className="tag-mini-row">
        {values.map((v, i) => (
          <span className="tag-mini removable" key={`${v}-${i}`}>
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onRemove(i)}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeTab, setActiveTab] = useState("Info");
  const tabIndex = TABS.indexOf(activeTab);
  const goNext = () => setActiveTab(TABS[(tabIndex + 1) % TABS.length]);

  const [photoUrl, setPhotoUrl] = useState(null);
  const photoInputRef = useRef(null);
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  };

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Available");
  const [jobTitle, setJobTitle] = useState("");

  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [achievements, setAchievements] = useState([]);

  const [aboutMe, setAboutMe] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showAllSidebarProjects, setShowAllSidebarProjects] = useState(false);
  const [projectDraft, setProjectDraft] = useState({
    name: "",
    githubLink: "",
    description: "",
  });
  const [connectionList, setConnectionList] = useState([]);
  const [connectionType, setConnectionType] = useState("");
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionCounts, setConnectionCounts] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await getMe();
        setName(me.fullName || "");
        setEmail(me.email || "");
        setStatus(me.availability || "Available");
        setAboutMe(me.bio || "");
        setLinkedinProfile(me.linkedinURL || "");
        setInterests(me.interests || []);
        setSkills(me.skills || []);
        if (me.profilePicture) setPhotoUrl(me.profilePicture);
      } catch {
        // Fall back to whatever was cached at login; fields stay editable either way.
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [followers, following] = await Promise.all([
          getConnections("followers"),
          getConnections("following"),
        ]);
        setConnectionCounts({ followers: followers.length, following: following.length });
      } catch {
        setConnectionCounts({ followers: 0, following: 0 });
      }
    };
    loadCounts();
  }, []);

  useEffect(() => {
    if (!connectionType) return undefined;
    const loadConnections = async () => {
      setConnectionsLoading(true);
      try {
        const people = await getConnections(connectionType);
        setConnectionList(people);
        setConnectionCounts((counts) => ({ ...counts, [connectionType]: people.length }));
      } catch {
        setConnectionList([]);
      } finally {
        setConnectionsLoading(false);
      }
    };
    loadConnections();
  }, [connectionType]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      await updateProfile({
        bio: aboutMe,
        linkedinURL: linkedinProfile,
        interests,
        skills,
        availability: status,
      });
      setSaveMessage("Saved!");
    } catch (err) {
      setSaveMessage(err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
      window.setTimeout(() => setSaveMessage(""), 2500);
    }
  };

  const addProject = () => {
    const v = projectDraft.name.trim();
    if (!v) return;
    setProjects((p) => [
      ...p,
      {
        id: `${Date.now()}-${p.length}`,
        name: v,
        githubLink: projectDraft.githubLink.trim(),
        description: projectDraft.description.trim(),
      },
    ]);
    setProjectDraft({ name: "", githubLink: "", description: "" });
  };

  const downloadResume = () => {
    const lines = [
      name || "Your name",
      email,
      phone,
      "",
      "POSITION",
      `${jobTitle || "-"} (${status})`,
      "",
      "EDUCATION",
      `${degree || "-"}, ${school || "-"}`,
      "",
      "ACHIEVEMENTS & CERTIFICATES",
      ...(achievements.length ? achievements.map((a) => `- ${a}`) : ["-"]),
      "",
      "ABOUT ME",
      aboutMe || "-",
      linkedinProfile ? `LinkedIn: ${linkedinProfile}` : "",
      "",
      "INTERESTS",
      interests.length ? interests.join(", ") : "-",
      "",
      "SKILLSET",
      skills.length ? skills.join(", ") : "-",
      "",
      "PROJECTS",
      ...(projects.length
        ? projects.map(
            (p) => `- ${p.name}${p.description ? `: ${p.description}` : ""}${
              p.githubLink ? ` | GitHub: ${p.githubLink}` : ""
            }`
          )
        : ["-"]),
    ];
    const escapePdfText = (text) => text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const wrappedLines = lines.flatMap((line) => {
      const words = line.split(/\s+/).filter(Boolean);
      if (!words.length) return [""];
      const result = [];
      let current = "";
      words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length > 88 && current) {
          result.push(current);
          current = word;
        } else current = candidate;
      });
      if (current) result.push(current);
      return result;
    });
    const pages = [];
    for (let i = 0; i < wrappedLines.length; i += 46) pages.push(wrappedLines.slice(i, i + 46));
    const objects = ["<< /Type /Catalog /Pages 2 0 R >>", ""];
    const pageIds = [];
    const contentIds = [];
    pages.forEach(() => {
      pageIds.push(objects.length + 1);
      objects.push("");
      contentIds.push(objects.length + 1);
      objects.push("");
    });
    objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
    pages.forEach((page, index) => {
      const content = ["BT", "/F1 11 Tf", "50 792 Td", "15 TL"];
      page.forEach((line, lineIndex) => {
        content.push(`(${escapePdfText(line)}) Tj`);
        if (lineIndex < page.length - 1) content.push("T*");
      });
      content.push("ET");
      const stream = content.join("\n");
      objects[contentIds[index] - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
      objects[pageIds[index] - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentIds[index]} 0 R >>`;
    });
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(name || "resume").replace(/\s+/g, "_")}_resume.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  return (
    <>
      <Navbar />

      <div className="profile-page">
      <div className="page-body">
        <div className="banner" />

        <div className="columns">
          <aside className="profile-col">
            <div className="profile-summary-card">
            <div className="avatar-frame hex">
              {photoUrl ? <img src={photoUrl} alt="Profile" /> : <span>{initials}</span>}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={photoInputRef}
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <button type="button" className="upload-link" onClick={() => photoInputRef.current?.click()}>
              Upload profile picture
            </button>

            <div className="name-block">
              <h1>{name || savedUser.fullName || "Your name"}</h1>
              <div className="role">
                {jobTitle || "Add a job title"} · {status}
              </div>
            </div>

            <div className="connection-row" aria-label="Your connections">
              <button type="button" onClick={() => setConnectionType("followers")}>
                <b>{connectionCounts.followers}</b>
                <span>Followers</span>
              </button>
              <button type="button" onClick={() => setConnectionType("following")}>
                <b>{connectionCounts.following}</b>
                <span>Following</span>
              </button>
            </div>

            <button type="button" className="edit-profile-btn" disabled={saving} onClick={handleSaveProfile}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              {saving ? "Saving..." : saveMessage || "Save Profile"}
            </button>

            <div className="stat-row">
              <div className="stat">
                <b>{skills.length}</b>
                <span>Skills</span>
              </div>
              <div className="stat">
                <b>{projects.length}</b>
                <span>Projects</span>
              </div>
              <div className="stat">
                <b>{achievements.length}</b>
                <span>Certs</span>
              </div>
            </div>
            </div>

            <div className="recent-projects-card">
            <div className="side-label">
              Recent projects
              {projects.length > 3 && (
                <button type="button" className="sidebar-more" onClick={() => setShowAllSidebarProjects((show) => !show)}>
                  {showAllSidebarProjects ? "Less" : "More"}
                </button>
              )}
            </div>
            {projects.length > 0 && (
              <div className="project-grid">
                {(showAllSidebarProjects ? projects : projects.slice(0, 3)).map((p) => (
                  <div className="project-tile" key={p.id}>
                    <b>{p.name}</b>
                    {p.description && <span>{p.description}</span>}
                    {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer">GitHub ↗</a>}
                  </div>
                ))}
              </div>
            )}

            {skills.length > 0 && (
              <>
                <div className="side-label">Top skills</div>
                <div className="tag-mini-row">
                  {skills.slice(0, 6).map((s, i) => (
                    <span className="tag-mini" key={i}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
            <button type="button" className="all-projects-link" onClick={() => setShowAllSidebarProjects((show) => !show)}>
              {showAllSidebarProjects ? "Show less" : "View all projects..."}
            </button>
            </div>
          </aside>

          <main className="main-col">
            <div className="main-header">
              <div>
                <h2>{name || "Your name"}</h2>
                <div className="sub">
                  {jobTitle || "Job title"} · {status}
                </div>
              </div>
            </div>

            <div className="tabs">
              {TABS.map((t) => (
                <div
                  key={t}
                  className={`tab ${activeTab === t ? "active" : ""}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </div>
              ))}
            </div>

            {activeTab === "Info" && (
              <div className="panel">
                <div className="info-block">
                  <h3>
                    <span className="hex-dot" /> My profile
                  </h3>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">Name</label>
                      <input type="text" value={name} placeholder="Full name" readOnly title="Name can't be changed here" />
                    </div>
                    <div className="field">
                      <label className="field-label">Phone number</label>
                      <input type="tel" value={phone} placeholder="+1 555 000 1234" onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Email</label>
                      <input type="email" value={email} placeholder="you@example.com" readOnly title="Email can't be changed here" />
                    </div>
                  </div>
                </div>

                <div className="info-block">
                  <h3>
                    <span className="hex-dot" /> Position
                  </h3>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">Availability</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {AVAILABILITY_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Job title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        placeholder="e.g. Senior Architect"
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="info-block">
                  <h3>
                    <span className="hex-dot" /> Core Competencies
                  </h3>
                  {skills.length > 0 ? (
                    <div className="pill-row">
                      {skills.map((s, i) => (
                        <span className="pill-tag" key={i}>
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="pill-empty">Add your skillset in the About tab to see it here.</p>
                  )}
                </div>

                <div className="tab-nav">
                  <button type="button" className="btn-next" onClick={goNext}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Education" && (
              <div className="panel">
                <div className="info-block">
                  <h3>
                    <span className="hex-dot" /> Education details
                  </h3>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">School / university</label>
                      <input type="text" value={school} placeholder="Institution name" onChange={(e) => setSchool(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Degree / program</label>
                      <input type="text" value={degree} placeholder="e.g. B.Sc. Computer Science" onChange={(e) => setDegree(e.target.value)} />
                    </div>
                  </div>
                  <TagField
                    label="Achievements & certificates"
                    placeholder="Type one and press Add"
                    values={achievements}
                    onAdd={(v) => setAchievements((a) => [...a, v])}
                    onRemove={(i) => setAchievements((a) => a.filter((_, idx) => idx !== i))}
                  />
                </div>

                <div className="tab-nav">
                  <button type="button" className="btn-next" onClick={goNext}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeTab === "About" && (
              <div className="panel">
                <div className="info-block">
                  <h3>
                    <span className="hex-dot" /> About me
                  </h3>
                  <div className="field">
                    <label className="field-label">A few words about you</label>
                    <textarea
                      value={aboutMe}
                      placeholder="Tell people what you do and what you're looking for..."
                      onChange={(e) => setAboutMe(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">LinkedIn profile link</label>
                    <input
                      type="url"
                      value={linkedinProfile}
                      placeholder="https://www.linkedin.com/in/your-profile"
                      onChange={(e) => setLinkedinProfile(e.target.value)}
                    />
                  </div>
                  <TagField
                    label="Interests"
                    placeholder="e.g. UI design"
                    values={interests}
                    onAdd={(v) => setInterests((a) => [...a, v])}
                    onRemove={(i) => setInterests((a) => a.filter((_, idx) => idx !== i))}
                  />
                  <TagField
                    label="Skillset"
                    placeholder="e.g. React"
                    values={skills}
                    onAdd={(v) => setSkills((a) => [...a, v])}
                    onRemove={(i) => setSkills((a) => a.filter((_, idx) => idx !== i))}
                  />
                  <div className="field">
                    <label className="field-label">Projects</label>
                    <div className="project-add-form">
                      <input
                        type="text"
                        value={projectDraft.name}
                        placeholder="Project name"
                        onChange={(e) => setProjectDraft((d) => ({ ...d, name: e.target.value }))}
                      />
                      <input
                        type="text"
                        value={projectDraft.githubLink}
                        placeholder="GitHub link"
                        onChange={(e) => setProjectDraft((d) => ({ ...d, githubLink: e.target.value }))}
                      />
                      <input
                        type="text"
                        value={projectDraft.description}
                        placeholder="Project description"
                        onChange={(e) => setProjectDraft((d) => ({ ...d, description: e.target.value }))}
                      />

                      <div className="project-add-actions">
                        <button type="button" className="tag-add" onClick={addProject}>
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="card-list">
                      {projects.map((p, i) => (
                        <div className="pcard" key={p.id || `${p.name}-${i}`}>
                          <div className="pcard-head">
                            <b>{p.name}</b>
                            <button
                              type="button"
                              className="pcard-remove"
                              aria-label={`Remove ${p.name}`}
                              onClick={() => setProjects((arr) => arr.filter((_, idx) => idx !== i))}
                            >
                              ×
                            </button>
                          </div>
                          {p.description && <p className="pcard-description">{p.description}</p>}
                          {p.githubLink && (
                            <div className="pcard-links">
                              {p.githubLink && (
                                <a href={p.githubLink} target="_blank" rel="noreferrer">
                                  GitHub ↗
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tab-nav">
                  <button type="button" className="btn-next" onClick={goNext}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Résumé" && (
              <div className="panel">
                <div className="info-block">
                  <div className="resume-line">
                    <div className="resume-dot" />
                    <div>
                      <b>{jobTitle || "Job title"}</b>
                      <span>{status}</span>
                    </div>
                  </div>
                  <div className="resume-line">
                    <div className="resume-dot" />
                    <div>
                      <b>{degree || "Degree / program"}</b>
                      <span>{school || "Institution"}</span>
                    </div>
                  </div>
                  {achievements.map((a, i) => (
                    <div className="resume-line" key={i}>
                      <div className="resume-dot" />
                      <div>
                        <b>{a}</b>
                        <span>Achievement</span>
                      </div>
                    </div>
                  ))}
                  {aboutMe && <p className="resume-about">{aboutMe}</p>}
                  <button type="button" className="btn-save" onClick={downloadResume}>
                    Download résumé
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {connectionType && (
        <div className="connections-modal-backdrop" onClick={() => setConnectionType("")}>
          <section className="connections-modal" role="dialog" aria-modal="true" aria-labelledby="connections-title" onClick={(event) => event.stopPropagation()}>
            <div className="connections-modal-header">
              <h2 id="connections-title">{connectionType === "followers" ? "Followers" : "Following"}</h2>
              <button type="button" onClick={() => setConnectionType("")} aria-label="Close">×</button>
            </div>
            <div className="connections-list">
              {connectionsLoading ? <p className="connections-empty">Loading...</p> : connectionList.length === 0 ? <p className="connections-empty">No {connectionType} yet.</p> : connectionList.map((person) => (
                <button type="button" className="connection-person" key={person._id} onClick={() => navigate(`/profile/${person._id}`)}>
                  <span className="connection-avatar">{person.profilePicture ? <img src={person.profilePicture} alt="" /> : person.fullName?.charAt(0)}</span>
                  <span><b>{person.fullName}</b><small>@{person.username}</small></span>
                  <em>View profile</em>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
      </div>
    </>
  );
}
