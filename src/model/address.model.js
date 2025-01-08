import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    addressline : {
        type : String,
        default : ""
    },
    city : {
        type : String,
        default : ""
    },
    state : {
        type : String,
        default : ""
    },
    pincode : {
        type : String
    },
    country : {
        type : String
    },
    mobile : {
        type : Number,
        default : null
    },
    status : {
        type : Boolean,
        default : true
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    }
},{
    timestamps : true
})

const AddressModel = mongoose.model('Address',addressSchema)

export default AddressModel