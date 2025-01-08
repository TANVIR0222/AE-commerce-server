import {Router} from 'express';
import { addAddress, deleteAddress, getAddressSingleUser, updateAddress } from '../controller/address.controller.js';

const router = Router();

router.route('/add-address/:id').post(addAddress)
router.route('/get-single-user-address/:id').get(getAddressSingleUser)
router.route('/update-address/:id').put(updateAddress)
router.route('/delete-address/:id').delete(deleteAddress)

export default router;  //exportando o router para ser usado em outro arquivo