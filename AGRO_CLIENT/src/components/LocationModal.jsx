import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { geolocationService } from '../services/geolocationService'

// Componente para manejar marcador interactivo
function LocationPicker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng])
        }
    })

    return (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target
                    const { lat, lng } = marker.getLatLng()
                    setPosition([lat, lng])
                },
            }}
        />
    )
}

// Modal de selección de ubicación
const LocationModal = ({ position, setPosition, setAddress, setLat, setLng, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[75%] h-[75%] overflow-hidden flex flex-col">
                <h2 className="text-2xl font-bold mb-2">Selecciona tu dirección</h2>
                <p className="mb-4 text-sm text-gray-600">
                    Haz clic o arrastra el marcador para elegir una ubicación.
                </p>

                {/* Mapa */}
                <div className="flex-1">
                    <MapContainer
                        center={position}
                        zoom={13}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker position={position} setPosition={setPosition} />
                    </MapContainer>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={async () => {
                            try {
                                const [lat, lng] = position
                                const name = await geolocationService(lat, lng)
                                setAddress(name)
                                setLat(lat)
                                setLng(lng)
                                onClose()
                            } catch (error) {
                                console.error("Error al obtener la dirección:", error)
                                alert("No se pudo obtener la dirección.")
                            }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Guardar dirección
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LocationModal
