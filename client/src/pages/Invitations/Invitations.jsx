import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Invitations.css";

const dummyInvitations = [
  {
    id: "1",
    title: "AI Study Assistant",
    description:
      "An AI-powered study assistant that helps students create personalized study plans, generate quizzes, and track their learning progress.",
    ownerId: "REPLACE_WITH_REAL_USER_ID_1",
    owner: "Rafiq Islam",
    role: "Frontend Developer",
    skills: ["React", "JavaScript", "CSS", "Figma"],
    techStack: ["React", "Node.js", "MongoDB", "Express"],
    members: 2,
    maxMembers: 4,
  },
  {
    id: "2",
    title: "Campus Connect",
    description:
      "A collaboration platform for university students to find teammates, share ideas, and work together on academic and personal projects.",
    ownerId: "REPLACE_WITH_REAL_USER_ID_2",
    owner: "Sarah Ahmed",
    role: "Backend Developer",
    skills: ["Node.js", "Express", "MongoDB", "REST API"],
    techStack: ["Node.js", "Express", "MongoDB", "React"],
    members: 3,
    maxMembers: 5,
  },
  {
    id: "3",
    title: "JobMatch AI",
    description:
      "An intelligent job recommendation platform that matches candidates with relevant job opportunities based on their skills, experience, and interests.",
    ownerId: "REPLACE_WITH_REAL_USER_ID_3",
    owner: "Tanvir Hossain",
    role: "Machine Learning Engineer",
    skills: ["Python", "Machine Learning", "Pandas", "Scikit-learn"],
    techStack: ["Python", "FastAPI", "Scikit-learn", "PostgreSQL"],
    members: 2,
    maxMembers: 4,
  },
  {
    id: "4",
    title: "BudgetBuddy",
    description:
      "A personal finance management application that allows users to track expenses, create budgets, and visualize their spending habits.",
    ownerId: "REPLACE_WITH_REAL_USER_ID_4",
    owner: "Meherin Chowdhury",
    role: "React Developer",
    skills: ["React", "JavaScript", "Chart.js", "CSS"],
    techStack: ["React", "Node.js", "Express", "MongoDB"],
    members: 3,
    maxMembers: 4,
  },
];

export default function Invitations() {
  const navigate = useNavigate();

  const [invitations, setInvitations] =
    useState(dummyInvitations);

  const handleAccept = (id) => {
    // Replace with backend API later.
    setInvitations((prev) =>
      prev.filter((invitation) => invitation.id !== id)
    );
  };

  const handleReject = (id) => {
    // Replace with backend API later.
    setInvitations((prev) =>
      prev.filter((invitation) => invitation.id !== id)
    );
  };

  const handleOwnerClick = (ownerId) => {
    navigate(`/profile/${ownerId}`);
  };

  return (
    <>
      <Navbar />

      <main className="invitations-page">
        <div className="invitations-container">

          {/* HEADER */}
          <div className="invitations-header">
            <div>
              <div className="header-label">
                COLLABORATION
              </div>

              <h1>Project Invitations</h1>

              <p>
                You've been invited to collaborate on these
                projects.
              </p>
            </div>

            <div className="invitation-counter">
              <span>{invitations.length}</span>
              <small>Pending</small>
            </div>
          </div>

          {/* INVITATIONS */}
          {invitations.length > 0 ? (
            <div className="invitation-list">

              {invitations.map((invitation) => (
                <article
                  className="invitation-card"
                  key={invitation.id}
                >

                  {/* TOP SECTION */}
                  <div className="invitation-top">

                    {/* PROJECT */}
                    <div className="project-heading">
                      <div className="invitation-title">
                        <h2>{invitation.title}</h2>

                        <p>
                          You've been invited to join this
                          collaboration.
                        </p>
                      </div>
                    </div>

                    {/* OWNER */}
                    <div className="owner-section">
                      <div
                        className="owner-profile"
                        onClick={() =>
                          handleOwnerClick(
                            invitation.ownerId
                          )
                        }
                      >
                        <div className="owner-avatar">
                          {invitation.owner
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong className="owner-name">
                          {invitation.owner}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* PROJECT DETAILS */}
                  <div className="invitation-details">

                    {/* ROLE */}
                    <div className="role-box">
                      <span className="detail-label">
                        INVITED ROLE
                      </span>

                      <strong>
                        {invitation.role}
                      </strong>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="project-info">
                      <span className="detail-label">
                        ABOUT THE PROJECT
                      </span>

                      <p>
                        {invitation.description}
                      </p>
                    </div>

                    {/* SKILLS + TECH STACK IN SAME BLOCK */}
                    <div className="skills-area">

                      <span className="detail-label">
                        SKILLS
                      </span>

                      <div className="skill-list">
                        {invitation.skills.map(
                          (skill) => (
                            <span key={skill}>
                              {skill}
                            </span>
                          )
                        )}
                      </div>

                      <span
                        className="detail-label"
                        style={{ marginTop: "0.8rem" }}
                      >
                        TECH STACK
                      </span>

                      <div className="skill-list">
                        {invitation.techStack.map(
                          (tech) => (
                            <span key={tech}>
                              {tech}
                            </span>
                          )
                        )}
                      </div>

                    </div>

                  </div>

                  {/* BOTTOM */}
                  <div className="invitation-bottom">

                    <div className="team-summary">
                      <span>
                        {invitation.members}/
                        {invitation.maxMembers} members
                      </span>

                      <span className="summary-divider">
                        •
                      </span>

                      <span>
                        {invitation.maxMembers -
                          invitation.members}{" "}
                        spot
                        {invitation.maxMembers -
                          invitation.members !==
                        1
                          ? "s"
                          : ""}{" "}
                        available
                      </span>
                    </div>

                    <div className="invitation-actions">

                      <button
                        className="reject-btn"
                        onClick={() =>
                          handleReject(
                            invitation.id
                          )
                        }
                      >
                        Reject
                      </button>

                      <button
                        className="accept-btn"
                        onClick={() =>
                          handleAccept(
                            invitation.id
                          )
                        }
                      >
                        Accept Invitation
                      </button>

                    </div>

                  </div>

                </article>
              ))}

            </div>
          ) : (

            /* EMPTY STATE */
            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h2>You're all caught up</h2>

              <p>
                You don't have any pending project
                invitations right now.
              </p>

            </div>
          )}

        </div>
      </main>
    </>
  );
}