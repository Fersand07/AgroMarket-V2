import express from "express";
import { body } from 'express-validator';
import { createTransaction, getTransactionByUser } from "../controllers/transactions.controller.js";
import { requireToken } from "../middlewares/requireToken.js";

const router = express.Router();

router.post('/add', requireToken, createTransaction);
router.get('/get', requireToken, getTransactionByUser);

export default router;