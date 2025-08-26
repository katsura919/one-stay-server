const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer
 * @param {Object} options - Upload options
 * @returns {Promise} - Cloudinary upload result
 */
const uploadImage = async (fileBuffer, options = {}) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: 'resorts', // Organize uploads in folders
                resource_type: 'image',
                format: 'jpg', // Convert to jpg for consistency
                quality: 'auto:good', // Optimize quality
                transformation: [
                    { width: 1200, height: 800, crop: 'fill' }, // Standardize dimensions
                    { quality: 'auto:good' }
                ],
                ...options
            };

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(fileBuffer);
        });
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise} - Cloudinary delete result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
const extractPublicId = (url) => {
    try {
        // Extract public ID from Cloudinary URL
        // Example: https://res.cloudinary.com/cloudname/image/upload/v1234567890/resorts/abc123.jpg
        const parts = url.split('/');
        const fileWithExtension = parts[parts.length - 1];
        const fileName = fileWithExtension.split('.')[0];
        const folder = parts[parts.length - 2];
        return `${folder}/${fileName}`;
    } catch (error) {
        return null;
    }
};

module.exports = {
    uploadImage,
    deleteImage,
    extractPublicId,
    cloudinary
};
