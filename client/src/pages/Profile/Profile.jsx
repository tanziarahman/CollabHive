import { useState, useRef } from "react";
import "./Profile.css";

const JOB_STATUSES = ["Employed", "Unemployed", "Student"];
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
  const [status, setStatus] = useState("Employed");
  const [jobTitle, setJobTitle] = useState("");

  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [achievements, setAchievements] = useState([]);

  const [aboutMe, setAboutMe] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showAllSidebarProjects, setShowAllSidebarProjects] = useState(false);
  const [projectDraft, setProjectDraft] = useState({
    name: "",
    githubLink: "",
    description: "",
  });

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
    <div className="profile-page">
      <div className="rail">
        <div className="rail-logo">CH</div>
        <div className="rail-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </div>
        <div className="rail-icon active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <div className="rail-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="rail-spacer" />
        <div className="rail-avatar">{initials !== "?" ? initials[0] : "U"}</div>
      </div>

      <div className="page-body">
        <div className="topnav">
          <div className="topnav-logo" aria-label="CollabHive">
            <span>Collab</span>Hive
          </div>
          <div className="topnav-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input type="text" placeholder="Search users or projects by skill or name..." />
          </div>
          <button type="button" className="topnav-create">
            + Create Project
          </button>
          <div className="topnav-bell">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="topnav-avatar">{initials !== "?" ? initials[0] : "U"}</div>
        </div>

        <div className="banner" />

        <div className="columns">
          <aside className="profile-col">
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
              <h1>{name || "Your name"}</h1>
              <div className="role">
                {jobTitle || "Add a job title"} · {status}
              </div>
            </div>

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

            <div className="side-label">
              Projects
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
                      <input type="text" value={name} placeholder="Full name" onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Phone number</label>
                      <input type="tel" value={phone} placeholder="+1 555 000 1234" onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Email</label>
                      <input type="email" value={email} placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="info-block">
                  <h3>
                    <span className="hex-dot" /> Position
                  </h3>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {JOB_STATUSES.map((s) => (
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
                        disabled={status === "Unemployed"}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
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
    </div>
  );
}
