// Given a project's target role headcounts and its actually-accepted members,
// works out how many spots are still open per role so the UI can stop
// inviting/accepting people into roles that are already full.
export const computeOpenRoles = (roleAllocations, members) => {
  const filledByRole = {};
  (members || []).forEach((m) => {
    const key = (m.role || '').trim().toLowerCase();
    if (!key) return;
    filledByRole[key] = (filledByRole[key] || 0) + 1;
  });

  return (roleAllocations || []).map((r) => {
    const filled = filledByRole[(r.role || '').trim().toLowerCase()] || 0;
    return {
      role: r.role,
      count: r.count,
      filled,
      remaining: Math.max(0, r.count - filled),
    };
  });
};
