import { Transaction } from '../models/transaction.js'
import jwt from "jsonwebtoken"

export const createTransaction = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        let { type, value } = req.body;
        if (type === 'compra' || type === 'retiro') {
            value *= -1;
        }
        const transaction = await Transaction.create({
            type,
            value,
            user: id
        });
        return res.status(200).json({ transaction });
    } catch (_error) {
        res.status(500).json({ error: "Error de server" });
    }
};

export const getTransactionByUser = async (req, res) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(token, process.env.SECRET_KEY);
        const alltransactions = await Transaction.find({ user: id }).lean();
        return res.status(200).json({ alltransactions });
    } catch (_error) {
        res.status(500).json({ error: "Error de server" });
    }
}


