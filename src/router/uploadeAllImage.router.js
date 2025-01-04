import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import imageUploage from "../controller/uploadeImage.js";

const router = Router();

router.route('/image-uploade').post(upload.single('image') , imageUploage )

export default router;  //export the router to use in other files.  //export the router to