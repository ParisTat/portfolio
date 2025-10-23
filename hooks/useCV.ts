import { useState, useEffect } from 'react';
import { cvConfig } from '../config/cvConfig';
import { getMostRecentCV, getAllCVFiles, addCVFile } from '../utils/cvDetector';

export const useCV = () => {
  const [cvUrl, setCvUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedFileName, setDetectedFileName] = useState<string>('');
  const [availableCVs, setAvailableCVs] = useState<string[]>([]);

  useEffect(() => {
    const loadCV = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all available CV files
        const allCVs = await getAllCVFiles();
        setAvailableCVs(allCVs.map(cv => cv.name));
        
        // Get the most recent CV file
        const mostRecentCV = await getMostRecentCV();
        
        if (mostRecentCV) {
          setCvUrl(mostRecentCV.path);
          setDetectedFileName(mostRecentCV.name);
          console.log(`✅ CV detected: ${mostRecentCV.name}`);
        } else {
          throw new Error('No CV files found in assets/documents/');
        }
      } catch (err) {
        console.error('Failed to load CV file:', err);
        setError('CV file not found. Please ensure you have a CV file in assets/documents/');
        
        // Fallback: try to use the first available file
        if (availableCVs.length > 0) {
          setCvUrl(`/assets/documents/${availableCVs[0]}`);
          setDetectedFileName(availableCVs[0]);
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
