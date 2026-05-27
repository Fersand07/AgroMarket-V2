export const uploadImage = async (image) => {
    const cloudName = import.meta.env.VITE_PUBLIC_CLOUDINARY_CLOUD_NAME;

    // Fallback: Si no hay cuenta de Cloudinary configurada, se convierte la imagen a base64 de manera local.
    // Esto permite que el sistema funcione perfectamente sin depender de servicios externos en desarrollo local.
    if (!cloudName) {
        console.info("Cloudinary no configurado. Utilizando base64 como fallback local...");
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Error al convertir la imagen local"));
            reader.readAsDataURL(image);
        });
    }

    try {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "avatar"); // Debe coincidir con tu preset en Cloudinary
      
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
      
        if (!res.ok) {
          throw new Error("Respuesta no exitosa de Cloudinary");
        }
      
        const data = await res.json();
        return data.secure_url;
    } catch (error) {
        console.warn("Fallo en la subida a Cloudinary. Usando fallback de base64 local:", error);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Error al procesar archivo de imagen"));
            reader.readAsDataURL(image);
        });
    }
};