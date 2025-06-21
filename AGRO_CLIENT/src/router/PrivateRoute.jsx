import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { jwtDecode } from "jwt-decode";

export const PrivateRoute = ({ children, roleRequired }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    let role;
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            return <Navigate to="/" replace />;
        }
        
        const decoded = jwtDecode(token);
        
        // Verificar si el token ha expirado
        const currentTime = Date.now() / 1000;
        if (decoded.exp <= currentTime) {
            return <Navigate to="/" replace />;
        }
        
        role = decoded.role;
    } catch (e) {
        console.error("Token inválido o no encontrado:", e);
        return <Navigate to="/" replace />;
    }

    if (roleRequired) {
        const allowedRoles = Array.isArray(roleRequired) ? roleRequired : [roleRequired];

        if (!allowedRoles.includes(role)) {
            return <Navigate to="/home" replace />;
        }
    }

    return children;
};