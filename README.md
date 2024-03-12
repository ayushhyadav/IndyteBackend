# Indyte Backend
### file upload
```npm install @uploadthing/react```


# Usage 
* make a btn component
```
import { generateUploadButton } from "@uploadthing/react";
 
export const UploadButton = generateUploadButton({
  url: "https://your-server.com/api/uploadthing",
});
// 
```
* following/below implementation may not work exactly like this refer ro uploadthing docs react
```
 <UploadButton
   
    onClientUploadComplete={(res) => {
      // Do something with the response
      console.log("Files: ", res);
      alert("Upload Completed");
    }}
    onUploadError={(error: Error) => {
      // Do something with the error.
      alert(`ERROR! ${error.message}`);
    }}
    onBeforeUploadBegin={(files) => {
      // Preprocess files before uploading (e.g. rename them)
      return files.map(
        (f) => new File([f], "renamed-" + f.name, { type: f.type }),
      );
    }}
    onUploadBegin={(name) => {
      // Do something once upload begins
      console.log("Uploading: ", name);
    }}
  />
  ```

