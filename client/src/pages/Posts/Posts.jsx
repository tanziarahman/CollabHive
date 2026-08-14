import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Posts.css";

// Demo data only — a real "projects created by people I follow" feed for this
// page isn't wired up to the backend yet, so these stand in for real posts
// from people the current user follows.
const DEMO_FOLLOWED_PROJECTS = [
  {
    _id: "feed-1",
    title: "Campus Connect",
    description:
      "A platform that helps university students connect, collaborate, and create projects together.",
    createdAt: "2026-08-01T10:00:00Z",
    creator: { _id: "demo-sarah", fullName: "Sarah Ahmed", profilePicture: "" },
    techStack: ["React", "Node.js", "Express", "MongoDB"],
    skillsRequired: ["React", "Node.js", "MongoDB", "Figma"],
    roleAllocations: [
      { role: "Frontend Developer", count: 1 },
      { role: "Backend Developer", count: 1 },
      { role: "UI/UX Designer", count: 1 },
    ],
    githubRepo: "https://github.com/example/campus-connect",
    demoLink: "https://campus-connect-demo.example.com",
    members: 2,
  },
  {
    _id: "feed-2",
    title: "AI Study Assistant",
    description:
      "An AI-powered study assistant that generates summaries, quizzes, and personalized learning recommendations.",
    createdAt: "2026-07-28T14:30:00Z",
    creator: { _id: "demo-rafiq", fullName: "Rafiq Islam", profilePicture: "" },
    techStack: ["Python", "FastAPI", "React", "PostgreSQL"],
    skillsRequired: ["Python", "FastAPI", "React", "Machine Learning"],
    roleAllocations: [
      { role: "ML Engineer", count: 1 },
      { role: "Frontend Developer", count: 1 },
      { role: "Backend Developer", count: 1 },
    ],
    githubRepo: "https://github.com/example/ai-study-assistant",
    demoLink: "",
    members: 1,
  },
  {
    _id: "feed-3",
    title: "BudgetBuddy",
    description:
      "A personal finance application for tracking expenses, setting budgets, and visualizing spending habits.",
    createdAt: "2026-07-20T09:15:00Z",
    creator: { _id: "demo-meherin", fullName: "Meherin Chowdhury", profilePicture: "" },
    techStack: ["React", "Express", "MongoDB", "Chart.js"],
    skillsRequired: ["React", "Express", "MongoDB", "Chart.js"],
    roleAllocations: [
      { role: "Frontend Developer", count: 2 },
      { role: "Backend Developer", count: 1 },
    ],
    githubRepo: "https://github.com/example/budget-buddy",
    demoLink: "https://budget-buddy.example.com",
    members: 3,
  },
  {
    _id: "feed-4",
    title: "HealthTrack",
    description:
      "A web application that allows users to monitor daily activities, set fitness goals, and track their progress.",
    createdAt: "2026-07-15T16:45:00Z",
    creator: { _id: "demo-tanvir", fullName: "Tanvir Hossain", profilePicture: "" },
    techStack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    skillsRequired: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    roleAllocations: [
      { role: "Full Stack Developer", count: 1 },
      { role: "UI/UX Designer", count: 1 },
      { role: "QA Engineer", count: 1 },
    ],
    githubRepo: "https://github.com/example/health-track",
    demoLink: "https://health-track.example.com",
    members: 2,
  },
  {
    _id: "feed-5",
    title: "JobMatch AI",
    description:
      "An intelligent job recommendation platform that matches candidates with relevant job opportunities based on their skills.",
    createdAt: "2026-07-05T11:20:00Z",
    creator: { _id: "demo-nusrat", fullName: "Nusrat Jahan", profilePicture: "" },
    techStack: ["Python", "FastAPI", "React", "PostgreSQL"],
    skillsRequired: ["Python", "Machine Learning", "React", "PostgreSQL"],
    roleAllocations: [
      { role: "Machine Learning Engineer", count: 1 },
      { role: "React Developer", count: 1 },
      { role: "Backend Developer", count: 1 },
    ],
    githubRepo: "https://github.com/example/jobmatch-ai",
    demoLink: "https://jobmatch-ai.example.com",
    members: 2,
  },
];

export default function Posts() {
  const [appliedRoles, setAppliedRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const applyToRole = (projectId, role) => {
    const key = `${projectId}:${role}`;
    setAppliedRoles((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const visibleProjects = searchTerm.trim()
    ? DEMO_FOLLOWED_PROJECTS.filter((project) =>
        project.creator.fullName
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      )
    : DEMO_FOLLOWED_PROJECTS;

  return (
    <>
      <Navbar searchValue={searchTerm} onSearchChange={setSearchTerm} />

      <div className="my-posts-page">
        <div className="my-posts-container">

          {visibleProjects.length === 0 ? (
            <div className="empty-state">
              <h2>No posts found</h2>
              <p>
                {searchTerm.trim()
                  ? `No one named "${searchTerm}" has posted a project yet.`
                  : "Follow more people to see the projects they create here."}
              </p>
            </div>
          ) : (
            visibleProjects.map((project) => (
              <div className="project-card" key={project._id}>

                <div className="project-header">
                  <div>
                    <Link to={`/profile/${project.creator._id}`} className="post-creator">
                      <span className="post-creator-avatar">
                        {project.creator.profilePicture ? (
                          <img src={project.creator.profilePicture} alt="" />
                        ) : (
                          project.creator.fullName.charAt(0)
                        )}
                      </span>
                      <span className="post-creator-name">{project.creator.fullName}</span>
                    </Link>

                    <h2>{project.title}</h2>

                    <p>
                      Posted{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="description">{project.description}</p>

                {/* REQUIRED SKILLS */}

                <div className="section">
                  <h3>Required Skills</h3>

                  <div className="tags">
                    {project.skillsRequired.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>

                {/* TECH STACK */}

                <div className="section">
                  <h3>Tech Stack</h3>

                  <div className="tags">
                    {project.techStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>

                {/* OPEN ROLES */}

                <div className="section">
                  <h3>Open Roles</h3>

                  <div className="roles">
                    {project.roleAllocations.map((role) => {
                      const key = `${project._id}:${role.role}`;
                      const applied = appliedRoles.includes(key);

                      return (
                        <div key={role.role} className="role">
                          <span>{role.role}</span>
                          <strong>{role.count}</strong>
                          <button
                            type="button"
                            className={`invite-btn ${applied ? "applied" : ""}`}
                            disabled={applied}
                            onClick={() => applyToRole(project._id, role.role)}
                          >
                            {applied ? "Applied ✓" : "Apply"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RESOURCES */}

                <div className="resources">

                  {project.githubRepo && (
                    <a href={project.githubRepo} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  )}

                  {project.demoLink && (
                    <a href={project.demoLink} target="_blank" rel="noreferrer">
                      Live Demo
                    </a>
                  )}

                </div>

                {/* FOOTER */}

                <div className="project-footer">
                  <span>{project.members} Members</span>
                </div>

              </div>
            ))
          )}

        </div>
      </div>
    </>
  );
}
