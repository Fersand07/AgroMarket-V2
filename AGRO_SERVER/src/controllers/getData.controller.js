import { Category } from "../models/productCategory.js";
import { Product } from "../models/product.js";
import { MeasureUnit } from "../models/measureUnit.js";

export const getCategories = async (req, res)=>{
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getMeasureUnits = async (req, res) => {
    try {
        const measureUnits = await MeasureUnit.find();
        res.status(200).json(measureUnits);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
