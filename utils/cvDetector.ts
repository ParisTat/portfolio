// CV Detection Utility
// This utility helps automatically detect the most recent CV file

export interface CVFile {
  name: string;
  path: string;
  lastModified?: Date;
}

// Known CV files in order of preference (most recent first)
// Add new CV files here when you create them
export const KNOWN_CV_FILES: string[] = [
  'Paris_Tataridis_CV_Updated.pdf',
  'CV_Tataridis_Paris_Rafail_postGrad.pdf',
  // Add more CV files here as you create them
];

// Function to get the most recent CV file
export const getMostRecentCV = async (): Promise<CVFile | null> => {
  // Try each file in order of preference
  for (const fileName of KNOWN_CV_FILES) {
    try {
      // Use direct path instead of dynamic import to avoid Vite warnings
      const cvPath = `/assets/documents/${fileName}`;
      
      // Test if file exists by trying to fetch it
      const response = await fetch(cvPath, { method: 'HEAD' });
      if (response.ok) {
        return {
          name: fileName,
          path: cvPath,
          lastModified: new Date() // We can't get actual file date in browser, so use current time
        };
      }
    } catch (err) {
      // File doesn't exist, try next one
      continue;
    }
  }
  
  return null;
};

// Function to add a new CV file to the detection list
export const addCVFile = (fileName: string) => {
  if (!KNOWN_CV_FILES.includes(fileName)) {
    KNOWN_CV_FILES.unshift(fileName); // Add to beginning (most recent)
  }
};

// Function to get all available CV files
export const getAllCVFiles = async (): Promise<CVFile[]> => {
  const cvFiles: CVFile[] = [];
  
  for (const fileName of KNOWN_CV_FILES) {
    try {
      const cvPath = `/assets/documents/${fileName}`;
      
      // Test if file exists by trying to fetch it
      const response = await fetch(cvPath, { method: 'HEAD' });
      if (response.ok) {
        cvFiles.push({
          name: fileName,
          path: cvPath,
          lastModified: new Date()
        });
      }
    } catch (err) {
      // File doesn't exist, skip it
      continue;
    }
  }
  
  return cvFiles;
};
