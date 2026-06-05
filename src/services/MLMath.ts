// Mathematical utilities for ML models

/**
 * Calculates the Cosine Similarity between two vectors.
 * Returns a value between -1 and 1. (1 is identical, 0 is orthogonal, -1 is opposite)
 * Typically, a threshold like 0.6 or 0.7 is used for Face Recognition.
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Basic Euclidean Distance calculation for 2D points (x, y)
 */
export const euclideanDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

/**
 * Calculates the Eye Aspect Ratio (EAR) to detect blinks.
 * Using 6 points that map the eye (standard facial landmark approach).
 */
export const calculateEAR = (eyePoints: { x: number; y: number }[]): number => {
  if (eyePoints.length < 6) return 0;
  
  // vertical distances
  const v1 = euclideanDistance(eyePoints[1], eyePoints[5]);
  const v2 = euclideanDistance(eyePoints[2], eyePoints[4]);
  
  // horizontal distance
  const h = euclideanDistance(eyePoints[0], eyePoints[3]);
  
  // EAR formula
  return (v1 + v2) / (2.0 * h);
};
