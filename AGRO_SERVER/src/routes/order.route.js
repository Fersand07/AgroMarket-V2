import express from "express";
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, updateOrderStatus} from "../controllers/orders.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = express.Router();
router.get('/', requireToken, getOrders); // Get all orders
router.get('/:id', requireToken, getOrderById); // Get order by ID
router.post('/', requireToken, createOrder); // Create a new order
router.put('/:id', requireToken, updateOrder); // Update an order by ID
router.delete('/:id', requireToken, deleteOrder); // Delete an order by ID
router.patch('/status/:id', requireToken, updateOrderStatus); //Update order status

export default router;