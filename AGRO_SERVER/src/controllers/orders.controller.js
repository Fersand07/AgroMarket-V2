import { ShoppingCart } from '../models/shoppingCart.js';
import { Order } from '../models/order.js';
import { Product } from '../models/product.js';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const OPENROUTE_KEY = process.env.OPENROUTE_KEY;

async function getRouteAndETA(startLng, startLat, endLng, endLat) {
    try {
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTE_KEY}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
        const response = await axios.get(url);
        const geojson = response.data;
        const durationSec = geojson.features[0].properties.summary.duration;
        const etaMinutes = Math.round(durationSec / 60);
        return {
            eta: `${etaMinutes} min`,
            route: geojson
        };
    } catch (error) {
        console.error("OpenRoute API error:", error.message);
        return {
            eta: null,
            route: null,
            error: "Could not calculate route"
        };
    }
}

export const createOrder = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id: buyerId } = jwt.verify(authToken, process.env.SECRET_KEY);

        // Get buyer info
        const buyer = await User.findById(buyerId);
        if (!buyer || typeof buyer.lat !== 'number' || typeof buyer.lng !== 'number') {
            return res.status(400).json({ message: "Buyer location not found." });
        }

        // Get cart
        const cart = await ShoppingCart.findOne({ user: buyerId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }

        // Populate products for all cart items using Product model
        const populatedItems = [];
        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            populatedItems.push({ ...item.toObject(), product });
        }

        // Group items by seller (product.user)
        const sellerItemsMap = {};
        for (const item of populatedItems) {
            const sellerId = item.product.user.toString();
            if (!sellerItemsMap[sellerId]) sellerItemsMap[sellerId] = [];
            sellerItemsMap[sellerId].push(item);
        }

        const orders = [];
        for (const sellerId of Object.keys(sellerItemsMap)) {
            const seller = await User.findById(sellerId);
            if (!seller || typeof seller.lat !== 'number' || typeof seller.lng !== 'number') {
                return res.status(400).json({ message: `Seller location not found for seller ${sellerId}` });
            }

            // Get route and ETA from seller to buyer
            const routeInfo = await getRouteAndETA(
                seller.lng, seller.lat,
                buyer.lng, buyer.lat
            );

            // Create order
            const order = new Order({
                buyer: buyerId,
                seller: seller._id,
                items: sellerItemsMap[sellerId].map(item => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                eta: routeInfo.eta,
                route: routeInfo.route,
                status: 'pending'
            });
            await order.save();
            orders.push(order);

            // Update product stock
            for (const item of sellerItemsMap[sellerId]) {
                const updateResult = await Product.findOneAndUpdate(
                    { _id: item.product._id, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
                if (!updateResult) {
                    return res.status(400).json({ message: `Insufficient stock for product: ${item.product._id}` });
                }
            }
        }

        // Clear the cart after order creation
        cart.items = [];
        await cart.save();

        return res.status(201).json({ message: "Order(s) created", orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getOrders = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id: userId } = jwt.verify(authToken, process.env.SECRET_KEY);

        // Get orders for the user (buyer or seller)
        const orders = await Order.find({
            $or: [{ buyer: userId }, { seller: userId }]
        }).populate('buyer').populate('seller').populate('items.product');

        return res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await
        Order.findById(id)
            .populate('buyer')
            .populate('seller')
            .populate('items.product');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
    }

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
            .populate('buyer')
            .populate('seller')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}  

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;


        const validTransitions = {
            pending: ["in_progress", "cancelled"],
            in_progress: ["completed"],
            completed: [],
            cancelled: []
        };


        const order = await Order.findById(id);
        if(!order) {
            return res.status(404).json({message: "Order not found"});
        }

        const currentStatus = order.status;

        if (!validTransitions[currentStatus].includes(newStatus)) {
            return res.status(400).json({
                message: `Invalid status change from ${currentStatus} to ${newStatus}`
            });
        }


        order.status = newStatus;
        await order.save();

        return res.status(200).json({ message: "Order status updated", order});

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Server error"})
    }
}