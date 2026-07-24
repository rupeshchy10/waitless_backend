import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folder = "WaitLess") => {
    if (!localFilePath) return null;

    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder,
            resource_type: "image",
        });

        return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
        throw new ApiError(500, `Image upload failed: ${error.message}`);
    } finally {
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error("Failed to delete temporary file:", err.message);
            }
        });
    }
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error(
            `Failed to delete Cloudinary asset "${publicId}":`,
            error.message
        );
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
