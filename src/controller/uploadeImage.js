import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import imageUploadeCloudinary from "../utils/cloudinary.js";

const imageUploage = asyncHandler(async(req,res) =>{
    try {
        // send image user to client 
        const imagePath  = req.file.path;
        if(!imagePath){
            throw new ApiError(400 , 'image not found');
        }

        // raw image conver to link
        const image  = await imageUploadeCloudinary(imagePath)
        
        res.status(200).json(new ApiResponse(200 , image, 'image uploaded successfully'));

    } catch (error) {
        throw new ApiError(400 , error?.message || 'image not found image cploage cloudinary');
    }
})
export default imageUploage;