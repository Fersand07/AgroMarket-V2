import express from "express";
import { body } from 'express-validator';
import { getCredits, addCreditsToUser, substractCreditsFromUser } from "../controllers/credits.controller.js";
import { requireToken } from '../middlewares/requireToken.js';

const router = express.Router();

router.get('/get', requireToken, getCredits);
router.post('/add', addCreditsToUser);
router.post('/substract', substractCreditsFromUser);

export default router;