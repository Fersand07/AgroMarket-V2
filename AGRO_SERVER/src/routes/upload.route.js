import express from "express";
import { body } from 'express-validator';
import { uploadDataForCategories, uploadDataForMeasureUnits, uploadDataForProducts } from '../controllers/uploadSampleData.controller.js'

const router = express.Router();

router.post('/sample1', uploadDataForCategories);//✅
router.post('/sample2', uploadDataForMeasureUnits);//✅
router.post('/sample3', uploadDataForProducts);//✅





export default router;