import { getEmbeddings } from './embeddingService.js';
import { cosineSimilarity } from './cosineSimilarity.js';

// Normalizes a skill/tech term for case/whitespace-insensitive comparison.
const normalize = (value) => (value || '').trim().toLowerCase();

// Above this cosine similarity, two differently-spelled skill strings are
// treated as the same skill (e.g. "React" / "React.js"). Calibrated against
// real skill-name pairs: true synonyms ("PostgreSQL"/"Postgres" 0.91,
// "React"/"React.js" 0.79, "Node.js"/"NodeJS" 0.87) land well above this,
// while related-but-different tools ("Angular"/"Vue.js" 0.68, "React"/
// "Angular" 0.64) land below it. Deliberately set high enough to risk
// missing a weak synonym (e.g. "Node.js"/"Node" at 0.71 falls just short)
// rather than risk a false match between two different technologies —
// a missed synonym silently falls back to exact-match behavior, a false
// match would produce an unexplainable score.
const SYNONYM_THRESHOLD = 0.72;

// Explainable skill match: what fraction of the project's required skills +
// tech stack does this person actually list among their own skills? The
// scoring itself stays exact and deterministic — every matched skill can be
// named — but before giving up on a required skill, a same-meaning check
// (via embedding similarity) catches differently-spelled versions of the
// same tool so "React.js" doesn't fail to match a project that asked for
// "React". This is deliberately not a second, competing score: embeddings
// only decide whether two strings refer to the same skill, they never
// change how the final score is computed.
export const computeSkillMatch = async (candidateSkills, project) => {
  const required = [...new Set([...(project.skillsRequired || []), ...(project.techStack || [])])];

  if (required.length === 0 || !candidateSkills || candidateSkills.length === 0) {
    return { score: 0, matchedSkills: [] };
  }

  const candidateList = candidateSkills.filter(Boolean);
  const candidateSet = new Set(candidateList.map(normalize));

  // Exact match first — free, instant, no API call involved.
  const matchedSkills = required.filter((skill) => candidateSet.has(normalize(skill)));

  const unmatchedRequired = required.filter((skill) => !matchedSkills.includes(skill));
  const matchedNormalized = new Set(matchedSkills.map(normalize));
  const unmatchedCandidate = candidateList.filter((skill) => !matchedNormalized.has(normalize(skill)));

  // Synonym pass — only runs on what exact match missed, so most candidates
  // never touch the embedding API at all.
  if (unmatchedRequired.length > 0 && unmatchedCandidate.length > 0) {
    const embeddings = await getEmbeddings([...unmatchedRequired, ...unmatchedCandidate]);

    unmatchedRequired.forEach((reqSkill) => {
      const reqVector = embeddings.get(normalize(reqSkill));
      if (!reqVector) return; // embedding fetch failed — stay exact-match-only for this skill

      const hasSynonym = unmatchedCandidate.some((candSkill) => {
        const candVector = embeddings.get(normalize(candSkill));
        return candVector && cosineSimilarity(reqVector, candVector) >= SYNONYM_THRESHOLD;
      });

      if (hasSynonym) {
        matchedSkills.push(reqSkill);
      }
    });
  }

  return {
    score: matchedSkills.length / required.length,
    matchedSkills,
  };
};
