import express from "express";
import { body } from 'express-validator';
import { userCreatedProduct, getAllProducts, getProductById, getProductsPostedByUser, getProductByCategory, updateProductCreatedByUser, deleteProductCreatedByUser, buyProductWithUserCredit, getNearbyProducts } from "../controllers/products.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = express.Router();

router.post('/create', requireToken, userCreatedProduct);//✅
router.get('/all', getAllProducts);//✅
router.get('/nearby', requireToken, getNearbyProducts);
router.get('/:id', getProductById);//✅
router.get('/category/:id', getProductByCategory);//✅
router.get('/user/ownProducts', requireToken, getProductsPostedByUser);//✅
router.patch('/update/:id', requireToken, updateProductCreatedByUser);//✅
router.delete('/delete/:id', requireToken, deleteProductCreatedByUser);//✅
router.post('/buy/:id', requireToken, buyProductWithUserCredit);//✅




export default router;