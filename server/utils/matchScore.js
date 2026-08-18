// Normalizes a skill/tech term for case/whitespace-insensitive comparison.
const normalize = (value) => (value || '').trim().toLowerCase();

// Explainable skill match: what fraction of the project's required skills +
// tech stack does this person actually list among their own skills (by exact,
// case-insensitive name)? Deliberately literal rather than semantic/fuzzy, so
// the score is always fully justifiable by a concrete list of matched names
// instead of an opaque similarity number.
export const computeSkillMatch = (candidateSkills, project) => {
  const required = [...new Set([...(project.skillsRequired || []), ...(project.techStack || [])])];

  if (required.length === 0 || !candidateSkills || candidateSkills.length === 0) {
    return { score: 0, matchedSkills: [] };
  }

  const candidateSet = new Set(candidateSkills.map(normalize).filter(Boolean));
  const matchedSkills = required.filter((skill) => candidateSet.has(normalize(skill)));

  return {
    score: matchedSkills.length / required.length,
    matchedSkills,
  };
};
