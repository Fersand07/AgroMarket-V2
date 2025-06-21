import { createContext, useEffect, useState } from "react";
import { loginService } from "../services/AuthService";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [ user, setUser ] = useState(null);
    const [ data, setData ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true); // Nuevo estado de carga

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
            try {
                const decoded = jwtDecode(storedToken);
                const currentTime = Date.now() / 1000;
                
                if (decoded.exp > currentTime) {
                    setUser(JSON.parse(storedUser));
                } else {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                }
            } catch (error) {
                console.error('Error al decodificar token:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
            }
        }
        
        setIsLoading(false); 
    }, []);

    const login = async (username, password) => {
        const response = await loginService(username, password);
        const decoded = jwtDecode(response.token);
        setUser(response);
        setData(JSON.stringify(response));
        localStorage.setItem('user', JSON.stringify(response));
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', decoded.username);
        localStorage.setItem('role', decoded.role);

        return decoded.role;
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}