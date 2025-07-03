
// import uploadFileFeature from '@adminjs/upload';
// import HeroSection from '../models/HeroSection.js';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // Set up the upload feature
// const heroUploadFeature = uploadFileFeature({
//   provider: {
//     local: {
//       bucket: path.join(__dirname, '../../uploads'), // Save to /uploads folder
//     },
//   },
//   properties: {
//     key: 'media.$.url',            // Path to the file URL
//     mimeType: 'media.$.mimeType',  // Optional
//     bucket: 'media.$.bucket',      // Optional
//     file: 'media.$.file',          // Virtual property to upload file
//   },
//   uploadPath: (record, filename) => {
//     return `hero/${Date.now()}-${filename}`;
//   },
// });

// const heroSectionAdminOptions = {
//   resource: HeroSection,
//   options: {
//     properties: {
//       'media.$.url': {
//         isVisible: {
//           list: true,
//           filter: true,
//           show: true,
//           edit: true,
//         },
//       },
//       'media.$.caption': { type: 'string' },
//       'media.$.mediaType': {
//         availableValues: [
//           { value: 'Image', label: 'Image' },
//           { value: 'Video', label: 'Video' },
//         ],
//       },
//     },
//   },
//   features: [heroUploadFeature],
// };

// export default heroSectionAdminOptions;
