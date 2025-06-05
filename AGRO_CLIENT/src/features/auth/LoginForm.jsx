import { useState } from "react"
import { useAuth } from "../../hooks/UseAuth"
import { useNavigate } from "react-router-dom"
import Button from "../../components/Button"
import Input from "../../components/Input"
import Swal from "sweetalert2"

const LoginForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const { login } = useAuth()
    const navigate = useNavigate()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        try {
            const role = await login(username, password)
            if(role === 'seller'){
                Swal.fire({
                    title: 'Bienvenido',
                    text: 'Inicio de sesión exitoso como proveedor',
                    icon: 'success'
                })
                navigate('/admin')
            }else{
                Swal.fire({
                    title: 'Bienvenido',
                    text: 'Inicio de sesión exitoso',
                    icon: 'success'
                })
                navigate('/Home')
            }
        } catch (err) {
            setError(err.message)
            Swal.fire({
                title: 'Error',
                text: 'Ha ocurrido un error, revisa tus credenciales',
                icon: 'error'
            })
        }
    }

    return (
        <form className="flex flex-col items-center space-y-4 m-4" onSubmit={handleSubmit}>
            <Input 
                type="text"
                placeHolder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
            />
            <Input
                type="password"
                placeHolder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Button type="submit" className="w-5/6" >Iniciar Sesion</Button>
            <p className="text-white font-poppins font-bold">¿No tienes cuenta? <span className="text-black font-bold "><a href="/register">Registrate</a></span></p>
        </form>
    )
}

export default LoginForm