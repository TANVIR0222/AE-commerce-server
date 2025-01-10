import { Router } from "express";
import { addProduct, getAllProduct } from "../controller/product.controller.js";

const router = Router();

router.route('/product-uploade').post( addProduct )
router.route('/all-product').get( getAllProduct )

export default router;  //export the router to use in other files.  //export the router to