import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/UseAuth"

export const PrivateRoute = ({children, roleRequired}) => {
    const { user } = useAuth()

    if (!user) {
        return <Navigate to="/" />
    }
    if(roleRequired && user.role !== roleRequired) {
        return <Navigate to="/" />
    }

    return children
}