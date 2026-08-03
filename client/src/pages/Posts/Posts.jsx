import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Posts.css";

export default function Posts() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/projects/my-projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();

      setProjects(data);
    } catch {
      // Demo Data
      setProjects([
        {
          _id: "1",
          title: "CollabHive",
          description:
            "Developer collaboration platform helping students build projects together.",
          createdAt: "2 days ago",
          status: "Open",
          category: "Web",
          skillsRequired: ["React", "Node.js", "MongoDB", "Express"],
          roleAllocations: [
            { role: "Frontend Developer", count: 2 },
            { role: "Backend Developer", count: 1 },
          ],
          githubRepo: "https://github.com/example/collabhive",
          demoLink: "https://collabhive-demo.vercel.app",
          applicants: 6,
          applicantsList: [
            { _id: "a1", name: "Sarah Ahmed", role: "Frontend Developer" },
            { _id: "a2", name: "Rafiq Islam", role: "Backend Developer" },
            { _id: "a3", name: "Meherin Chowdhury", role: "Frontend Developer" },
          ],
        },
        {
          _id: "2",
          title: "AI Resume Analyzer",
          description: "AI powered resume analysis platform.",
          createdAt: "5 days ago",
          status: "Recruiting",
          category: "AI",
          skillsRequired: ["Python", "FastAPI", "React"],
          roleAllocations: [
            { role: "ML Engineer", count: 1 },
            { role: "Frontend Developer", count: 1 },
          ],
          githubRepo: "https://github.com/example/resume-ai",
          demoLink: "https://resume-ai-demo.vercel.app",
          applicants: 3,
          applicantsList: [
            { _id: "a4", name: "Tanvir Hossain", role: "ML Engineer" },
            { _id: "a5", name: "Nusrat Jahan", role: "Frontend Developer" },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="my-posts-page">
          <div className="loading-state">Loading your projects...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className={`my-posts-page ${activeProject ? "is-blurred" : ""}`}>
        <div className="my-posts-container">
          <div className="page-header">
            <div>
              <h1>My Projects</h1>
              <p>Manage every project you've created.</p>
            </div>

            <Link to="/create-project" className="create-btn">
              + Create Project
            </Link>
          </div>

          {error && <div className="error-message">{error}</div>}

          {projects.length === 0 ? (
            <div className="empty-state">
              <h2>No Projects Yet</h2>
              <p>Create your first collaborative project.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div className="project-card" key={project._id}>
                <div className="project-header">
                  <div>
                    <h2>{project.title}</h2>
                    <p>Created {project.createdAt}</p>
                  </div>

                  <span className="status">{project.status}</span>
                </div>

                <p className="description">{project.description}</p>

                <div className="section">
                  <h3>Required Skills</h3>
                  <div className="tags">
                    {project.skillsRequired.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="section">
                  <h3>Open Roles</h3>
                  <div className="roles">
                    {project.roleAllocations.map((role) => (
                      <div key={role.role} className="role">
                        <span>{role.role}</span>
                        <strong>{role.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>

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

                <div className="project-footer">
                  <span>{project.applicants} Applicants</span>

                  <div className="actions">
                    <button onClick={() => setActiveProject(project)}>
                      View Applicants
                    </button>

                    <button className="delete-btn">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeProject && (
        <div
          className="applicants-overlay"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="applicants-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="applicants-modal-header">
              <div>
                <h2>{activeProject.title}</h2>
                <p>{activeProject.applicantsList?.length || 0} Applicants</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setActiveProject(null)}
              >
                ✕
              </button>
            </div>

            <div className="applicants-list">
              {activeProject.applicantsList &&
              activeProject.applicantsList.length > 0 ? (
                activeProject.applicantsList.map((applicant) => (
                  <div className="applicant-row" key={applicant._id}>
                    <div className="applicant-info">
                      <span className="applicant-name">{applicant.name}</span>
                      <span className="applicant-role">{applicant.role}</span>
                    </div>

                    <div className="applicant-actions">
                      <Link
                        to={`/profile/${applicant._id}`}
                        className="view-link"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-applicants">No applicants yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}