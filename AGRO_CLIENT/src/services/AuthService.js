const API_URL = import.meta.env.VITE_API_BASE_URL;

export const loginService = async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({username, password})
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Authentication Error')
    } 

    return response.json()
}

export const registerService = async (username, email, address, phone, password, lat, lng) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, email, address, phone, password, lat, lng})
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Register Error')
    }

    return response.json()
}