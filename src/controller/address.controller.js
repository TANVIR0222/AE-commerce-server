import AddressModel from "../model/address.model.js";
import { UserModel } from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// Add a new address
const addAddress = asyncHandler(async (req,res) => {

    const {id} = req.params;
    const {addressline,city,state,pincode,country,mobile} = req.body;

    // check if user exists
    if(
        [addressline,city,state,pincode,country,mobile].some((field) => field.trime === "")
    ){
        throw new ApiError(400, "Please fill in all fields");
    }


    // save address
    const userAddress = await AddressModel({
        userId : id,
        addressline,
        city,
        state,
        pincode,
        country,
        mobile,
    });

    // save address to database
    const savedAddress = await userAddress.save();


    // update user with new address
    const user = await UserModel.updateOne({_id : id} , {$push : {address_details : savedAddress._id}} , {new : true});
    res.status(201).json(new ApiResponse(201 , user , "Address added successfully"));

    
})

// get all addresses user 
const getAddressSingleUser = asyncHandler(async (req,res) => {
    const {id} = req.params;
    // get all addresses of AddressModel
    const userAddress = await AddressModel.find({userId : id}).sort({createdAt : -1});
    res.status(200).json(new ApiResponse(200 , userAddress , "Address fetched successfully"));
})

export { addAddress , getAddressSingleUser}