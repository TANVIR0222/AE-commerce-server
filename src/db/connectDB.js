import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export const connectDB = async () => {
    try {
        
        const connectionInstance  = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
        console.log(`MongoDB Connected !! DB Host ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log('Mongodb connection Faild : ', error);
        process.exit(1)
        
    }
}
export default connectDB;  //exporting the function to use it in other files.  //