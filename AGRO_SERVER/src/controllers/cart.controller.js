import { prisma } from '../database/connectdb.js';
import jwt from 'jsonwebtoken';

const formatCart = (cart) => {
    if (!cart) return { items: [] };
    return {
        _id: cart.id,
        user: cart.userId,
        items: (cart.items || []).map(item => ({
            _id: item.id,
            product: item.product ? {
                _id: item.product.id,
                name: item.product.name,
                description: item.product.description,
                price: item.product.price,
                quantity: item.product.quantity,
                image: item.product.image,
                stock: item.product.stock,
                userId: item.product.userId
            } : null,
            quantity: item.quantity
        }))
    };
};

export const getCart = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        
        let cart = await prisma.shoppingCart.findUnique({
            where: { userId: id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        
        if (!cart) {
            return res.status(200).json({ user: id, items: [] });
        }
        
        return res.status(200).json(formatCart(cart));
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

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Get or create ShoppingCart
        let cart = await prisma.shoppingCart.findUnique({
            where: { userId: id },
            include: { items: true }
        });

        if (!cart) {
            cart = await prisma.shoppingCart.create({
                data: { userId: id },
                include: { items: true }
            });
        }

        const existingItem = cart.items.find(item => item.productId === productId);
        let newQuantity = parseInt(quantity);
        if (existingItem) {
            newQuantity += existingItem.quantity;
        }

        if (newQuantity > product.stock) {
            return res.status(400).json({ message: `Cannot add more than ${product.stock} items to cart. Current stock is ${product.stock}.` });
        }

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    shoppingCartId: cart.id,
                    productId,
                    quantity: parseInt(quantity)
                }
            });
        }

        const updatedCart = await prisma.shoppingCart.findUnique({
            where: { userId: id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        return res.status(200).json(formatCart(updatedCart));
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

        const cart = await prisma.shoppingCart.findUnique({
            where: { userId: id },
            include: { items: true }
        });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.items.find(i => i.productId === productId);
        if (item) {
            await prisma.cartItem.delete({ where: { id: item.id } });
        }

        const updatedCart = await prisma.shoppingCart.findUnique({
            where: { userId: id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        return res.status(200).json(formatCart(updatedCart));
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const clearCart = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY);
        
        const cart = await prisma.shoppingCart.findUnique({
            where: { userId: id }
        });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        await prisma.cartItem.deleteMany({
            where: { shoppingCartId: cart.id }
        });

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

        const cart = await prisma.shoppingCart.findUnique({
            where: { userId: id },
            include: { items: true }
        });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        let errors = [];

        for (const { productId, quantity } of items) {
            if (typeof quantity !== 'number' || quantity < 1) {
                errors.push({ productId, message: "Quantity must be a positive integer." });
                continue;
            }

            const existingItem = cart.items.find(i => i.productId === productId);
            if (existingItem) {
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity }
                });
            } else {
                errors.push({ productId, message: "Item not found in cart." });
            }
        }

        const updatedCart = await prisma.shoppingCart.findUnique({
            where: { userId: id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        return res.status(200).json({
            cart: formatCart(updatedCart),
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}
