import { prisma } from "../database/connectdb.js";
import { generateRefreshToken, generateToken } from "../utils/tokenManager.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    const passwordResponse = await bcrypt.compare(password, user.password);
    if (!passwordResponse) {
      return res.status(403).json({ message: "Password is incorrect" });
    }
    const { token, expiresIn } = generateToken(user.id, user.role, user.username)
    generateRefreshToken(user.id, user.role, user.username, res)
    return res.status(200).json({ token, expiresIn, message: "ok" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const register = async (req, res) => {
  const { username, email, address, phone, password, lat, lng, role } = req.body;
  try {
    if (phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone } });
      if (phoneExists) {
        return res.status(403).json({ message: "Phone already in use" });
      }
    }
    if (username) {
      const userExists = await prisma.user.findUnique({ where: { username } });
      if (userExists) {
        return res.status(403).json({ message: "Username already in use" });
      }
    }
    if (email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(403).json({ message: "Email already in use" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        username,
        email,
        address,
        phone,
        password: passwordHash,
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        role: role || "user"
      }
    });

    res.status(201).json({
      message: "Usuario creado",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      message: "Error de servidor al registrar usuario",
    });
  }
};

export const refreshToken = (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken
    if (!refreshTokenCookie) throw new Error("No bearer");

    const { id } = jwt.verify(refreshTokenCookie, process.env.REFRESH_KEY);
    // Find user to get role and username
    prisma.user.findUnique({ where: { id } }).then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }
      const { token, expiresIn } = generateToken(id, user.role, user.username);
      return res.status(200).json({ token, expiresIn });
    }).catch(error => {
      return res.status(500).json({ message: "Error al refrescar token" });
    });
  } catch (error) {
    console.log(error)
    const tokenVerificationErrors = {
      "Invalid signature": "La firma del JWT no es valido",
      "jwt expired": "JWT expirado",
      "invalid token": "Token no valido",
      "No bearer": "Utiliza el formato bearer",
      "jwt malformed": "JWT mal formado"
    };
    return res.status(401).json({ message: tokenVerificationErrors[error.message] || error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logout" });
  } catch (error) {
    return res.status(500).json({ message: "Error de server" });
  }
};