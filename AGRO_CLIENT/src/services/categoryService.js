const API_URL = import.meta.env.VITE_API_BASE_URL; 

export const getCategories = async () => {
    const response = await fetch(`${API_URL}/data/categories`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las categorias');
    }
    const data = await response.json();
    return data;
}

export const getMeasureUnits = async () => {
    const response = await fetch(`${API_URL}/data/measureUnits`);
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener las unidades de medida')
    }
    const data = await response.json();
    return data;
}