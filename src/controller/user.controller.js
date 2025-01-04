import { UserModel } from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import sendEmail from "../utils/sendEmail.js";
import imageUploadeCloudinary from "../utils/cloudinary.js";
// import sendEmail from "../utils/sendEmail.js";


// generate Access And Referesh Tokens
const generateAccessAndRefereshTokens =  async(userId) => {
    
    try {
        
        const user = await UserModel.findById(userId)

        const accessToken = user.generateAccessToken()    // user.generateAccessToken()  get user model      
        const refreshToken = user.generateRefreshToken()

        user.refresh_token = refreshToken ; // insert user refreshToken

        await user.save({ validateBeforeSave: false }) 

        return {accessToken, refreshToken};

    } catch (error) {
       throw new ApiError(500, "Some thing went wrong while refarsh and access token");
    }
}

// cookies optins 
const options = {
    httpOnly: true,
    secure : true,
}

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

    // save use info data base 
    const user = await UserModel.create({
        firstname,
        lastname,
        email,
        password,
    });
    


    const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${user?._id}`;

    await sendEmail({
      sendTo: email,
      subject: "Verify email from binkeyit",
      html: verifyEmailTemplate({
        name: `${firstname} ${lastname}`,
        url: VerifyEmailUrl,
      }),
    });


    const createUser = await UserModel.findById(user._id) //.select(" -password");

    if (!createUser) {
        throw new ApiError(500, "Some thing went wrong while register user");
    }

    return res.status(201).json( new ApiResponse(200, createUser , "user register success full ") );

});


// verifyEmail 
const verifyEmail = asyncHandler(async(req,res) =>{

    try {

        //  code is id of user
        const {code} = req.body;
        //  find user by id
        const user = await UserModel.findById({_id: code})

        if (!user) {
            throw new ApiError(401 , "user not found")
        }
        
        //  update user email verified
        const userEmailVerify = await UserModel.updateOne({_id : code} , {verify_email : true});
        if(!userEmailVerify) {
            throw new ApiError(401 , "user email not verified")
        }

        res
        .status(200)
        .json(new ApiResponse(200 , {message : "email verified"} , "email verified"))

    } catch (error) {
        throw new ApiError(500, error?.message || "email verification failed")
        
    }

})

// user login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check  Email
    if (!email) {
        throw new ApiError(404, "Email is required");
    }

    // find user data base 
    const user = await UserModel.findOne({email});
    // not found user 
    if (!user) {
        throw new ApiError(404, "Invalid email ");
    }

    // match user send password === data base password  
    const matchPassword =  await user.isPasswordCorrect(password) // check password  // userModel isPasswordCorrect
    if (!matchPassword) {
        throw new ApiError(404, "Invalid user credentials");
    }

    // crete accessToken, refreshToken
    const  {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    // find user data base 
    const loginUser = await UserModel.findById(user._id)

    // set token in cookie and only
    

    res.status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(new ApiResponse(200, { user: loginUser._id , accessToken , refreshToken} , "user login success full "));
})

const logoutUser = asyncHandler(async (req,res) => {

    //  get verifyJwt ->  req.user._id  // logout refresh_token 
    await UserModel.findByIdAndUpdate(req.user._id ,
        {
            $set: {
                refresh_token : undefined
            }
            
        },
        {
            new : true
        }
    )


    res.status(200)
    .clearCookie("accessToken"  , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200, {} , "user logout success full "));

})


// refresh Access Token

const refreshAccessToken = asyncHandler(async (req,res) => {

    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken) {
            throw new ApiError( 401 ,"refresh token is required")
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken,  process.env.REFRESH_TOKEN_SECRET);
    
        const user = await UserModel.findById(decodedToken._id);
        if(!user) {
            throw new ApiError( 401 ,"user not found")
        }
    
        // incomingRefreshToken !=== user.refresh_token
        if (incomingRefreshToken !== user.refresh_token) {
            throw new ApiError( 401 ,"refresh token is invalid")
        }
    
        const {accessToken, newRefreshToken} =  await generateAccessAndRefereshTokens(user._id);
    
        res
        .status(200)
        .cookie('accessToken' , accessToken , options)
        .cookie('refreshToken' , newRefreshToken , options)
        .json(new ApiResponse(200, {accessToken , refreshToken:newRefreshToken} , "refresh token success"));
    } catch (error) {
        throw new ApiError( 401 , error?.message || "refresh token is invalid")
    }

    

})


// user image uploade 
const updateImage  = asyncHandler(async (req,res) => {
    
    try {
        const {id} = req.params ;
        const {image} = req.body ;
    
        const user = await UserModel.findById(id);
        if(!user) {
            throw new ApiError( 400 ,"user not found")
        }
    
        const update = await UserModel.findByIdAndUpdate( { _id: id} , { $set: { avatar : image } } , { new: true } );
        res.status(200).json(new ApiResponse(200, update, "image updated successfully"));
    } catch (error) {
        throw new ApiError( 500 , error?.message || "image not updated")
    }

    
})

export { registerUser  , loginUser  , logoutUser , refreshAccessToken , verifyEmail , updateImage  } ;  // export all the functions  // export all the functions  // export
