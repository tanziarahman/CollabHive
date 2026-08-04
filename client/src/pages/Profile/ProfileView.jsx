import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Profile.css";

const TABS = ["Info", "Education", "About", "Résumé"];

export default function ProfileView() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("Info");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProfile({
        ...data,
        name: data.fullName || data.name,
        jobTitle: data.jobTitle || data.experienceLevel,
        status: data.availability,
        aboutMe: data.bio,
        linkedinProfile: data.linkedinURL,
        photoUrl: data.profilePicture,
      });
    } catch {
      // Demo fallback
      setProfile({
        name: "Sarah Ahmed",
        phone: "+1 555 012 3456",
        email: "sarah.ahmed@example.com",
        status: "Student",
        jobTitle: "Frontend Developer",
        school: "North South University",
        degree: "B.Sc. Computer Science",
        achievements: ["Dean's List 2023", "React Certified"],
        aboutMe:
          "Frontend developer who loves building clean, accessible interfaces.",
        linkedinProfile: "https://www.linkedin.com/in/sarah-ahmed",
        interests: ["UI design", "Open source"],
        skills: ["React", "JavaScript", "CSS", "Figma"],
        projects: [
          {
            id: "p1",
            name: "CollabHive",
            githubLink: "https://github.com/example/collabhive",
            description: "Developer collaboration platform.",
          },
        ],
        photoUrl: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    if (!profile) return;
    const {
      name,
      email,
      phone,
      jobTitle,
      status,
      degree,
      school,
      achievements = [],
      aboutMe,
      linkedinProfile,
      interests = [],
      skills = [],
      projects = [],
    } = profile;

    const lines = [
      name || "Name",
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
            (p) =>
              `- ${p.name}${p.description ? `: ${p.description}` : ""}${
                p.githubLink ? ` | GitHub: ${p.githubLink}` : ""
              }`
          )
        : ["-"]),
    ];

    const escapePdfText = (text) =>
      text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

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
    for (let i = 0; i < wrappedLines.length; i += 46)
      pages.push(wrappedLines.slice(i, i + 46));

    const objects = ["<< /Type /Catalog /Pages 2 0 R >>", ""];
    const pageIds = [];
    const contentIds = [];
    pages.forEach(() => {
      pageIds.push(objects.length + 1);
      objects.push("");
      contentIds.push(objects.length + 1);
      objects.push("");
    });
    objects[1] = `<< /Type /Pages /Kids [${pageIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pageIds.length} >>`;

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
    pdf += offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
      .join("");
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(name || "resume").replace(/\s+/g, "_")}_resume.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="page-body">
          <div className="loading-state">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const {
    name,
    jobTitle,
    status,
    school,
    degree,
    achievements = [],
    aboutMe,
    linkedinProfile,
    interests = [],
    skills = [],
    projects = [],
    photoUrl,
  } = profile;

  const initials =
    (name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div className="profile-page">
      <div className="page-body">
        <div className="topnav">
          <div className="topnav-logo" aria-label="CollabHive">
            <span>Collab</span>Hive
          </div>
          <Link to="/posts" className="upload-link" style={{ marginLeft: "auto" }}>
            ← Back
          </Link>
        </div>

        <div className="banner" />

        <div className="columns">
          <aside className="profile-col">
            <div className="avatar-frame hex">
              {photoUrl ? <img src={photoUrl} alt="Profile" /> : <span>{initials}</span>}
            </div>

            <div className="name-block">
              <h1>{name || "Unnamed user"}</h1>
              <div className="role">
                {jobTitle || "No job title"} · {status}
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

            {projects.length > 0 && (
              <>
                <div className="side-label">Projects</div>
                <div className="project-grid">
                  {projects.map((p) => (
                    <div className="project-tile" key={p.id}>
                      <b>{p.name}</b>
                      {p.description && <span>{p.description}</span>}
                      {p.githubLink && (
                        <a href={p.githubLink} target="_blank" rel="noreferrer">
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
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
                <h2>{name || "Unnamed user"}</h2>
                <div className="sub">
                  {jobTitle || "No job title"} · {status}
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
                    <span className="hex-dot" /> Profile
                  </h3>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">Name</label>
                      <p className="readonly-value">{name || "-"}</p>
                    </div>
                    <div className="field">
                      <label className="field-label">Status</label>
                      <p className="readonly-value">{status || "-"}</p>
                    </div>
                    <div className="field">
                      <label className="field-label">Job title</label>
                      <p className="readonly-value">{jobTitle || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Education" && (
              <div className="panel">
                <div className="info-block">
                  <h3>
                    <span className="hex-dot" /> Education
                  </h3>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">School / university</label>
                      <p className="readonly-value">{school || "-"}</p>
                    </div>
                    <div className="field">
                      <label className="field-label">Degree / program</label>
                      <p className="readonly-value">{degree || "-"}</p>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Achievements & certificates</label>
                    <div className="tag-mini-row">
                      {achievements.length ? (
                        achievements.map((a, i) => (
                          <span className="tag-mini" key={i}>
                            {a}
                          </span>
                        ))
                      ) : (
                        <p className="readonly-value">-</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "About" && (
              <div className="panel">
                <div className="info-block">
                  <h3>
                    <span className="hex-dot" /> About
                  </h3>
                  <div className="field">
                    <label className="field-label">About</label>
                    <p className="readonly-value">{aboutMe || "-"}</p>
                  </div>
                  {linkedinProfile && (
                    <div className="field">
                      <label className="field-label">LinkedIn</label>
                      <a href={linkedinProfile} target="_blank" rel="noreferrer">
                        {linkedinProfile}
                      </a>
                    </div>
                  )}
                  <div className="field">
                    <label className="field-label">Interests</label>
                    <div className="tag-mini-row">
                      {interests.length ? (
                        interests.map((v, i) => (
                          <span className="tag-mini" key={i}>
                            {v}
                          </span>
                        ))
                      ) : (
                        <p className="readonly-value">-</p>
                      )}
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Skillset</label>
                    <div className="tag-mini-row">
                      {skills.length ? (
                        skills.map((v, i) => (
                          <span className="tag-mini" key={i}>
                            {v}
                          </span>
                        ))
                      ) : (
                        <p className="readonly-value">-</p>
                      )}
                    </div>
                  </div>
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
