import { prisma } from "../database/connectdb.js";

export const getCategories = async (req, res)=>{
    try {
        const categories = await prisma.productCategory.findMany();
        const formatted = categories.map(c => ({
            _id: c.id,
            name: c.name,
            image: c.image
        }));
        res.status(200).json(formatted);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

export const getMeasureUnits = async (req, res) => {
    try {
        const measureUnits = await prisma.measureUnit.findMany();
        const formatted = measureUnits.map(u => ({
            _id: u.id,
            name: u.name
        }));
        res.status(200).json(formatted);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

export const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                measureUnit: true
            }
        });
        const formatted = products.map(p => ({
            _id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            quantity: p.quantity,
            image: p.image,
            stock: p.stock,
            category: p.categoryId,
            measureUnit: p.measureUnitId,
            user: p.userId
        }));
        res.status(200).json(formatted);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}
