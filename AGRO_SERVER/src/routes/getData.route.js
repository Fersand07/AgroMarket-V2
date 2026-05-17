import express from "express";
import { getCategories, getMeasureUnits, getProducts} from "../controllers/getData.controller.js";

const router = express.Router();

router.get('/categories', getCategories);//✅
router.get('/measureUnits', getMeasureUnits);//✅


export default router;