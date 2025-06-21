const API_URL = import.meta.env.VITE_API_BASE_URL; 


export const getCart = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/cart/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            });

            if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en getCart:", error.message);
        return null;
    }
}

export const addToCart = async (productId, quantity) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({productId, quantity})
            })

            if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en addtoCart:", error.message);
        throw error;
    }
}

export const removeFromCart = async (productId) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/cart/remove`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId })
            });

            if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en removeCart:", error.message);
        throw error;
    }    
} 

export const updateCart = async (items) => {
    const token = localStorage.getItem("token");
    try {
    const response = await fetch(`${API_URL}/cart/update`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({items})
        });

        if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en updateCart:", error.message);
        throw error;
    }     
} 
