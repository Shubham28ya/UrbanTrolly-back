// // import mongoose from 'mongoose';

// // const MediaSchema = new mongoose.Schema({
// //   type: { type: String, enum: ['image', 'video'], required: true },
// //   url: { type: String, required: true },
// // });

// // const HeroSectionSchema = new mongoose.Schema({
// //   title: { type: String },
// //   message: { type: String },
// //   backgroundColor: { type: String, default: '#ffffff' },
// //   media: [MediaSchema],
// // }, { timestamps: true });

// // const HeroSection = mongoose.model('HeroSection', HeroSectionSchema);
// // export default HeroSection;
// import mongoose from 'mongoose';

// const mediaSchema = new mongoose.Schema({
//   mediaType: {
//     type: String,
//     enum: ['Image', 'Video'],
//     required: true,
//   },
//   url: {
//     type: String,
//     required: true,
//   },
//   caption: {
//     type: String,
//   },
// });

// const heroSectionSchema = new mongoose.Schema({
//   title: { type: String },
//   message: { type: String },
//   backgroundColor: { type: String },
//   media: [mediaSchema],
// });

// const HeroSection = mongoose.model('HeroSection', heroSectionSchema);
// export default HeroSection;
