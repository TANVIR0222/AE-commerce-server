import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: [true , "Provide Name"],
        trim: true
    },
    lastname: {
        type: String,
        require: [true , "Provide Name"],
        trim: true
    },
    email: {
        type: String,
        require: [true , "Provide Email"],
        trim: true

    },
    password: {
        type: String,
        require: [true , "Provide Password"],
        trim: true

    },
    avatar: {
        type: String,
        default: ''
    },
    number: {
        type: Number,
        default: null,
        trim: true

    },
    refresh_token: {
        type: String,
        default: ''
    },
    verify_email: {
        type: Boolean,
        default: false
    },
    last_login_date: {
        type:  Date,
        default: ''
    },
    status: {
        type: String,
        euum: ["Active" ,"Inactive" , "Suspended"],
        default: 'Active'
    },
    address_details: [
        {
            type: mongoose.Schema.ObjectId,
            ref:'Address'
        },
    ],
    shopping_cart: [
        {
            type: mongoose.Schema.ObjectId,
            ref:'CartProduct'
        },
    ],
    orderHistory: [
        {
            type: mongoose.Schema.ObjectId,
            ref:'Order'
        },
    ],
    forgot_password_otp: {
        type: String,
        default: null
    },
    forgot_password_expiry: {
        type: Date,
        default: null
    },
    
    role:{
        type: String,
        eunm: ["Admin", " USER"],
        default: "USER"
    },

},{timestamps: true});

userSchema.pre("save" , async function(next){

    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password , 10)
    next();
})


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email
        },
        process.env.JWT_ACCESS_SECRET_KEY,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME
        }
    )
}
userSchema.methods.generateRefrshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email
        },
        process.env.JWT_REFRESH_SECRET_KEY,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME
        }
    )
}

export const UserModel = mongoose.model('User', userSchema);

