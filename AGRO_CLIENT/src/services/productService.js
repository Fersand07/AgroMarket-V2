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

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erroe al obtener el producto', error);
    throw error;
  }
}
export const createProductService = async (productData, token) => {
  const response = await fetch(`${API_URL}/products/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear el producto');
  }

  return await response.json();
};

export const getProductsPostedByUser = async () => {
  const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/products/user/ownProducts`, {
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; 
}




