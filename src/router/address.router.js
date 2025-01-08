import {Router} from 'express';
import { addAddress } from '../controller/address.controller.js';

const router = Router();

router.route('/add-address/:id').post(addAddress)

export default router;  //exportando o router para ser usado em outro arquivo