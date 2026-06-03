import { useState } from "react"
import Input from "../../components/Input"
import Button from "../../components/Button"
import { registerService } from "../../services/AuthService"
import { useNavigate } from "react-router-dom"
import LocationModal from "../../components/LocationModal"
import { customSwal } from "../../helpers/swalHelper"

import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

const RegisterForm = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [cPassword, setCPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [role, setRole] = useState('user')

    // Coordenadas
    const [position, setPosition] = useState([13.6929, -89.2182]) // San Salvador
    const [lat, setLat] = useState(null)
    const [lng, setLng] = useState(null)

    const navigate = useNavigate()

    const phoneRegex = /^[267]\d{7}$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        if (!phoneRegex.test(phoneNumber)) {
            setErrors({ phoneNumber: 'El número de teléfono no es válido' })
            return
        }

        if (password !== cPassword) {
            setErrors({ cPassword: 'Las contraseñas no coinciden' })
            return
        } else if (!passwordRegex.test(password)) {
            setErrors({
                password: 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.'
            })
            return
        }

        if (!lat || !lng) {
            setErrors({ default: 'Debes seleccionar una ubicación' })
            return
        }

        try {
            const response = await registerService(username, email, address, phoneNumber, password, lat, lng, role)
            if (response.message == 'Usuario creado') {
                await customSwal.fire({
                    title: '¡Registro Exitoso!',
                    text: 'Tu cuenta ha sido creada correctamente en AgroMarket',
                    icon: 'success'
                })
                navigate('/')
            } else {
                setErrors({ default: 'Error al registrarse.' })
            }
        } catch (err) {
            console.error('Error al registrarse:', err)
            setErrors({ default: 'Hubo un error al registrarse' })
        }
    }

    return (
        <div className="w-full max-w-2xl px-4">
            <form className="bg-white/10 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col gap-6" onSubmit={handleSubmit}>
                
                {/* 1. Header / Selección de Rol */}
                <div className="flex flex-col gap-2.5">
                    <label className="text-white font-poppins font-semibold text-xs pl-1 uppercase tracking-wider text-white/70">¿Cómo usarás AgroMarket?</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setRole('user')}
                            className={`py-3 px-4 rounded-xl font-poppins font-bold text-sm flex items-center justify-center gap-2 border transition duration-300 cursor-pointer ${role === 'user' ? 'bg-successLight text-primaryAltDark border-successLight shadow-lg scale-102' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}
                        >
                            🛒 Comprador
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('seller')}
                            className={`py-3 px-4 rounded-xl font-poppins font-bold text-sm flex items-center justify-center gap-2 border transition duration-300 cursor-pointer ${role === 'seller' ? 'bg-successLight text-primaryAltDark border-successLight shadow-lg scale-102' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}
                        >
                            🧑‍🌾 Vendedor
                        </button>
                    </div>
                </div>

                {/* Separador */}
                <div className="h-px bg-white/10 w-full" />

                {/* 2. Grid de dos columnas para los campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                    
                    {/* Columna Izquierda: Información General */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-white/80 font-poppins text-xs font-semibold pl-1">Usuario</label>
                            <Input
                                type="text"
                                placeHolder="Nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full bg-white/5 text-white border border-white/15 focus:border-successLight"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-white/80 font-poppins text-xs font-semibold pl-1">Correo Electrónico</label>
                            <Input
                                type="email"
                                placeHolder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 text-white border border-white/15 focus:border-successLight"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-white/80 font-poppins text-xs font-semibold pl-1">Teléfono</label>
                            <Input
                                type="text"
                                placeHolder="Número de contacto"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                error={errors.phoneNumber}
                                required
                                className="w-full bg-white/5 text-white border border-white/15 focus:border-successLight"
                            />
                        </div>
                    </div>

                    {/* Columna Derecha: Ubicación y Contraseña */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1 relative">
                            <label className="text-white/80 font-poppins text-xs font-semibold pl-1">Dirección Física</label>
                            <div className="relative w-full">
                                <textarea
                                    placeholder="San Salvador, El Salvador..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="w-full h-[46px] pr-10 resize-none rounded-xl px-4 py-3 bg-white/5 text-white placeholder-white/30 font-poppins text-sm border border-white/10 outline-none focus:border-successLight/60 focus:bg-white/8 transition-all shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="absolute top-1/2 -translate-y-1/2 right-3 text-lg hover:scale-115 transition-transform duration-200 cursor-pointer"
                                    title="Marcar ubicación en el mapa"
                                >
                                    📍
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-white/80 font-poppins text-xs font-semibold pl-1">Contraseña</label>
                            <Input
                                type="password"
                                placeHolder="Mínimo 8 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                                required
                                className="w-full bg-white/5 text-white border border-white/15 focus:border-successLight"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-white/80 font-poppins text-xs font-semibold pl-1">Confirmar Contraseña</label>
                            <Input
                                type="password"
                                placeHolder="Repite tu contraseña"
                                value={cPassword}
                                onChange={(e) => setCPassword(e.target.value)}
                                error={errors.cPassword}
                                required
                                className="w-full bg-white/5 text-white border border-white/15 focus:border-successLight"
                            />
                        </div>
                    </div>

                </div>

                {errors.default && (
                    <div className="p-3 bg-red-900/40 border border-red-500/20 rounded-xl text-center">
                        <p className="text-red-200 font-poppins text-xs font-semibold">{errors.default}</p>
                    </div>
                )}

                {/* 3. Botón de Enviar y Enlace de Log In */}
                <div className="flex flex-col items-center gap-4 mt-2">
                    <Button type="submit" className="w-full md:w-2/3 bg-successLight text-primaryAltDark hover:bg-green-400 py-3 rounded-xl font-bold shadow-xl transition-all duration-300 text-center">
                        Crear Cuenta
                    </Button>

                    <p className="text-white/80 font-poppins text-sm">
                        ¿Ya tienes una cuenta?{" "}
                        <a href="/" className="text-successLight hover:text-green-300 font-bold underline transition-colors">
                            Inicia Sesión
                        </a>
                    </p>
                </div>
            </form>

            {isModalOpen && (
                <LocationModal
                    position={position}
                    setPosition={setPosition}
                    setAddress={setAddress}
                    setLat={setLat}
                    setLng={setLng}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    )
}

export default RegisterForm
