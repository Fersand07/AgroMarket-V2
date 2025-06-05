import jwt from "jsonwebtoken";
export const generateToken = (id, role, username) => {
    const expiresIn = 60 * 15;
    try {
        const token = jwt.sign({ id, role, username }, process.env.SECRET_KEY, { expiresIn: expiresIn });
        return { token, expiresIn };
    }
    catch (e) {
        console.log(e);
    }
}

export const generateRefreshToken = (id, role, username, res) => {
    const expiresIn = 60 * 60 * 24 * 30;
    try {
        const refreshToken = jwt.sign({ id, role, username }, process.env.REFRESH_KEY, { expiresIn });
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: !(process.env.MODE === "developer"),  
            expires: new Date(Date.now() + expiresIn * 1000),
        });
        return refreshToken;
    }
    catch (e) {
        console.log(e);
    }
}

export const tokenVerificationErrors = {
    "invalid signature": "La firma del JWT no es válida",
    "jwt expired": "JWT expirado",
    "invalid token": "Token no válido",
    "No Bearer": "Utiliza formato Bearer",
    "jwt malformed": "JWT formato no válido",
}