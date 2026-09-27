import { useState, useEffect } from 'react';
import { cvConfig } from '../config/cvConfig';
import { getMostRecentCV, getAllCVFiles, type CVFile } from '../utils/cvDetector';

export const useCV = () => {
  const [cvUrl, setCvUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedFileName, setDetectedFileName] = useState<string>('');
  const [availableCVs, setAvailableCVs] = useState<string[]>([]);

  useEffect(() => {
    const loadCV = async () => {
      // Kept local (not read from state) so the catch-block fallback sees the
      // list fetched in this run instead of the stale initial [].
      let allCVs: CVFile[] = [];
      try {
        setLoading(true);
        setError(null);

        // Get all available CV files
        allCVs = await getAllCVFiles();
        setAvailableCVs(allCVs.map(cv => cv.name));

        // Get the most recent CV file
        const mostRecentCV = await getMostRecentCV();

        if (mostRecentCV) {
          setCvUrl(mostRecentCV.path);
          setDetectedFileName(mostRecentCV.name);
        } else {
          throw new Error('No CV files found in assets/documents/');
        }
      } catch (err) {
        console.error('Failed to load CV file:', err);
        setError('CV file not found. Please ensure you have a CV file in assets/documents/');

        // Fallback: try to use the first available file
        if (allCVs.length > 0) {
          setCvUrl(allCVs[0].path);
          setDetectedFileName(allCVs[0].name);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCV();
  }, []);

  // Use detected filename for display name, or fallback to config
  const displayName = detectedFileName || cvConfig.displayName;

  return {
    cvUrl,
    loading,
    error,
    displayName,
    buttonText: cvConfig.buttonText,
    buttonClass: cvConfig.buttonClass,
    detectedFileName,
    availableCVs
  };
};
