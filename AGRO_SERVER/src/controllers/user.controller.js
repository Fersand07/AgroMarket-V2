import { User } from "../models/user.js";
import jwt from "jsonwebtoken"

export const infoUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const user = await User.findById(id).lean();
        return res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const user = await User.findById(id);
        if (req.body.username) {
            user.username = req.body.username;
        }
        if (req.body.email) {
            user.email = req.body.email;
        }
        if (req.body.phone) {
            user.phone = req.body.phone;
        }
        if (req.body.address) {
            user.address = req.body.address;
        }
        if (req.body.password) {
            user.password = req.body.password;
        }
        user.location = { type: "Point", coordinates: [user.lng, user.lat] };
        await user.save();
        return res.status(200).json({ message: "Usuario actualizado" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const changePassword = async (req, res) =>{
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const { password, newPassword } = req.body;
        const user = await User.findById(id);
        const passwordResponse = await user.comparePassword(password)
        if (!passwordResponse) {
            return res.status(403).json({ message: "Password is incorrect" });
        }
        if (password === newPassword) {
            return res.status(403).json({ message: "Password is the same" });
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ message: "Password changed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
}

export const changeImage = async (req,res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const { image } = req.body;
        const user = await User.findByIdAndUpdate(id);
        user.image = image;
        await user.save();
        return res.status(200).json({ message: "Image changed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }                
} 