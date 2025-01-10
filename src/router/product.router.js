import { Router } from "express";
import { addProduct, deleteProduct, getAllProduct, getSingleProductById, updateProduct } from "../controller/product.controller.js";

const router = Router();

router.route('/product-uploade').post( addProduct )
router.route('/all-product').get( getAllProduct )
router.route('/single-product/:id').get( getSingleProductById )
router.route('/update-product/:id').put( updateProduct )
router.route('/delete-product/:id').delete( deleteProduct )

export default router;  //export the router to use in other files.  //export the router to