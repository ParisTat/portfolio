// CV download settings. The file itself is always assets/documents/cv.pdf:
// to update the CV, overwrite that file and commit (git keeps old versions).
export const cvConfig = {
  // Name the visitor's browser saves the download as
  downloadName: 'Paris_Rafail_Tataridis_CV.pdf',

  buttonText: 'Download CV',

  buttonClass: 'bg-emerald-600 text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-500 transition-all duration-300 transform hover:-translate-y-1'
};
