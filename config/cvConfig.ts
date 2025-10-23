// CV Configuration - Update this file to change your CV
export const cvConfig = {
  // File name in the assets/documents folder (without path)
  // NOTE: This is now automatically detected - you don't need to change this
  fileName: 'Paris_Tataridis_CV_Updated.pdf', // This will be auto-detected
  
  // Display name for the download (what users see)
  // NOTE: This is now automatically detected from the actual file
  displayName: 'Paris_Tataridis_CV_Updated.pdf', // This will be auto-detected
  
  // Button text
  buttonText: 'Download CV',
  
  // Button styling (optional - you can customize these)
  buttonClass: 'bg-emerald-600 text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-500 transition-all duration-300 transform hover:-translate-y-1'
};

// Helper function to get the CV file URL
export const getCvUrl = () => {
  return `/assets/documents/${cvConfig.fileName}`;
};

// Helper function to get the download filename
export const getCvDownloadName = () => {
  return cvConfig.displayName;
};

// Helper function to get the full file path for imports
export const getCvFilePath = () => {
  return `../assets/documents/${cvConfig.fileName}`;
};
