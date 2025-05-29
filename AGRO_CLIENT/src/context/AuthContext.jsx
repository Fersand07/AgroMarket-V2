import { createContext, useContext, useEffect, useState } from "react";
import { loginService } from "../services/AuthService";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [ user, setUser ] = useState(null);
    const [ data, setData ] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = async (username, password) => {
        const response = await loginService(username, password)
        const decoded = jwtDecode(response.token)
        setUser(response)
        setData(JSON.stringify(response))
        localStorage.setItem('user', JSON.stringify(response))
        localStorage.setItem('token', response.token)
        localStorage.setItem('username', decoded.username)
        localStorage.setItem('role', decoded.role)
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    } 

    return (
        <AuthContext.Provider value={{ user, login, logout }} >
            {children}
        </AuthContext.Provider>
    )
}

