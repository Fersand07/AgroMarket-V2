export const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "avatar"); // debe coincidir con tu preset en Cloudinary
  
    const cloudName = import.meta.env.VITE_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) {
      throw new Error("Error al subir la imagen");
    }
  
    const data = await res.json();
    return data.secure_url;
  };
  