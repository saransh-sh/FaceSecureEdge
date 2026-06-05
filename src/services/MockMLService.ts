import { getDB } from '../database/db';
import { cosineSimilarity } from './MLMath';

export const lookupEmployee = (employeeId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate slight delay
    setTimeout(() => {
      try {
        const db = getDB();
        const result = db.getFirstSync('SELECT id FROM employees WHERE id = ?', [employeeId]) as { id: string } | null;
        resolve(!!result);
      } catch (e) {
        console.error('Error in lookupEmployee:', e);
        resolve(false);
      }
    }, 500);
  });
};

export const verifyFace = (employeeId: string, liveEmbedding: number[] | null): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const db = getDB();
      const result = db.getFirstSync('SELECT id, embedding FROM employees WHERE id = ?', [employeeId]) as { id: string, embedding: string } | null;

      let isSuccess = false;

      if (result && liveEmbedding && result.embedding) {
        // Parse the stored embedding (saved as a JSON string array)
        const storedEmbedding: number[] = JSON.parse(result.embedding);

        // Calculate similarity
        const similarity = cosineSimilarity(liveEmbedding, storedEmbedding);
        console.log(`Cosine Similarity score for ${employeeId}:`, similarity);

        // Threshold for MobileFaceNet is typically around 0.6
        isSuccess = similarity > 0.6;
      } else if (!liveEmbedding && result) {
         // Fallback to mock success if testing on emulator without camera
         console.log('No live embedding provided. Falling back to mock auth.');
         isSuccess = Math.random() > 0.2;
      }

      // Log the attempt
      const stmt = db.prepareSync('INSERT INTO logs (emp_id, success, synced) VALUES (?, ?, 0)');
      stmt.executeSync([employeeId, isSuccess ? 1 : 0]);

      resolve(isSuccess);
    } catch (e) {
      console.error('Error in verifyFace:', e);
      resolve(false);
    }
  });
};
