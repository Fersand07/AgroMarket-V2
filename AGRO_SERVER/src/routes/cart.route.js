import express from 'express';
import { body } from 'express-validator';
import { getCart, addToCart, removeFromCart, clearCart, updateCartItems } from '../controllers/cart.controller.js';
import { requireToken } from '../middlewares/requireToken.js';

const router = express.Router();

router.get('/', requireToken, getCart);

router.post(
    '/add',
    [
        body('productId', 'Product ID is required').not().isEmpty(),
        body('quantity', 'Quantity must be a positive number').isInt({ gt: 0 }),
        requireToken
    ],
    addToCart 
);

router.delete(
    '/remove',
    [
        body('productId', 'Product ID is required').not().isEmpty(),
        requireToken
    ],
    removeFromCart 
);

router.post('/clear', requireToken, clearCart); 

router.patch(
    '/update',
    [
        body('items', 'Items array is required and cannot be empty').isArray().notEmpty(),
        body('items.*.productId', 'Product ID is required').not().isEmpty(),
        body('items.*.quantity', 'Quantity must be a positive number').isInt({ gt: 0 }),
        requireToken
    ],
    updateCartItems
);

export default router;