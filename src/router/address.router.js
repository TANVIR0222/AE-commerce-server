import {Router} from 'express';
import { addAddress, getAddressSingleUser, updateAddress } from '../controller/address.controller.js';

const router = Router();

router.route('/add-address/:id').post(addAddress)
router.route('/get-single-user-address/:id').get(getAddressSingleUser)
router.route('/update-address/:id').put(updateAddress)

export default router;  //exportando o router para ser usado em outro arquivo