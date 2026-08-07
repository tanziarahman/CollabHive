// Shared by the REST isProjectParticipant middleware and the socket room-join
// handler, since both need to answer the same question: can this user access
// this project's chat (owner or accepted member)?
export const isProjectMember = (project, userId) => {
  const id = userId.toString();
  const isOwner = project.createdBy.toString() === id;
  const isMember = project.members.some((m) => m.user.toString() === id);
  return isOwner || isMember;
};
