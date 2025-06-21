const API_URL = import.meta.env.VITE_API_BASE_URL; 


export const getCart = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/cart/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Getting Cart Error')
    }
    const data = await response.json();
    return data;
}

export const addToCart = async (productId, quantity) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({productId, quantity})
    })

    if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Adding to Cart Error')
    }

    const data = await response.json();
    return data;
}

export const removeFromCart = async (productId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/cart/remove`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId })
    });

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Removing for cart Error')
    }

    const data = await response.json();
    return data;
} 

export const updateCart = async (items) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/cart/update`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({items})
    }); 

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Updating Cart Error')
    }

    return response.json()
} 
