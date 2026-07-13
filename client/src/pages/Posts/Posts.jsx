import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Posts.css";

export default function Posts() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

          skillsRequired: [
            "React",
            "Node.js",
            "MongoDB",
            "Express",
          ],

          roleAllocations: [
            {
              role: "Frontend Developer",
              count: 2,
            },
            {
              role: "Backend Developer",
              count: 1,
            },
          ],

          githubRepo:
            "https://github.com/example/collabhive",

          demoLink:
            "https://collabhive-demo.vercel.app",

          applicants: 6,
        },

        {
          _id: "2",
          title: "AI Resume Analyzer",

          description:
            "AI powered resume analysis platform.",

          createdAt: "5 days ago",

          status: "Recruiting",

          category: "AI",

          skillsRequired: [
            "Python",
            "FastAPI",
            "React",
          ],

          roleAllocations: [
            {
              role: "ML Engineer",
              count: 1,
            },
            {
              role: "Frontend Developer",
              count: 1,
            },
          ],

          githubRepo:
            "https://github.com/example/resume-ai",

          demoLink:
            "https://resume-ai-demo.vercel.app",

          applicants: 3,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="my-posts-page">
          <div className="loading-state">
            Loading your projects...
          </div>
        </div>
      </>
    );

  return (
    <>
      <Navbar />

      <div className="my-posts-page">

        <div className="my-posts-container">

          <div className="page-header">

            <div>

              <h1>My Projects</h1>

              <p>
                Manage every project you've created.
              </p>

            </div>

            <Link
              to="/create-project"
              className="create-btn"
            >
              + Create Project
            </Link>

          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {projects.length === 0 ? (
            <div className="empty-state">

              <h2>No Projects Yet</h2>

              <p>
                Create your first collaborative project.
              </p>

            </div>
          ) : (
            projects.map((project) => (
              <div
                className="project-card"
                key={project._id}
              >
                <div className="project-header">

                  <div>

                    <h2>{project.title}</h2>

                    <p>
                      Created {project.createdAt}
                    </p>

                  </div>

                  <span className="status">
                    {project.status}
                  </span>

                </div>

                <p className="description">
                  {project.description}
                </p>

                <div className="section">

                  <h3>Required Skills</h3>

                  <div className="tags">

                    {project.skillsRequired.map(
                      (skill) => (
                        <span key={skill}>
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>

                <div className="section">

                  <h3>Open Roles</h3>

                  <div className="roles">

                    {project.roleAllocations.map(
                      (role) => (
                        <div
                          key={role.role}
                          className="role"
                        >
                          <span>
                            {role.role}
                          </span>

                          <strong>
                            {role.count}
                          </strong>
                        </div>
                      )
                    )}

                  </div>

                </div>

                <div className="resources">

                  {project.githubRepo && (
                    <a
                      href={project.githubRepo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>
                  )}

                  {project.demoLink && (
                    <a
                      href={project.demoLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live Demo
                    </a>
                  )}

                </div>

                <div className="project-footer">

                  <span>
                    {project.applicants} Applicants
                  </span>

                  <div className="actions">

                    <button>
                      Edit
                    </button>

                    <button>
                      View Applicants
                    </button>

                    <button className="delete-btn">
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            ))
          )}

        </div>

      </div>
    </>
  );
}