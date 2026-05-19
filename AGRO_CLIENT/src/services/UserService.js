const API_URL = import.meta.env.VITE_API_BASE_URL; 

export const getUserInfo = async () => {
  const token = localStorage.getItem("token"); 
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
};


export async function updateUser(updatedData) {

  const token = localStorage.getItem("token")
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
}

export async function getSellers() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/profile/nearby-sellers`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if(!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error fetching sellers")
  }

  const data = await response.json();
  return data.sellers;
}

export async function addCredits(amount) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/credits/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ credits: parseFloat(amount) })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al recargar créditos");
  }

  const data = await response.json();
  return data;
}

export async function substractCredits(amount) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/credits/substract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ credits: parseFloat(amount) })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al retirar saldo");
  }

  const data = await response.json();
  return data;
}

export async function createTransaction(type, value) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/transactions/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ type, value: parseFloat(value) })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear transacción");
  }

  const data = await response.json();
  return data;
}

export async function getTransactions() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/transactions/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al obtener transacciones");
  }

  const data = await response.json();
  return data;
}
