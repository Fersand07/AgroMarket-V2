import { ShoppingCart } from '../models/shoppingCart.js';
import { Product } from '../models/Product.js';
import jwt from 'jsonwebtoken';

export const getCart = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        const cart = await ShoppingCart.findOne({ user: id }).populate('items.product').lean();
        if (!cart) {
            // Cart document does not exist for this user
            return res.status(200).json({ user: id, items: [] });
        }
        // Cart exists, even if items array is empty, return it
        return res.status(200).json(cart);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const addToCart = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        const { productId, quantity } = req.body;

        // Fetch the product to check stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await ShoppingCart.findOne({ user: id });
        if (!cart) {
            cart = new ShoppingCart({ user: id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        let newQuantity = quantity;
        if (itemIndex > -1) {
            newQuantity = cart.items[itemIndex].quantity + quantity;
        }

        if (newQuantity > product.stock) {
            return res.status(400).json({ message: `Cannot add more than ${product.stock} items to cart. Current stock is ${product.stock}.` });
        }

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        const { productId } = req.body;

        const cart = await ShoppingCart.findOne({ user: id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
        return res.status(200).json(cart);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const clearCart = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        
        const cart = await ShoppingCart.findOne({ user: id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        cart.items = [];
        await cart.save();
        return res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const updateCartItems = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        const { items } = req.body; // items: [{ productId, quantity }, ...]

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items array is required and cannot be empty." });
        }

        const cart = await ShoppingCart.findOne({ user: id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        let updated = false;
        let errors = [];

        items.forEach(({ productId, quantity }) => {
            // Validate quantity
            if (typeof quantity !== 'number' || quantity < 1) {
                errors.push({ productId, message: "Quantity must be a positive integer." });
                return;
            }
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = quantity;
                updated = true;
            } else {
                // Not adding new items, just collect error
                errors.push({ productId, message: "Item not found in cart." });
            }
        });

        if (updated) {
            await cart.save();
        }

        return res.status(200).json({
            cart,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}
