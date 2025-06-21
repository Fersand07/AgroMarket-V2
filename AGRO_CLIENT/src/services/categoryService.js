const API_URL = import.meta.env.VITE_API_BASE_URL; 


export const getCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/data/categories`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

export const getMeasureUnits = async () => {
    try {
        const response = await fetch(`${API_URL}/data/measureUnits`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}