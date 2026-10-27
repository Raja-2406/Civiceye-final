import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgbrtqskx',
  api_key: process.env.CLOUDINARY_API_KEY || '547955986139263',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'jXeJxCJsSVKF1qeC9VvcmgYj75o',
});

/**
 * Upload local file to Cloudinary
 * @param {string} localFilePath - Path to file stored by multer
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (localFilePath, folder = 'civiceye_evidence') => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1280, height: 960, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // Clean up local temp file after cloud upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('[Cloudinary Upload Error]', error.message);
    // Return relative local path if cloud upload fails
    return null;
  }
};

export default cloudinary;
