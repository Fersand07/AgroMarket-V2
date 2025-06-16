import { getUserInfo, updateUser } from "../../services/UserService";
import { useEffect, useState } from "react";
import Button from "../../components/Button";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", phone: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/

  const loadUser = async () => {
    try {
      const data = await getUserInfo();
      if (data && data.user) {
        setUser(data.user);
        setEditForm({
          username: data.user.username || "",
          phone: data.user.phone || "",
          email: data.user.email || "",
        });
      }
    } catch (err) {
      console.error("No se pudo cargar el usuario:", err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return "";
    return phone.length > 4 ? `${phone.substring(0, 4)}-${phone.substring(4)}` : phone;
  };

  const cleanPhoneForStorage = (phone) => phone?.replace(/-/g, "") ?? "";

  const getShortAddress = (address) => {
    if (!address) return "";
    const parts = address.split(",");
    return `${parts[0]}, ${parts[1]}, ${parts[parts.length - 1]}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prevForm) => ({
      ...prevForm,
      [name]: name === "phone" ? cleanPhoneForStorage(value) : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await updateUser(editForm);
      console.log("Respuesta del backend:", response);

      // Se vuelve a cargar el usuario desde la fuente confiable (getUserInfo)
      await loadUser();

      setIsEditing(false);
    } catch (err) {
      console.error("Error al actualizar el usuario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validar que las contraseñas coincidan
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    // Validar longitud mínima
    if (!passwordRegex.test(passwordForm.newPassword)) {
      setPasswordError("Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.");
      return;
    }

    setIsLoading(true);

    try {
      // Usar el mismo servicio updateUser para cambiar la contraseña
      const response = await updateUser({ password: passwordForm.newPassword });
      console.log("Respuesta del backend:", response);
      
      // Limpiar formulario y cerrar
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
    } catch (err) {
      console.error("Error al cambiar la contraseña:", err);
      setPasswordError("Error al cambiar la contraseña. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        username: user.username || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
    setIsEditing(false);
  };

  const handleCancelPasswordChange = () => {
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setIsChangingPassword(false);
  };

  if (!user) return <p>Cargando usuario...</p>;

  return (
    <div className="max-w-4xl mx-auto font-poppins bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="h-48 bg-gradient-to-r from-primaryColor to-primaryAltDark relative">
        <div className="absolute -bottom-16 left-6">
          <img
            src={user.image}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white object-cover"
          />
        </div>
      </div>

      <div className="pt-20 px-6 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">@{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          {!isEditing && !isChangingPassword ? (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)}>
                Editar Perfil
              </Button>
              <Button 
                onClick={() => setIsChangingPassword(true)}
              >
                Cambiar Contraseña
              </Button>
            </div>
          ) : isEditing ? (
            <Button 
              onClick={() => {setIsEditing(false);  handleCancelEdit()}}
            >
              Cancelar
            </Button>
          ) : (
            <Button 
              onClick={() => {setIsChangingPassword(false); handleCancelPasswordChange()}}
            >
              Cancelar
            </Button>
          )}
        </div>

        {isChangingPassword ? (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cambiar Contraseña</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa tu nueva contraseña"
                  required
                  minLength="8"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirma tu nueva contraseña"
                  required
                  minLength="8"
                />
              </div>

              {passwordError && (
                <div className="text-red-600 text-sm">{passwordError}</div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} >
                  {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
              </div>
            </form>
          </div>
        ) : isEditing ? (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Perfil</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nombre de usuario</label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formatPhoneForDisplay(editForm.phone)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 7895-5474"
                  pattern="[0-9]{4}-[0-9]{4,7}"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Información de contacto</h3>
              <div className="space-y-2">
                <p className="text-gray-600">{formatPhoneForDisplay(user.phone) || "No proporcionado"}</p>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-gray-600">{getShortAddress(user.address)}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Información de cuenta</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Créditos:</span> ${user.credit?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;