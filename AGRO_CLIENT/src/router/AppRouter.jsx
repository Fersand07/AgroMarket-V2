import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/Register"

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>} />  
                <Route path="/register" element={<Register/>} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter