import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { getProjectFeed, createJoinRequest } from "../../api/projects";
import "./Posts.css";

export default function Posts() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedRoles, setAppliedRoles] = useState([]);
  const [applyingKey, setApplyingKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await getProjectFeed();
        setProjects(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your feed.");
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  const applyToRole = async (projectId, role) => {
    const key = `${projectId}:${role}`;
    if (appliedRoles.includes(key)) return;

    setApplyingKey(key);
    try {
      await createJoinRequest(projectId, { role });
      setAppliedRoles((prev) => [...prev, key]);
    } catch (err) {
      alert(err.response?.data?.message || "Could not apply for this role.");
    } finally {
      setApplyingKey(null);
    }
  };

  const visibleProjects = searchTerm.trim()
    ? projects.filter((project) =>
        (project.createdBy?.fullName || "")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      )
    : projects;

  if (loading) {
    return (
      <>
        <Navbar searchValue={searchTerm} onSearchChange={setSearchTerm} />
        <div className="my-posts-page">
          <div className="my-posts-container">
            <div className="loading-state">Loading your feed...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar searchValue={searchTerm} onSearchChange={setSearchTerm} />

      <div className="my-posts-page">
        <div className="my-posts-container">

          {error && <div className="empty-state"><p>{error}</p></div>}

          {!error && visibleProjects.length === 0 ? (
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
                    <Link to={`/profile/${project.createdBy?._id}`} className="post-creator">
                      <span className="post-creator-avatar">
                        {project.createdBy?.profilePicture ? (
                          <img src={project.createdBy.profilePicture} alt="" />
                        ) : (
                          project.createdBy?.fullName?.charAt(0)
                        )}
                      </span>
                      <span className="post-creator-name">{project.createdBy?.fullName}</span>
                    </Link>

                    <h2>{project.title}</h2>

                    <p>
                      Posted{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {project.matchScore > 0 && (
                    <span
                      className="match-score-badge"
                      title="How closely your skills match what this project needs"
                    >
                      {Math.round(project.matchScore * 100)}% match
                    </span>
                  )}
                </div>

                <p className="description">{project.description}</p>

                {/* REQUIRED SKILLS */}

                <div className="section">
                  <h3>Required Skills</h3>

                  <div className="tags">
                    {(project.skillsRequired || []).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>

                {/* TECH STACK */}

                <div className="section">
                  <h3>Tech Stack</h3>

                  <div className="tags">
                    {(project.techStack || []).map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>

                {/* OPEN ROLES */}

                <div className="section">
                  <h3>Open Roles</h3>

                  <div className="roles">
                    {(project.roleAllocations || []).map((role) => {
                      const key = `${project._id}:${role.role}`;
                      const applied = appliedRoles.includes(key);

                      return (
                        <div key={role.role} className="role">
                          <span>{role.role}</span>
                          <strong>{role.count}</strong>
                          <button
                            type="button"
                            className={`invite-btn ${applied ? "applied" : ""}`}
                            disabled={applied || applyingKey === key}
                            onClick={() => applyToRole(project._id, role.role)}
                          >
                            {applied ? "Applied ✓" : applyingKey === key ? "Applying..." : "Apply"}
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
                  <span>{project.members?.length || 0} Members</span>
                </div>

              </div>
            ))
          )}

        </div>
      </div>
    </>
  );
}
