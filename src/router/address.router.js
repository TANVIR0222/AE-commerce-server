import {Router} from 'express';
import { addAddress, getAddressSingleUser } from '../controller/address.controller.js';

const router = Router();

router.route('/add-address/:id').post(addAddress)
router.route('/get-single-user-address/:id').get(getAddressSingleUser)

export default router;  //exportando o router para ser usado em outro arquivo