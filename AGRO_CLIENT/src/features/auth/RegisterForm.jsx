import { useState } from "react"
import Input from "../../components/Input"
import Button from "../../components/Button"
import { registerService } from "../../services/AuthService"
import { useNavigate } from "react-router-dom"
import LocationModal from "../../components/LocationModal"
import Swal from "sweetalert2"

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
            const response = await registerService(username, email, address, phoneNumber, password, lat, lng)
            if (response.message == 'Usuario creado') {
                await Swal.fire({
                    title: '¡Registro Exitoso!',
                    text: 'Tu cuenta ha sido creada correctamente',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
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
        <>
            <form className="flex flex-col gap-5 items-center" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeHolder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-5/6"
                />
                <Input
                    type="email"
                    placeHolder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-5/6"
                />

                {/* Dirección con botón para mapa */}
                <div className="w-full relative">
                <textarea
                  placeholder="Dirección"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="pr-10 w-full h-25 resize-none border rounded px-3 py-2 bg-white text-black"
                />
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                 className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg"
                >
                    📍
                 </button>
                </div>



                <Input
                    type="text"
                    placeHolder="Teléfono"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    error={errors.phoneNumber}
                    required
                    className="w-5/6"
                />
                <Input
                    type="password"
                    placeHolder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    required
                    className="w-5/6"
                />
                <Input
                    type="password"
                    placeHolder="Confirmar contraseña"
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    error={errors.cPassword}
                    required
                    className="w-5/6"
                />

                {errors.default && (
                    <p className="text-white-700 font-poppins font-bold">{errors.default}</p>
                )}

                <Button type="submit" className="w-5/6">Registrate</Button>

                <p className="text-white font-poppins font-bold">
                    ¿Ya tienes una cuenta?{" "}
                    <span className="text-black font-bold hover:text-gray-900">
                        <a href="/">Inicia Sesión</a>
                    </span>
                </p>
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
        </>
    )
}

export default RegisterForm
