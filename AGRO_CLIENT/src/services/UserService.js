const API_URL = import.meta.env.VITE_API_BASE_URL; 

export const getUserInfo = async () => {
  const token = localStorage.getItem("token"); // o sessionStorage

  if (!token) {
    throw new Error("Token no encontrado");
  }

  try {
    const response = await fetch(`${API_URL}/profile/info`, {
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
    console.error("Error al obtener la información del usuario:", error);
    throw error;
  }
};


export async function updateUser(updatedData) {

  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Token no encontrado");
  }

  try {
    const res = await fetch(`${API_URL}/profile/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update user');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Update user error:', error.message);
    throw error;
  }
}


