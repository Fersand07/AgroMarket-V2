import { ShoppingCart } from '../models/shoppingCart.js';
import jwt from 'jsonwebtoken';

export const getCart = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        const cart = await ShoppingCart.findOne({ user: id }).populate('items.product').lean();
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
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

        let cart = await ShoppingCart.findOne({ user: id });
        if (!cart) {
            cart = new ShoppingCart({ user: id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
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
        
        await ShoppingCart.findOneAndDelete({ user: id });
        return res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const updateCartItem = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        const { productId, quantity } = req.body;

        const cart = await ShoppingCart.findOne({ user: id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}