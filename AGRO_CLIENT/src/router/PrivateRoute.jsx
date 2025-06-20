import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { jwtDecode } from "jwt-decode";

export const PrivateRoute = ({ children, roleRequired }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" />;
    }

    let role;
    try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        role = decoded.role;
    } catch (e) {
        console.error("Token inválido o no encontrado:", e);
        return <Navigate to="/" />;
    }

    if (roleRequired) {
        const allowedRoles = Array.isArray(roleRequired) ? roleRequired : [roleRequired];

        if (!allowedRoles.includes(role)) {
            return <Navigate to="/home" />;
        }
    }

    return children;
};
