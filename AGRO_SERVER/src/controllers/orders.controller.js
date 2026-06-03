import { prisma } from '../database/connectdb.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const OPENROUTE_KEY = process.env.OPENROUTE_KEY;

const formatOrder = (o) => {
    if (!o) return null;
    return {
        _id: o.id,
        buyer: o.buyer ? {
            _id: o.buyer.id,
            username: o.buyer.username,
            phone: o.buyer.phone,
            email: o.buyer.email,
            address: o.address !== null && o.address !== undefined ? o.address : o.buyer.address,
            lat: o.lat !== null && o.lat !== undefined ? o.lat : o.buyer.lat,
            lng: o.lng !== null && o.lng !== undefined ? o.lng : o.buyer.lng
        } : null,
        seller: o.seller ? {
            _id: o.seller.id,
            username: o.seller.username,
            phone: o.seller.phone,
            email: o.seller.email,
            address: o.seller.address,
            lat: o.seller.lat,
            lng: o.seller.lng
        } : null,
        items: (o.items || []).map(item => ({
            _id: item.id,
            product: item.product ? {
                _id: item.product.id,
                name: item.product.name,
                description: item.product.description,
                price: item.product.price,
                image: item.product.image
            } : null,
            quantity: item.quantity
        })),
        eta: o.eta,
        route: o.route,
        status: o.status,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt
    };
};

async function getRouteAndETA(startLng, startLat, endLng, endLat) {
    // Si la llave de OpenRoute está configurada correctamente, usar OpenRoute
    if (OPENROUTE_KEY && !OPENROUTE_KEY.includes("your_openroute")) {
        try {
            const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTE_KEY}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
            const response = await axios.get(url);
            const geojson = response.data;
            const durationSec = geojson.features[0].properties.summary.duration;
            const etaMinutes = Math.round(durationSec / 60);
            return {
                eta: `${etaMinutes} min`,
                route: geojson
            };
        } catch (error) {
            console.error("OpenRoute API error, falling back to OSRM:", error.message);
        }
    }

    // Fallback/Alternativa Gratuita y Sin Key usando OSRM (Open Source Routing Machine)
    try {
        console.log("Utilizando OSRM para cálculo de ruta gratuita...");
        const url = `http://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
        const response = await axios.get(url);
        const osrmData = response.data;

        if (osrmData.code === 'Ok' && osrmData.routes && osrmData.routes.length > 0) {
            const route = osrmData.routes[0];
            const durationSec = route.duration;
            const distanceMeters = route.distance;
            const coordinates = route.geometry.coordinates;

            const etaMinutes = Math.round(durationSec / 60);

            // Mapear al mismo formato exacto de OpenRoute para compatibilidad del 100% con el cliente
            const geojson = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: coordinates
                        },
                        properties: {
                            summary: {
                                distance: distanceMeters,
                                duration: durationSec
                            }
                        }
                    }
                ]
            };

            return {
                eta: `${etaMinutes} min`,
                route: geojson
            };
        }
    } catch (error) {
        console.error("OSRM Routing API error:", error.message);
    }

    // Último recurso en caso de fallos
    return {
        eta: "30 min",
        route: null
    };
}


export const createOrder = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id: buyerId } = jwt.verify(authToken, process.env.SECRET_KEY);

        const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
        if (!buyer || typeof buyer.lat !== 'number' || typeof buyer.lng !== 'number') {
            return res.status(400).json({ message: "Buyer location not found." });
        }

        const cart = await prisma.shoppingCart.findUnique({
            where: { userId: buyerId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }

        // Calculate total cost and check buyer balance
        let grandTotal = 0;
        for (const item of cart.items) {
            if (!item.product) {
                return res.status(404).json({ message: "Un producto en el carrito no existe." });
            }
            grandTotal += item.product.price * item.quantity;
        }

        if (buyer.credit < grandTotal) {
            return res.status(400).json({ message: "Créditos insuficientes para realizar esta compra." });
        }

        // Group items by seller
        const sellerItemsMap = {};
        for (const item of cart.items) {
            const sellerId = item.product.userId;
            if (!sellerItemsMap[sellerId]) sellerItemsMap[sellerId] = [];
            sellerItemsMap[sellerId].push(item);
        }

        const createdOrders = [];

        for (const sellerId of Object.keys(sellerItemsMap)) {
            const seller = await prisma.user.findUnique({ where: { id: sellerId } });
            if (!seller || typeof seller.lat !== 'number' || typeof seller.lng !== 'number') {
                return res.status(400).json({ message: `Seller location not found for seller ${sellerId}` });
            }

            const routeInfo = await getRouteAndETA(
                seller.lng, seller.lat,
                buyer.lng, buyer.lat
            );

            // Calculate total for this specific seller
            let orderTotal = 0;
            for (const item of sellerItemsMap[sellerId]) {
                orderTotal += item.product.price * item.quantity;
            }

            // Verificar y actualizar stock, transferir dinero y crear la orden transaccionalmente
            const result = await prisma.$transaction(async (tx) => {
                // 1. Descontar créditos del comprador
                await tx.user.update({
                    where: { id: buyerId },
                    data: { credit: { decrement: orderTotal } }
                });

                // 2. Incrementar créditos del vendedor
                await tx.user.update({
                    where: { id: seller.id },
                    data: { credit: { increment: orderTotal } }
                });

                // 3. Crear transacción de Compra para el comprador (valor negativo)
                await tx.transaction.create({
                    data: {
                        userId: buyerId,
                        type: "Compra",
                        value: -orderTotal
                    }
                });

                // 4. Crear transacción de Venta para el vendedor (valor positivo)
                await tx.transaction.create({
                    data: {
                        userId: seller.id,
                        type: "Venta",
                        value: orderTotal
                    }
                });

                // 5. Crear la orden principal
                const order = await tx.order.create({
                    data: {
                        buyerId: buyerId,
                        sellerId: seller.id,
                        address: buyer.address,
                        lat: buyer.lat,
                        lng: buyer.lng,
                        eta: routeInfo.eta,
                        route: routeInfo.route || undefined,
                        status: 'pending'
                    }
                });

                // 6. Crear los items de la orden y descontar el stock
                for (const item of sellerItemsMap[sellerId]) {
                    // Validar stock antes
                    const freshProd = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!freshProd || freshProd.stock < item.quantity) {
                        throw new Error(`Insufficient stock for product: ${freshProd ? freshProd.name : item.productId}`);
                    }

                    // Crear OrderItem
                    await tx.orderItem.create({
                        data: {
                            orderId: order.id,
                            productId: item.productId,
                            quantity: item.quantity
                        }
                    });

                    // Descontar stock
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: freshProd.stock - item.quantity }
                    });
                }

                // Cargar orden completa para retornar
                return await tx.order.findUnique({
                    where: { id: order.id },
                    include: {
                        buyer: true,
                        seller: true,
                        items: { include: { product: true } }
                    }
                });
            });

            createdOrders.push(formatOrder(result));
        }

        // Limpiar el carrito del usuario
        await prisma.cartItem.deleteMany({
            where: { shoppingCartId: cart.id }
        });

        return res.status(201).json({ message: "Order(s) created", orders: createdOrders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Server error" });
    }
};

export const getOrders = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id: userId } = jwt.verify(authToken, process.env.SECRET_KEY);

        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { buyerId: userId },
                    { sellerId: userId }
                ]
            },
            include: {
                buyer: true,
                seller: true,
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json(orders.map(formatOrder));
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                buyer: true,
                seller: true,
                items: {
                    include: { product: true }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.status(200).json(formatOrder(order));
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                buyer: true,
                seller: true,
                items: { include: { product: true } }
            }
        });

        return res.status(200).json(formatOrder(order));
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.order.delete({ where: { id } });
        return res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}  

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({ message: "Invalid or missing newStatus" });
        }

        const validTransitions = {
            pending: ["in_progress", "cancelled"],
            in_progress: ["completed"],
            completed: [],
            cancelled: []
        };

        const order = await prisma.order.findUnique({ where: { id } });
        if(!order) {
            return res.status(404).json({message: "Order not found"});
        }

        const currentStatus = order.status;

        if (!validTransitions[currentStatus].includes(newStatus)) {
            return res.status(400).json({
                message: `Invalid status change from ${currentStatus} to ${newStatus}`
            });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status: newStatus },
            include: {
                buyer: true,
                seller: true,
                items: { include: { product: true } }
            }
        });

        return res.status(200).json({ message: "Order status updated", order: formatOrder(updatedOrder) });

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Server error"})
    }
}