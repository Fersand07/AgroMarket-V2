const API_URL = import.meta.env.VITE_API_BASE_URL; 

export const getProducts = async () => {
    const response = await fetch(`${API_URL}/products/all`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data; 
};

export const getProductById = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener productos por id')
    }
    const data = await response.json();
    return data;
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

export const updateProduct = async (productId, updatedData) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/products/update/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updatedData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el producto');
  }

  return await response.json();
}

export const getProductsByArea = async (distanceRadius) => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/products/nearby?maxDistance=${distanceRadius}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener productos cercanos');
  }

  const data = await response.json();
  return data
}



