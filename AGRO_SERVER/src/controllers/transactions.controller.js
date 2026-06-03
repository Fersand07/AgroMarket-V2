import { prisma } from '../database/connectdb.js'
import jwt from "jsonwebtoken"

export const createTransaction = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        let { type, value, metadata } = req.body;
        
        let val = parseFloat(value);
        if (type.toLowerCase() === 'compra' || type.toLowerCase() === 'retiro') {
            val = -Math.abs(val);
        } else {
            val = Math.abs(val);
        }
        
        const transaction = await prisma.transaction.create({
            data: {
                type,
                value: val,
                userId: id,
                metadata: metadata || undefined
            }
        });
        
        const formattedTransaction = {
            _id: transaction.id,
            type: transaction.type,
            value: transaction.value,
            user: transaction.userId,
            date: transaction.date,
            metadata: transaction.metadata
        };
        
        return res.status(200).json({ transaction: formattedTransaction });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const getTransactionByUser = async (req, res) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(token, process.env.SECRET_KEY);
        
        const alltransactions = await prisma.transaction.findMany({
            where: { userId: id },
            orderBy: { date: 'desc' }
        });
        
        const formattedTransactions = alltransactions.map(t => ({
            _id: t.id,
            type: t.type,
            value: t.value,
            user: t.userId,
            date: t.date,
            metadata: t.metadata
        }));
        
        return res.status(200).json({ alltransactions: formattedTransactions });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
}
