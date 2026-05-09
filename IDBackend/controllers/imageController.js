import Image from '../models/Image.js';

export const saveImageMetadata = async (req, res) => {
  try {
    const { title, category, instaUrl } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const image = new Image({
      imageUrl: `/uploads/${req.file.filename}`,
      title,
      category,
      instaUrl,
    });

    await image.save();

    res.status(201).json({ message: 'Image uploaded successfully', image });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server error while uploading', error });
  }
};
