import HeroSection from '../models/HeroSection.js';

export const getHeroSection = async (req, res) => {
  try {
    const section = await HeroSection.findOne().sort({ createdAt: -1 });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadMedia = async (req, res) => {
  const files = req.files;

  const media = files.map(file => ({
    type: file.mimetype.startsWith('video') ? 'video' : 'image',
    url: `/uploads/${file.filename}`
  }));

  res.json(media);
};
