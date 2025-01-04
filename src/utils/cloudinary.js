import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECET_KEY, // Click 'View API Keys' above to copy your API secret
});

const imageUploadeCloudinary = async (image) => {
  try {
    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(image)
      .catch((error) => {
        console.log(error);
    });
    const {secure_url} =   uploadResult;
    
    
    return secure_url;
  } catch (error) {
    throw new ApiError(500 , error?.message || "Failed to upload image cloudinary");
  }

};

export default imageUploadeCloudinary; // Export the function to be used elsewhere
