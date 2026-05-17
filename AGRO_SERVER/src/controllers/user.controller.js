import { prisma } from "../database/connectdb.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const infoUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        const user = await prisma.user.findUnique({ where: { id } });
        
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const formattedUser = {
            id: user.id,
            _id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            credit: user.credit,
            image: user.image,
            lat: user.lat,
            lng: user.lng,
            location: {
                type: "Point",
                coordinates: [user.lng, user.lat]
            }
        };

        return res.status(200).json({ user: formattedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id } = jwt.verify(authToken, process.env.SECRET_KEY)
        
        const updateData = {};
        if (req.body.username) updateData.username = req.body.username;
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.phone) updateData.phone = req.body.phone;
        if (req.body.address) updateData.address = req.body.address;
        
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.password, salt);
        }
        
        if (req.body.lat) updateData.lat = parseFloat(req.body.lat);
        if (req.body.lng) updateData.lng = parseFloat(req.body.lng);

        await prisma.user.update({
            where: { id },
            data: updateData
        });

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
        
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const passwordResponse = await bcrypt.compare(password, user.password);
        if (!passwordResponse) {
            return res.status(403).json({ message: "Password is incorrect" });
        }
        if (password === newPassword) {
            return res.status(403).json({ message: "Password is the same" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        await prisma.user.update({
            where: { id },
            data: { password: passwordHash }
        });

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
        
        await prisma.user.update({
            where: { id },
            data: { image }
        });
        
        return res.status(200).json({ message: "Image changed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error de server" });
    }                
} 

export const getNearbySellers = async (req, res) => {
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
        const { id: userId } = jwt.verify(authToken, process.env.SECRET_KEY);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || typeof user.lat !== 'number' || typeof user.lng !== 'number') {
            return res.status(400).json({ message: "User location not found" });
        }

        const maxDistanceInMeters = parseFloat(req.query.maxDistance) || 15000;

        // Búsqueda geoespacial utilizando la fórmula de Haversine en SQL nativo.
        // Esto calcula la distancia en metros entre el usuario actual y el resto de vendedores.
        const nearbySellers = await prisma.$queryRaw`
            SELECT id, username, lat, lng,
                   (6371000 * acos(
                       cos(radians(${user.lat})) * cos(radians(lat)) * 
                       cos(radians(lng) - radians(${user.lng})) + 
                       sin(radians(${user.lat})) * sin(radians(lat))
                   )) AS distance
            FROM "User"
            WHERE role = 'seller' AND id != ${userId}
            GROUP BY id, username, lat, lng
            HAVING (6371000 * acos(
                cos(radians(${user.lat})) * cos(radians(lat)) * 
                cos(radians(lng) - radians(${user.lng})) + 
                sin(radians(${user.lat})) * sin(radians(lat))
            )) <= ${maxDistanceInMeters}
            ORDER BY distance ASC;
        `;

        // Mapear el formato que espera el frontend (con objeto 'location') para mantener compatibilidad al 100%
        const formattedSellers = nearbySellers.map(s => ({
            _id: s.id,
            username: s.username,
            location: {
                type: "Point",
                coordinates: [s.lng, s.lat]
            }
        }));

        return res.status(200).json({ sellers: formattedSellers });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
