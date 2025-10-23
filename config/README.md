# CV Configuration

This folder contains the configuration for your CV download button.

## How to Change Your CV File

1. **Add your new CV file** to the `assets/documents/` folder
2. **Update the configuration** in `cvConfig.ts`:

```typescript
export const cvConfig = {
  // Change this to your new CV filename
  fileName: 'Your_New_CV_Name.pdf',
  
  // Change this to what users will see when downloading
  displayName: 'Your_New_CV_Name.pdf',
  
  // Optional: Change the button text
  buttonText: 'Download CV',
  
  // Optional: Customize button styling
  buttonClass: 'bg-emerald-600 text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-500 transition-all duration-300 transform hover:-translate-y-1'
};
```

## Example

If you want to change to a new CV file called `CV_Updated_2024.pdf`:

1. Place `CV_Updated_2024.pdf` in `assets/documents/`
2. Update `cvConfig.ts`:
   ```typescript
   fileName: 'CV_Updated_2024.pdf',
   displayName: 'CV_Updated_2024.pdf',
   ```

That's it! The CV button will automatically use your new file.

## Features

- ✅ **Dynamic file loading**: No need to restart the dev server
- ✅ **Error handling**: Shows helpful error messages if file not found
- ✅ **Loading states**: Button shows "Loading..." while fetching the file
- ✅ **Flexible naming**: You can customize the download filename
- ✅ **Easy updates**: Just change the config file and add your new CV
