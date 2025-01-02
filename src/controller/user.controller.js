import { UserModel } from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// user register 
const registerUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    if (
        [firstname, lastname, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Please fill in all fields");
    }
    
    // check if email is already in use register or not

    const existingUser = await UserModel.findOne({ $or :[{email}] });

    if (existingUser) {
        throw new ApiError(400, "Email already exists");
    }

    
    const user = await UserModel.create({
        firstname,
        lastname,
        email,
        password,
    });
    

    const createUser = await UserModel.findById(user._id) //.select(" -password");

    if (!createUser) {
        throw new ApiError(500, "Some thing went wrong while register user");
    }

    return res.status(201).json( new ApiResponse(200, createUser , "user register success full ") );

});

export { registerUser };
