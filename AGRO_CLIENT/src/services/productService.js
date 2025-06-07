const API_URL = import.meta.env.VITE_API_BASE_URL; 

export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products/all`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};
