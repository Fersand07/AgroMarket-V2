import { prisma } from "../database/connectdb.js";
import jwt from "jsonwebtoken";

// Formatea el producto para que coincida con el esquema esperado por el frontend
const formatProduct = (p) => ({
    _id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    quantity: p.quantity,
    image: p.image,
    stock: p.stock,
    category: p.category ? { _id: p.category.id, name: p.category.name, image: p.category.image } : null,
    measureUnit: p.measureUnit ? { _id: p.measureUnit.id, name: p.measureUnit.name } : null,
    user: p.userId
});

export const userCreatedProduct = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const { name, description, price, stock, category, measureUnit, image, quantity } = req.body;
        
        const cat = await prisma.productCategory.findUnique({ where: { name: category } });
        const unit = await prisma.measureUnit.findUnique({ where: { name: measureUnit } });
        
        if (!cat || !unit) {
            return res.status(400).json({ error: "Categoría o Unidad de medida no encontrada" });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                quantity: quantity ? parseFloat(quantity) : null,
                image,
                categoryId: cat.id,
                measureUnitId: unit.id,
                userId: id
            },
            include: {
                category: true,
                measureUnit: true
            }
        });
        
        return res.status(200).json({ product: formatProduct(product) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const getAllProducts =  async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                measureUnit: true
            }
        });
        res.status(200).json({ products: products.map(formatProduct) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
}

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                measureUnit: true
            }
        });
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json({ product: formatProduct(product) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const getProductByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await prisma.product.findMany({
            where: { categoryId: id },
            include: {
                category: true,
                measureUnit: true
            }
        });
        res.status(200).json({ products: products.map(formatProduct) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const getProductsPostedByUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        
        const products = await prisma.product.findMany({
            where: { userId: id },
            include: {
                category: true,
                measureUnit: true
            }
        });
        res.status(200).json({ products: products.map(formatProduct) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const updateProductCreatedByUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const { name, description, price, stock, category, measureUnit, image, quantity } = req.body;
        
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        if (product.userId !== id) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (image !== undefined) updateData.image = image;
        if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
        
        if (category) {
            const cat = await prisma.productCategory.findUnique({ where: { name: category } });
            if (cat) updateData.categoryId = cat.id;
        }
        if (measureUnit) {
            const unit = await prisma.measureUnit.findUnique({ where: { name: measureUnit } });
            if (unit) updateData.measureUnitId = unit.id;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: req.params.id },
            data: updateData,
            include: {
                category: true,
                measureUnit: true
            }
        });
        
        res.status(200).json({ product: formatProduct(updatedProduct) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
}

export const deleteProductCreatedByUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        if (product.userId === id) {
            await prisma.product.delete({ where: { id: req.params.id } });
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
        
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        if (product.stock > 0) {
            const buyer = await prisma.user.findUnique({ where: { id } });
            if (buyer.credit >= product.price) {
                // Ejecutar transacción completa ACID en Postgres de manera ultra segura
                await prisma.$transaction([
                    // Reducir stock del producto
                    prisma.product.update({
                        where: { id: product.id },
                        data: { stock: product.stock - 1 }
                    }),
                    // Restar crédito del comprador
                    prisma.user.update({
                        where: { id },
                        data: { credit: buyer.credit - product.price }
                    }),
                    // Sumar crédito al vendedor
                    prisma.user.update({
                        where: { id: product.userId },
                        data: { credit: { increment: product.price } }
                    }),
                    // Crear transacción de compra
                    prisma.transaction.create({
                        data: {
                            value: product.price,
                            type: "Compra",
                            userId: id
                        }
                    }),
                    // Crear transacción de venta
                    prisma.transaction.create({
                        data: {
                            value: product.price,
                            type: "Venta",
                            userId: product.userId
                        }
                    })
                ]);
                
                res.status(200).json({ message: "Producto comprado"});
            } else {
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

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || typeof user.lat !== 'number' || typeof user.lng !== 'number') {
            return res.status(400).json({ message: "User location not found" });
        }
        
        const maxDistanceInMeters = parseFloat(req.query.maxDistance) || 15000;

        // Encontrar usuarios vendedores cercanos
        const nearbyUsers = await prisma.$queryRaw`
            SELECT id,
                   (6371000 * acos(
                       cos(radians(${user.lat})) * cos(radians(lat)) * 
                       cos(radians(lng) - radians(${user.lng})) + 
                       sin(radians(${user.lat})) * sin(radians(lat))
                   )) AS distance
            FROM "User"
            GROUP BY id, lat, lng
            HAVING (6371000 * acos(
                cos(radians(${user.lat})) * cos(radians(lat)) * 
                cos(radians(lng) - radians(${user.lng})) + 
                sin(radians(${user.lat})) * sin(radians(lat))
            )) <= ${maxDistanceInMeters};
        `;

        const nearbyUserIds = nearbyUsers.map(u => u.id);

        // Buscar productos de esos usuarios
        const products = await prisma.product.findMany({
            where: { userId: { in: nearbyUserIds } },
            include: {
                category: true,
                measureUnit: true
            }
        });

        return res.status(200).json({ products: products.map(formatProduct) });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}