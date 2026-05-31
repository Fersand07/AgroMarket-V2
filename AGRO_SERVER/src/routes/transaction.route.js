import express from "express";
import { createTransaction, getTransactionByUser } from "../controllers/transactions.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = express.Router();

router.post('/add', requireToken, createTransaction);
router.get('/get', requireToken, getTransactionByUser);

export default router;