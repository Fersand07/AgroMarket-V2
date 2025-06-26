import {Product} from  '../models/product.js'
import {MeasureUnit} from  '../models/measureUnit.js'
import {Category} from  '../models/productCategory.js'
import {User} from  '../models/user.js'
import {Transaction} from '../models/transaction.js'
import jwt from "jsonwebtoken"
//import { generateToken } from '../utils/tokenManager.js';


export const userCreatedProduct = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const { name, description, price, quantity, stock,category, measureUnit, image } = req.body;
        const categoryName = await Category.findOne({name:
            category});
        const measureUnitName = await MeasureUnit.findOne({name:
            measureUnit});
        const product = await Product.create({
            name,
            description,
            price,
            quantity,
            stock,
            category: categoryName._id,
            measureUnit: measureUnitName._id,
            image,
            user: id
        });
        return res.status(200).json({ product });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const getAllProducts =  async (req, res) => {
    try {
        const products = await Product.find().populate('category').populate('measureUnit');
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ error: "Error de server" });
    }
}

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category').populate('measureUnit');
        res.status(200).json({ product });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const getProductByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await Product.find({ category
            : id }).populate('category').populate('measureUnit');
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ error: "Error de server" });
    }
};

export const getProductsPostedByUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const products = await Product.find({ user: id }).
            populate("category").
            populate("measureUnit").
            lean();
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ error: "Error de server" });
    }
};

export const updateProductCreatedByUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const { name, description, price, category, measureUnit, image } = req.body;
        const categoryName = await Category.findOne({name:
            category});
        const measureUnitName = await MeasureUnit.findOne({name:
            measureUnit});
        const product = await Product.findById(req.params.id) 
        if(product.user == id){
            product.name = name? name: product.name;
            product.description = description? description: product.description;
            product.price = price? price: product.price;
            product.category = categoryName? categoryName._id: product.category;
            product.measureUnit = measureUnitName? measureUnitName._id: product.measureUnit;
            product.image = image? image: product.image;
            await product.save();
            res.status(200).json({ product });
        }else{
            res.status(401).json({ error: "No autorizado" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
}

export const deleteProductCreatedByUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const product = await Product.findById(req.params.id);
        if (product.user == id) {
            await Product.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: "Producto eliminado" });
        } else {
            res.status(400).json({ error: "No tienes permiso para eliminar este producto" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const buyProductWithUserCredit = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const product = await Product.findById(req.params.id);
        if (product.stock > 0) {
            await Product.findByIdAndUpdate(req.params.id, {
                stock: product.stock - 1
            });
            const user = await User
                .findById(id)
                .populate("credit")
                .lean();
            const credit = user.credit;
            if (credit >= product.price) {
                await User.findByIdAndUpdate(id, {
                    credit: credit - product.price
                });
                const seller = await User.findById(product.user);
                await User.findByIdAndUpdate(product.user, {
                    credit: product.price + seller.credit
                });
                await Transaction.create({
                    value: product.price,
                    type: "Compra",
                    user: id,
                });
                await Transaction.create({
                    value: product.price,
                    type: "Venta",
                    user: product.user,
                });
                res.status(200).json({ message: "Producto comprado"});
            }
            else {
                res.status(400).json({ error: "No tienes suficiente saldo" });
            }
        } else {
            res.status(400).json({ error: "No hay stock disponible" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
}

export const getNearbyProducts = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id: userId } = jwt.verify(authToken, process.env.SECRET_KEY)

        const user = await User.findById(userId);

        if (!user || !user.location) {
            return res.status(400).json({ message: "User location not found" });
        }
        const maxDistanceInMeters = req.query.maxDistance || 5000;

        const nearbyUsers = await User.find({
            location: {
                $near: {
                    $geometry: user.location,
                    $maxDistance: maxDistanceInMeters
                }
            }
        });

        const nearbyUserIds = nearbyUsers.map(u => u._id);

        // Buscar productos de esos usuarios
        const products = await Product.find({ user: { $in: nearbyUserIds } })
            .populate('category')
            .populate('measureUnit');

        return res.status(200).json({ products });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}