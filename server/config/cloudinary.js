import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Local Storage Cloudinary Mock
// Saves base64 images to local disk to avoid "max_allowed_packet" database errors
const mockCloudinary = {
    config: () => { },
    uploader: {
        upload: async (image, options = {}) => {
            try {
                // If it's already a URL, return it
                if (image.startsWith('http')) {
                    return { secure_url: image };
                }

                // Extract base64 data
                const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                    throw new Error('Invalid input string');
                }

                const type = matches[1];
                const data = matches[2];
                const buffer = Buffer.from(data, 'base64');

                // Generate unique filename
                const extension = type.split('/')[1];
                const filename = `product_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
                const filePath = path.join(uploadDir, filename);

                // Write to disk
                fs.writeFileSync(filePath, buffer);

                // Return URL (Always use backend port for images, never frontend URL_PREFIX)
                const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
                const fileUrl = `${baseUrl}/uploads/${filename}`;

                console.log(`[MockCloudinary] Saved image to ${filePath}`);

                return {
                    secure_url: fileUrl,
                    public_id: filename,
                    folder: options.folder || 'uploads'
                };
            } catch (error) {
                console.error('[MockCloudinary] Error saving image:', error);
                throw error;
            }
        },
        destroy: async (publicId) => {
            try {
                const filePath = path.join(uploadDir, publicId);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return { result: 'ok' };
            } catch (error) {
                console.error('[MockCloudinary] Error deleting image:', error);
                return { result: 'fail' };
            }
        }
    }
};

const cloudinary = mockCloudinary;
export default cloudinary;