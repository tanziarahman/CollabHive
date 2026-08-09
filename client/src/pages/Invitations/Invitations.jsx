import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Invitations.css";

const dummyInvitations = [
  {
    id: "1",
    title: "AI Study Assistant",
    description:
      "An AI-powered study assistant that helps students create personalized study plans, generate quizzes, and track their learning progress.",
    owner: "Rafiq Islam",
    ownerUsername: "rafiq.islam",
    role: "Frontend Developer",
    skills: ["React", "JavaScript", "CSS", "Figma"],
    members: 2,
    maxMembers: 4,
  },
  {
    id: "2",
    title: "Campus Connect",
    description:
      "A collaboration platform for university students to find teammates, share ideas, and work together on academic and personal projects.",
    owner: "Sarah Ahmed",
    ownerUsername: "sarah.ahmed",
    role: "Backend Developer",
    skills: ["Node.js", "Express", "MongoDB", "REST API"],
    members: 3,
    maxMembers: 5,
  },
  {
    id: "3",
    title: "JobMatch AI",
    description:
      "An intelligent job recommendation platform that matches candidates with relevant job opportunities based on their skills, experience, and interests.",
    owner: "Tanvir Hossain",
    ownerUsername: "tanvir.hossain",
    role: "Machine Learning Engineer",
    skills: ["Python", "Machine Learning", "Pandas", "Scikit-learn"],
    members: 2,
    maxMembers: 4,
  },
  {
    id: "4",
    title: "BudgetBuddy",
    description:
      "A personal finance management application that allows users to track expenses, create budgets, and visualize their spending habits.",
    owner: "Meherin Chowdhury",
    ownerUsername: "meherin.chowdhury",
    role: "React Developer",
    skills: ["React", "JavaScript", "Chart.js", "CSS"],
    members: 3,
    maxMembers: 4,
  },
];

export default function Invitations() {
  const [invitations, setInvitations] = useState(dummyInvitations);

  const handleAccept = (id) => {
    setInvitations((prev) =>
      prev.filter((invitation) => invitation.id !== id)
    );
  };

  const handleReject = (id) => {
    setInvitations((prev) =>
      prev.filter((invitation) => invitation.id !== id)
    );
  };

  return (
    <>
      <Navbar />

      <div className="invitations-page">
        <div className="invitations-container">

          {/* HEADER */}
          <div className="page-header">
            <div>
              <h1>Project Invitations</h1>
              <p>Projects you have been invited to join.</p>
            </div>

            <span className="invitation-count">
              {invitations.length}{" "}
              {invitations.length === 1
                ? "Invitation"
                : "Invitations"}
            </span>
          </div>

          {/* INVITATIONS */}
          {invitations.length > 0 ? (
            invitations.map((invitation) => (
              <div
                className="project-card"
                key={invitation.id}
              >
                {/* PROJECT HEADER */}
                <div className="project-header">
                  <div>
                    <h2>{invitation.title}</h2>
                    <p>Project invitation</p>
                  </div>

                  <span className="status">
                    Invitation
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="description">
                  {invitation.description}
                </p>

                {/* OWNER */}
                <div className="section">
                  <h3>Owner</h3>

                  <div className="owner-info">
                    <span>{invitation.owner}</span>
                    <strong>
                      @{invitation.ownerUsername}
                    </strong>
                  </div>
                </div>

                {/* INVITED ROLE */}
                <div className="section">
                  <h3>Invited Role</h3>

                  <div className="role">
                    <span>{invitation.role}</span>
                  </div>
                </div>

                {/* SKILLS */}
                <div className="section">
                  <h3>Skills</h3>

                  <div className="tags">
                    {invitation.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>

                {/* TEAM */}
                <div className="section">
                  <h3>Team</h3>

                  <div className="team-details">
                    <span>
                      {invitation.members}/
                      {invitation.maxMembers} members
                    </span>

                    <span>
                      {invitation.maxMembers -
                        invitation.members}{" "}
                      position
                      {invitation.maxMembers -
                        invitation.members !==
                      1
                        ? "s"
                        : ""}{" "}
                      available
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="project-footer">
                  <div className="invitation-note">
                    <span>
                      You have been invited to join this
                      project.
                    </span>
                  </div>

                  <div className="actions">
                    <button
                      className="reject-btn"
                      onClick={() =>
                        handleReject(invitation.id)
                      }
                    >
                      Reject
                    </button>

                    <button
                      className="accept-btn"
                      onClick={() =>
                        handleAccept(invitation.id)
                      }
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h2>No Invitations</h2>
              <p>
                You currently have no pending project
                invitations.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}