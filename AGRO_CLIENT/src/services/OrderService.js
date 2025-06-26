const API_URL = import.meta.env.VITE_API_BASE_URL; 

export const createOrder = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });


    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "No se pudo crear la orden");
    }

    const data = await response.json();
    return data;
}

export const getOrders = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/orders`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al obtener las órdenes");
    }

    const data = await response.json()
    return data;
}

export const getOrderById = async (orderId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al obtener la orden")
    }

    const data = await response.json()
    return data
}

export const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_URL}/orders/status/${orderId}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newStatus })
    });

    if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el estado de la orden");
    }

    const data = await response.json();
    return data;
}