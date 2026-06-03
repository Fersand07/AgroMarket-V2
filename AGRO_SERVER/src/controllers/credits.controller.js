import { prisma } from "../database/connectdb.js";
import jwt from "jsonwebtoken";

export const getCredits = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(token, process.env.SECRET_KEY)
        const user = await prisma.user.findUnique({ where: { id } });
        res.status(200).json({ credits: user.credit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addCreditsToUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(token, process.env.SECRET_KEY)
        const { credits } = req.body;
        
        const user = await prisma.user.update({
            where: { id },
            data: { credit: { increment: parseFloat(credits) } }
        });
        
        res.status(200).json({ credits: user.credit });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const substractCreditsFromUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(token, process.env.SECRET_KEY)
        const { credits } = req.body;
        
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Calculate blocked revenue from pending orders
        const pendingOrders = await prisma.order.findMany({
            where: {
                sellerId: id,
                status: 'pending'
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        let blockedRevenue = 0;
        for (const order of pendingOrders) {
            for (const item of order.items) {
                if (item.product) {
                    blockedRevenue += item.product.price * item.quantity;
                }
            }
        }

        const withdrawableBalance = Math.max(0, user.credit - blockedRevenue);
        const withdrawAmount = parseFloat(credits);

        if (withdrawAmount > withdrawableBalance) {
            return res.status(400).json({
                error: `Saldo retenido en garantía. No puedes retirar fondos de pedidos pendientes que aún no has enviado (Retenido: $${blockedRevenue.toFixed(2)} USD).`
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { credit: { decrement: withdrawAmount } }
        });
        
        res.status(200).json({ credits: updatedUser.credit });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Error de servidor" });
    }
};