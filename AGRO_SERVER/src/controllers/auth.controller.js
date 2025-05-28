import { User } from "../models/user.js";
import { generateRefreshToken, generateToken } from "../utils/tokenManager.js";
import jwt from "jsonwebtoken"

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    const passwordResponse = await user.comparePassword(password)
    if (!passwordResponse) {
      return res.status(403).json({ message: "Password is incorrect" });
    }
    const { token, expiresIn } = generateToken(user.id, user.role)
    generateRefreshToken(user.id, user.role, res)
    return res.status(200).json({ token, expiresIn });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const register = async (req, res) => {
  const { username, email, address, phone, password, lat, lng } = req.body;
  try {
    const Usr = new User({
      username,
      email,
      address,
      phone,
      password,
      lat,
      lng
    });
    if (Usr.username || Usr.email || Usr.phone) {
      const phone = await User.findOne({ phone: Usr.phone });
      if (phone) {
        return res.status(403).json({ message: "Phone already in use" });
      }
      const user = await User
        .findOne({ username: Usr.username });
      if (user) {
        return res.status(403).json({ message: "Username already in use" });
      }
      const email = await User
        .findOne
        ({ email: Usr.email });
      if (email) {
        return res.status(403).json({ message: "Email already in use" });
      }
    }


    await Usr.save();
    //const token = await Usr.getSignedJwtToken();
    res.status(201).json({
      message: "Usuario creado",
    });
  } catch (e) {
    console.log(e.code);
    console.log(e.message);
    if (e.code === 11000) {
      res.status(400).json({
        message: "User already exists",
      });
    }
  }
};


export const refreshToken = (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken
    if (!refreshTokenCookie) throw new Error("No bearer");

    const { id } = jwt.verify(refreshTokenCookie, process.env.REFRESH_KEY);
    const { token, expiresIn } = generateToken(id);
    return res.status(200).json({ token, expiresIn });
  } catch (error) {
    console.log(error)
    const tokenVerificationErrors = {
      "Invalid signature": "La firma del JWT no es valido",
      "jwt expired": "JWT expirado",
      "invalid token": "Token no valido",
      "No bearer": "Utiliza el formato bearer",
      "jwt malformed": "JWT mal formado"
    };
    return res.status(401).json({ message: tokenVerificationErrors[e.message] || e.message });
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