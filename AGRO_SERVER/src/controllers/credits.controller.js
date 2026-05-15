import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

export const getCredits = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findById(id);
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
        const user = await User.findById(id);
        user.credit += credits;
        await user.save();
        res.status(200).json({ credits: user.credit });
    } catch (_error) {
        res.status(500).json({ error: "Error de server" });
    }
};

export const substractCreditsFromUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(token, process.env.SECRET_KEY)
        const { credits } = req.body;
        const user = await User.findById(id);
        user.credit -= credits;
        await user.save();
        res.status(200).json({ credits: user.credit });
    } catch (_error) {
        res.status(500).json({ error: "Error de server" });
    }
};