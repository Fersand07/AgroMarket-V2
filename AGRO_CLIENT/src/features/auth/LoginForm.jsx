import { useState } from "react"
import { useAuth } from "../../hooks/UseAuth"
import { useNavigate } from "react-router-dom"
import Button from "../../components/Button"
import Input from "../../components/Input"
import { customSwal } from "../../helpers/swalHelper"

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
                customSwal.fire({
                    title: '¡Bienvenido Proveedor!',
                    text: 'Inicio de sesión exitoso como proveedor de AgroMarket',
                    icon: 'success'
                })
                navigate('/seller/home')
            }else{
                customSwal.fire({
                    title: '¡Bienvenido!',
                    text: 'Inicio de sesión exitoso en AgroMarket',
                    icon: 'success'
                })
                navigate('/Home')
            }
        } catch (err) {
            setError(err.message)
            customSwal.fire({
                title: 'Error de Acceso',
                text: 'Ha ocurrido un error, por favor revisa tus credenciales',
                icon: 'error'
            })
        }
    }

    return (
        <div className="w-full max-w-md px-4">
            <form className="bg-white/10 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col gap-5 text-left" onSubmit={handleSubmit}>
                <h3 className="text-white/60 font-poppins font-bold text-xs uppercase tracking-wider pl-1 mb-1">Credenciales de Acceso</h3>
                
                <div className="flex flex-col gap-1.5">
                    <label className="text-white/80 font-poppins text-xs font-semibold pl-1">Usuario</label>
                    <Input 
                        type="text"
                        placeHolder="Ingresa tu usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                        className="w-full bg-white/5 text-white border border-white/15 focus:border-successLight"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-white/80 font-poppins text-xs font-semibold pl-1">Contraseña</label>
                    <Input
                        type="password"
                        placeHolder="Ingresa tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-white/5 text-white border border-white/15 focus:border-successLight"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-900/40 border border-red-500/20 rounded-xl text-center">
                        <p className="text-red-200 font-poppins text-xs font-semibold">{error}</p>
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 mt-3">
                    <Button type="submit" className="w-full bg-successLight text-primaryAltDark hover:bg-green-400 py-3 rounded-xl font-bold shadow-xl transition-all duration-300 text-center">
                        Iniciar Sesión
                    </Button>

                    <p className="text-white/80 font-poppins text-sm">
                        ¿No tienes una cuenta?{" "}
                        <a href="/register" className="text-successLight hover:text-green-300 font-bold underline transition-colors">
                            Regístrate
                        </a>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default LoginForm