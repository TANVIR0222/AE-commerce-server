import { UserModel } from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import { generateOTP } from "../utils/generateOTP.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";


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
        res.status(401).json(new ApiResponse(401, {} , "user not found"));
    }

    // match user send password === data base password  
    const matchPassword =  await user.isPasswordCorrect(password) // check password  // userModel isPasswordCorrect
    if (!matchPassword) {
        res.status(401).json(new ApiResponse(401 , {} , "Password not match"));
    }

    // crete accessToken, refreshToken
    const  {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    // find user data base 
    const loginUser = await UserModel.findById(user._id)

    //user last login time update 
    await UserModel.updateOne({_id : user._id} , {last_login_date : Date.now()} , {new : true})
    

    res.status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(new ApiResponse(200, { id: loginUser._id , accessToken , refreshToken} , "user login success full "));
})

const logoutUser = asyncHandler(async (req,res) => {

    const userid = req.userId;

    // removeRefreshToken form data base
    await UserModel.findByIdAndUpdate(userid, {
      refresh_token: "",
    });


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


const updateUseDeatils = asyncHandler(async(req,res) => {
    try {
        const {id} = req.params ;
        const {firstname , lastname , email , number , password , image } = req.body ;
    
        const updateData = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            number: number,
            avatar : image
        };
        
        // Hash the password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash password manually
            updateData.password = hashedPassword;
        }
        
        const update = await UserModel.findByIdAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true } // Return the updated document
        );
        
        res.status(200).json(new ApiResponse(200, update, "user details updated successfully"));
    } catch (error) {
        throw new ApiError( 500 , error?.message || "image not updated")
    }

})

// get user details
const getSingleUser = asyncHandler(async (req,res) => {
   try {
     const {id} = req.params ;
     if (!id) {
        throw new ApiError(400, "id is required");
     }
     const user = await UserModel.findById({_id : id}).select("-password -refresh_token -forgot_password_expiry  -last_login_date")
     if (!user) {
        throw new ApiError(404, "user not found");
     }
     res.status(200).json(new ApiResponse(200, user, "user found successfully"));
   } catch (error) {
     throw new ApiError(500, error?.message || "user not found")
   }

})


const forgotPassword = asyncHandler(async (req, res) => {
    const {email} = req.body;
    if (!email) {
        throw new ApiError(400, "email is required");
    }
    const user = await UserModel.findOne({email : email});
    if (!user) {
        res.status(404).json(new ApiResponse(404,  "user not found"));
    }

    const otp = generateOTP()
    // Expire in 15 minutes
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000);


    //  Update forgot_password_otp and  forgot_password_expiry
    const update = await UserModel.findByIdAndUpdate({_id : user._id} , 
        {$set : {
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expiryDate).toISOString()
        }
    }, {new : true});

    await sendEmail({
        sendTo: email,
        subject: "Verify email from binkeyit",
        html: forgotPasswordTemplate({
            name: `${user.firstname} ${user.lastname}`,
            otp: otp,
        }),
    });
    
    res.status(200).json(new ApiResponse(200, {} , "check your email for otp"));


})

const verifyForgotPasswordOTP = asyncHandler(async (req, res)=>{

    const {email , otp} = req.body;
    
    if (!email || !otp) {
        throw new ApiError(400, "email and otp are required");
    }
    
    const user = await UserModel.findOne({email : email});
    if (!user) {
        throw new ApiError(404, "user not found");
    }

    //  Check if otp is valid
    if(user.forgot_password_expiry < new Date()){
        return res.status(400).json(new ApiResponse(400, {} ,"otp is expired"));
    }
    
    if(user.forgot_password_otp !== otp){
        return res.status(400).json(new ApiResponse(400, {} , "invalid otp"));
    }

    const updateOtp = await UserModel.findByIdAndUpdate({_id : user._id} ,{$set : 
        {
            forgot_password_otp : null,
            forgot_password_expiry : null
        }
    }, {new : true});


    res
    .status(200)
    .json(new ApiResponse(200, "otp is valid"));
 

})


// reset password
const resetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // find user
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Assign plain password (hook will hash it)
    user.password = password;
    await user.save();

    res.status(200).json(new ApiResponse(200, {} , "Password is updated successfully"));


})


export {resetPassword ,verifyForgotPasswordOTP ,registerUser  , loginUser  , logoutUser , refreshAccessToken , verifyEmail , updateUseDeatils  , getSingleUser , forgotPassword} ;  // export all the functions  // export all the functions  // export
