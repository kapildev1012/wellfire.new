import { v2 as cloudinary } from "cloudinary";
import connectCloudinary from "./config/cloudinary.js";

const connectCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY,
    });

    console.log("✅ Cloudinary connected");
};

export default connectCloudinary;