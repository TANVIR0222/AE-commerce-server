import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from "helmet";
import morgan from 'morgan';



const app = express();

app.use(cors({
    origin: `${process.env.CORS_ORIGIN}`,
    credentials: true
}));

// single time request client side data limit 16kb
app.use(express.json({limit: "16kb"}));
// url req % , %20 itcj
app.use(express.urlencoded({extended: true , limit: "16kb"}));
// cookieParser
app.use(cookieParser());
// 
app.use(express.static('public'));
// secure Express apps by setting HTTP response headers.
app.use(helmet());
// HTTP request logger middleware for node.js
app.use(morgan())



// import routes
import userRoutes from './router/user.route.js';
import imageRoutes from './router/uploadeAllImage.router.js';



// route declaration 
app.use('/api/v1/user' , userRoutes);
app.use('/api/v1/all' , imageRoutes);

export {app}