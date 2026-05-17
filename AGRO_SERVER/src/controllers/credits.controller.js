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
        
        const user = await prisma.user.update({
            where: { id },
            data: { credit: { decrement: parseFloat(credits) } }
        });
        
        res.status(200).json({ credits: user.credit });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};