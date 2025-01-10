import { Router } from "express";
import { addProduct, getAllProduct, getSingleProductById } from "../controller/product.controller.js";

const router = Router();

router.route('/product-uploade').post( addProduct )
router.route('/all-product').get( getAllProduct )
router.route('/single-product/:id').get( getSingleProductById )

export default router;  //export the router to use in other files.  //export the router to