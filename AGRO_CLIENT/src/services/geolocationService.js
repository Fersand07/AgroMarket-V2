
//Este servicio nos retorna un json en base a las coordenadas que le mandemos, ejemplo de retorno

//-> Banco Cuscatlan, av etc etc 

export const geolocationService = async (lat, lng) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
            headers: {
                'User-Agent': 'AgroMarketApp/1.0 (tucorreo@ejemplo.com)' 
            }
        }
    )

    if (!response.ok) {
        throw new Error('Error al obtener la dirección')
    }

    const data = await response.json()
    return data.display_name // o data.address si quieres algo más detallado
}
