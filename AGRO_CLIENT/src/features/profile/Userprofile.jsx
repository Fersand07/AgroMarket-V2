import { getUserInfo, updateUser, addCredits, substractCredits, createTransaction, getTransactions } from "../../services/UserService";
import { getProductsPostedByUser } from "../../services/productService";
import { getOrders } from "../../services/OrderService";
import { useEffect, useState } from "react";
import Button from "../../components/Button";
import { 
  User, Phone, Mail, MapPin, ShieldAlert, CreditCard, Lock,
  TrendingUp, BarChart3, ShoppingBag, Landmark, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { customSwal } from "../../helpers/swalHelper";
import LocationModal from "../../components/LocationModal";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", phone: "", email: "", address: "", lat: null, lng: null });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  
  // Estados para selección visual en mapa
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapPosition, setMapPosition] = useState([13.6929, -89.2182]);

  const handleOpenMap = () => {
    const lat = editForm.lat || user.lat || 13.6929;
    const lng = editForm.lng || user.lng || -89.2182;
    setMapPosition([lat, lng]);
    setIsMapModalOpen(true);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);

  // States for Seller Dashboard & Withdrawals
  const [transactions, setTransactions] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDetails, setWithdrawDetails] = useState({
    bank: "Banco Agrícola",
    accountNumber: "",
    fullName: ""
  });
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

  const loadDashboardDataForUser = async (userId) => {
    try {
      const transData = await getTransactions();
      if (transData && transData.alltransactions) {
        setTransactions(transData.alltransactions);
      }
      
      const prodData = await getProductsPostedByUser();
      if (prodData && prodData.products) {
        setSellerProducts(prodData.products);
      }
      
      const orderData = await getOrders();
      if (orderData) {
        const filtered = orderData.filter(o => 
          o.sellerId === userId || 
          o.seller === userId || 
          (o.seller && (o.seller.id === userId || o.seller._id === userId))
        );
        setSellerOrders(filtered);
      }
    } catch (err) {
      console.error("Error al cargar datos del dashboard de vendedor:", err);
    }
  };

  const loadUser = async () => {
    try {
      const data = await getUserInfo();
      if (data && data.user) {
        setUser(data.user);
        setEditForm({
          username: data.user.username || "",
          phone: data.user.phone || "",
          email: data.user.email || "",
          address: data.user.address || "",
          lat: data.user.lat || null,
          lng: data.user.lng || null,
        });

        loadDashboardDataForUser(data.user.id);
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
    if (parts.length <= 2) return address;
    return `${parts[0].trim()}, ${parts[1].trim()}, ${parts[parts.length - 1].trim()}`;
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
    
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalForm = { ...editForm };

      // Geocodificación si la dirección cambió o si no tenemos lat/lng
      if (editForm.address && (editForm.address !== user.address || !user.lat || !user.lng)) {
        try {
          const query = encodeURIComponent(editForm.address);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
            {
              headers: {
                'User-Agent': 'AgroMarketApp/1.0 (agro-market-support@agro.com)'
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const result = data[0];
              finalForm.lat = parseFloat(result.lat);
              finalForm.lng = parseFloat(result.lon);
              console.log("Geocodificación exitosa:", finalForm.lat, finalForm.lng);
            } else {
              console.warn("No se encontraron resultados para la dirección, usando fallback.");
              finalForm.lat = user.lat || 13.6929;
              finalForm.lng = user.lng || -89.2182;
            }
          } else {
            console.error("Error en la respuesta de Nominatim:", response.status);
            finalForm.lat = user.lat || 13.6929;
            finalForm.lng = user.lng || -89.2182;
          }
        } catch (geoErr) {
          console.error("Error al geocodificar dirección:", geoErr);
          finalForm.lat = user.lat || 13.6929;
          finalForm.lng = user.lng || -89.2182;
        }
      } else {
        // Mantener coordenadas existentes si la dirección no cambió
        finalForm.lat = user.lat;
        finalForm.lng = user.lng;
      }

      await updateUser(finalForm);
      await loadUser();
      setIsEditing(false);
      customSwal.fire({
        title: "Perfil Actualizado",
        text: "Tus datos personales y ubicación se han guardado con éxito",
        icon: "success",
        iconColor: "#A4D6A0",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error al actualizar el usuario:", err);
      customSwal.fire({
        title: "Error",
        text: "No se pudieron guardar los cambios. Intenta nuevamente.",
        icon: "error",
        iconColor: "#EF4444"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (!passwordRegex.test(passwordForm.newPassword)) {
      setPasswordError("Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.");
      return;
    }

    setIsLoading(true);

    try {
      await updateUser({ password: passwordForm.newPassword });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
      customSwal.fire({
        title: "Contraseña Cambiada",
        text: "Tu contraseña ha sido actualizada exitosamente",
        icon: "success",
        iconColor: "#A4D6A0",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error al cambiar la contraseña:", err);
      customSwal.fire({
        title: "Error",
        text: "No se pudo actualizar la contraseña. Intenta de nuevo.",
        icon: "error",
        iconColor: "#EF4444"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      customSwal.fire({
        title: "Cantidad Inválida",
        text: "Por favor ingresa un monto mayor a cero",
        icon: "warning",
        iconColor: "#FBBF24"
      });
      return;
    }

    setIsRecharging(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const rawNum = cardDetails.number.replace(/\s/g, "");
      const last4 = rawNum.length >= 4 ? rawNum.slice(-4) : "xxxx";
      const metadata = { last4, cardName: cardDetails.name };

      const res = await addCredits(rechargeAmount);
      await createTransaction("Recarga", rechargeAmount, metadata);
      
      setUser(prev => ({ ...prev, credit: res.credits }));
      loadDashboardDataForUser(user.id);
      
      setShowRechargeModal(false);
      setRechargeAmount("");
      setCardDetails({ number: "", name: "", expiry: "", cvv: "" });
      
      customSwal.fire({
        title: "¡Recarga Exitosa!",
        text: `Se han añadido $${parseFloat(rechargeAmount).toFixed(2)} a tu cuenta con éxito.`,
        icon: "success",
        iconColor: "#A4D6A0",
        timer: 3000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      customSwal.fire({
        title: "Error de Pago",
        text: err.message || "No se pudo procesar la recarga. Intenta de nuevo.",
        icon: "error",
        iconColor: "#EF4444"
      });
    } finally {
      setIsRecharging(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      customSwal.fire({
        title: "Monto Inválido",
        text: "Por favor ingresa un monto mayor a cero",
        icon: "warning",
        iconColor: "#FBBF24"
      });
      return;
    }

    if (parseFloat(withdrawAmount) > user.credit) {
      customSwal.fire({
        title: "Saldo Insuficiente",
        text: "El monto a retirar supera tu balance de ganancias acumuladas",
        icon: "error",
        iconColor: "#EF4444"
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const rawAcc = withdrawDetails.accountNumber.replace(/\s/g, "");
      const last4Acc = rawAcc.length >= 4 ? rawAcc.slice(-4) : "xxxx";
      const metadata = { 
        bank: withdrawDetails.bank, 
        accountNumber: last4Acc, 
        fullName: withdrawDetails.fullName 
      };

      const res = await substractCredits(withdrawAmount);
      await createTransaction("Retiro", withdrawAmount, metadata);
      
      setUser(prev => ({ ...prev, credit: res.credits }));
      
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawDetails({ bank: "Banco Agrícola", accountNumber: "", fullName: "" });
      
      // Refresh transactions and sales statistics
      loadDashboardDataForUser(user.id);
      
      customSwal.fire({
        title: "¡Retiro Exitoso!",
        text: `Se han transferido $${parseFloat(withdrawAmount).toFixed(2)} a tu cuenta de ${withdrawDetails.bank} con éxito de forma simulada.`,
        icon: "success",
        iconColor: "#A4D6A0",
        timer: 3000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      customSwal.fire({
        title: "Error de Retiro",
        text: err.message || "No se pudo procesar la transferencia. Intenta de nuevo.",
        icon: "error",
        iconColor: "#EF4444"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        username: user.username || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
        lat: user.lat || null,
        lng: user.lng || null,
      });
    }
    setIsEditing(false);
  };

  const handleCancelPasswordChange = () => {
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setIsChangingPassword(false);
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-white/60 font-semibold animate-pulse font-poppins">Cargando perfil de usuario...</p>
    </div>
  );

  const isSeller = user.role === 'seller';

  return (
    <div className="max-w-4xl mx-auto font-poppins bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden select-none animate-fade-in">
      
      {/* Header Banner with Premium Gradients */}
      <div className="h-48 bg-gradient-to-r from-successLight/15 via-primaryColor/30 to-primaryAltDark/50 relative border-b border-white/10 flex items-center">
        {/* Glow particle in the banner */}
        <div className="absolute right-12 top-6 w-32 h-32 bg-successLight/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Profile Image container */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative group">
            <img
              src={user.image}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-successLight/40 object-cover shadow-2xl transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-bold tracking-wider uppercase">Ver foto</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 px-8 pb-8">
        
        {/* Profile Heading Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black text-white tracking-wide">@{user.username}</h1>
              <span className="text-xxs font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-successLight/10 border border-successLight/20 text-successLight">
                {isSeller ? "Vendedor" : "Comprador"}
              </span>
            </div>
            <p className="text-white/60 text-sm mt-1">{user.email}</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {!isEditing && !isChangingPassword ? (
              <>
                <Button 
                  className="flex-1 sm:flex-none bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-bold uppercase tracking-widest text-xs px-5 py-3.5 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)]"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Perfil
                </Button>
                <Button 
                  className="flex-1 sm:flex-none bg-white/5 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs px-5 py-3.5 rounded-xl transition-all duration-300 border border-white/10"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Contraseña
                </Button>
              </>
            ) : isEditing ? (
              <Button 
                className="w-full sm:w-auto bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all duration-300"
                onClick={() => {setIsEditing(false); handleCancelEdit()}}
              >
                Cancelar
              </Button>
            ) : (
              <Button 
                className="w-full sm:w-auto bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all duration-300"
                onClick={() => {setIsChangingPassword(false); handleCancelPasswordChange()}}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Forms / Profile Data Section */}
        {isChangingPassword ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-5 h-5 text-successLight" />
              Cambiar Contraseña
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-green-950/40 text-white placeholder-white/35 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
                    placeholder="Ingresa tu nueva contraseña"
                    required
                    minLength="8"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="bg-green-950/40 text-white placeholder-white/35 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
                    placeholder="Confirma tu nueva contraseña"
                    required
                    minLength="8"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex justify-start">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)]"
                >
                  {isLoading ? "Cambiando..." : "Actualizar Contraseña"}
                </Button>
              </div>
            </form>
          </div>
        ) : isEditing ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <User className="w-5 h-5 text-successLight" />
              Editar Detalles Personales
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleInputChange}
                    className="bg-green-950/40 text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formatPhoneForDisplay(editForm.phone)}
                    onChange={handleInputChange}
                    className="bg-green-950/40 text-white placeholder-white/35 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
                    placeholder="Ej: 7895-5474"
                    pattern="[0-9]{4}-[0-9]{4,7}"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="bg-green-950/40 text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2">
                  Dirección Residencial / Comercial
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    className="bg-green-950/40 text-white placeholder-white/35 border border-white/10 rounded-xl pl-4 pr-12 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
                    placeholder="Ej: Santa Tecla, La Libertad, El Salvador"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleOpenMap}
                    className="absolute top-1/2 -translate-y-1/2 right-4 text-lg hover:scale-115 transition-transform duration-200 cursor-pointer text-successLight"
                    title="Marcar ubicación en el mapa"
                  >
                    📍
                  </button>
                </div>
              </div>

              <div className="flex justify-start">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)]"
                >
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Profile Read-Only Cards */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Contact details card */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl flex items-start gap-4">
                <div className="p-3 bg-successLight/10 rounded-xl border border-successLight/20 text-successLight shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-black text-white uppercase tracking-wider text-xs">Información de Contacto</h3>
                  <div className="space-y-1.5 text-sm text-white/70">
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/40 shrink-0" />
                      <span>{formatPhoneForDisplay(user.phone) || "Teléfono no proporcionado"}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/40 shrink-0" />
                      <span>{user.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/40 shrink-0" />
                      <span>{getShortAddress(user.address) || "Dirección no proporcionada"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Account / Earnings Details card */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-successLight/10 rounded-xl border border-successLight/20 text-successLight shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-black text-white uppercase tracking-wider text-xs">
                      {isSeller ? "Balance de Ganancias" : "Información de Cuenta"}
                    </h3>
                    <div className="space-y-1.5 text-sm text-white/70">
                      <p className="text-white/80">
                        {isSeller ? "Saldo acumulado por tus ventas locales:" : "Saldo disponible para tus compras locales:"}
                      </p>
                      <p className="text-successLight font-black text-3xl tracking-tight mt-2">
                        ${user.credit?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
                {isSeller ? (
                  <Button
                    className="w-full sm:w-auto bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-bold uppercase tracking-widest text-xs px-5 py-3 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.2)]"
                    onClick={() => setShowWithdrawModal(true)}
                  >
                    Retirar Ganancias
                  </Button>
                ) : (
                  <Button
                    className="w-full sm:w-auto bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-bold uppercase tracking-widest text-xs px-5 py-3 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.2)]"
                    onClick={() => setShowRechargeModal(true)}
                  >
                    Recargar Saldo
                  </Button>
                )}
              </div>

            </div>

            {/* Buyer History Panel */}
            {!isSeller && (
              <div className="mt-12 pt-8 border-t border-white/10 animate-fade-in space-y-6">
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-successLight/10 rounded-xl border border-successLight/20 text-successLight">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Historial de Movimientos</h2>
                    <p className="text-white/50 text-xs mt-0.5">Registro de tus recargas y compras realizadas</p>
                  </div>
                </div>

                {/* Money Transactions History for Buyer */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                    {transactions.length > 0 ? (
                      transactions.map((t) => {
                        const isExpense = t.type.toLowerCase() === 'compra' || t.value < 0;
                        return (
                          <div 
                            key={t._id} 
                            onClick={() => setSelectedTransaction(t)}
                            className="flex justify-between items-center p-4 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl transition duration-300 text-xs cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isExpense ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-bold text-white">
                                  {t.type === 'Recarga' ? 'Recarga de Saldo' :
                                   t.type === 'Compra' ? 'Compra de Productos' :
                                   t.type === 'Reembolso' ? 'Reembolso por Cancelación' :
                                   t.type === 'Devolución' ? 'Cancelación de Venta' : t.type}
                                </p>
                                <p className="text-[9px] text-white/40 mt-0.5">
                                  {new Date(t.date).toLocaleDateString()} a las {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                            </div>
                            <span className={`font-black text-sm ${isExpense ? 'text-red-400' : 'text-successLight'}`}>
                              {isExpense ? "-" : "+"}${Math.abs(t.value).toFixed(2)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-white/40 text-center py-8 font-poppins">No hay movimientos registrados en esta cuenta.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Seller Dashboard Panel */}
        {isSeller && (
          <div className="mt-12 pt-8 border-t border-white/10 animate-fade-in space-y-8">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-successLight/10 rounded-xl border border-successLight/20 text-successLight">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Dashboard de Control Comercial</h2>
                <p className="text-white/50 text-xs mt-0.5">Análisis en tiempo real de tu tienda, ventas e inventario local</p>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Ganado */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ingresos Totales</p>
                  <p className="text-2xl font-black text-white mt-1">
                    ${transactions.filter(t => t.type === 'Venta' || t.type.toLowerCase() === 'venta').reduce((acc, curr) => acc + Math.abs(curr.value), 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Saldo Disponible */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Saldo de Ventas</p>
                  <p className="text-2xl font-black text-successLight mt-1">
                    ${user.credit?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="p-2.5 bg-successLight/10 rounded-lg text-successLight">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Productos Activos */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mis Productos</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {sellerProducts.length}
                  </p>
                </div>
                <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Órdenes Totales */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ventas Totales</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {sellerOrders.length}
                  </p>
                </div>
                <div className="p-2.5 bg-yellow-500/10 rounded-lg text-yellow-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Visual Charts & Logistics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Product Sales & Views Bar Chart */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <BarChart3 className="w-4 h-4 text-successLight" />
                  Rendimiento y Popularidad de Productos
                </h3>
                
                <div className="space-y-4">
                  {sellerProducts.length > 0 ? (
                    sellerProducts.slice(0, 4).map((prod) => {
                      // Calculate sales count
                      let soldQty = 0;
                      sellerOrders.forEach(order => {
                        if (order.status === 'completed' || order.status === 'delivered') {
                          order.items.forEach(item => {
                            if (item.product && (item.product._id === prod.id || item.product.id === prod.id)) {
                              soldQty += item.quantity;
                            }
                          });
                        }
                      });

                      // Simulated views: consistent using a hash based on the product ID or name
                      let hash = 0;
                      const str = (prod.id || "") + prod.name;
                      for (let i = 0; i < str.length; i++) {
                        hash = str.charCodeAt(i) + ((hash << 5) - hash);
                      }
                      const views = Math.abs(hash % 240) + 40;

                      // Views percentage for progress bar (max 300)
                      const pct = Math.min((views / 300) * 100, 100);

                      return (
                        <div key={prod.id || prod._id} className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-white font-bold truncate max-w-[180px]">{prod.name}</span>
                            <div className="flex items-center gap-3 text-white/50 text-[10px]">
                              <span>Visto: <strong className="text-successLight font-bold">{views}</strong> veces</span>
                              <span>•</span>
                              <span>Vendido: <strong className="text-emerald-400 font-bold">{soldQty}</strong> u.</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                            {/* Views Bar */}
                            <div 
                              style={{ width: `${pct}%` }} 
                              className="bg-gradient-to-r from-successLight to-emerald-500 h-full rounded-full transition-all duration-1000"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-white/40 text-center py-8">No tienes productos publicados para analizar.</p>
                  )}
                </div>
              </div>

              {/* Delivery Logistics Status list */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                  <Activity className="w-4 h-4 text-successLight" />
                  Estatus de Entregas y Pedidos
                </h3>

                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {sellerOrders.length > 0 ? (
                    sellerOrders.slice(0, 4).map((order) => {
                      let statusText = "Pendiente";
                      let statusColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                      
                      if (order.status === 'in_progress') {
                        statusText = "En camino";
                        statusColor = "text-blue-400 bg-blue-400/10 border-blue-400/20";
                      } else if (order.status === 'completed' || order.status === 'delivered') {
                        statusText = "Completado";
                        statusColor = "text-successLight bg-successLight/10 border-successLight/20";
                      } else if (order.status === 'cancelled') {
                        statusText = "Cancelado";
                        statusColor = "text-red-400 bg-red-400/10 border-red-400/20";
                      }

                      const totalValue = order.items.reduce((acc, curr) => acc + (curr.product?.price || 0) * curr.quantity, 0);

                      return (
                        <div key={order._id} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-white uppercase tracking-wide">Venta #{order._id.substring(0, 8)}</p>
                            <p className="text-white/40 text-[10px]">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-white">${totalValue.toFixed(2)}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-white/40 text-center py-8">No has recibido órdenes de compra aún.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Money Transactions History */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                <Landmark className="w-4 h-4 text-successLight" />
                Historial de Movimientos Recientes
              </h3>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {transactions.length > 0 ? (
                  transactions.map((t) => {
                    const isRetiro = t.type.toLowerCase() === 'retiro' || t.value < 0;
                    return (
                      <div 
                        key={t._id} 
                        onClick={() => setSelectedTransaction(t)}
                        className="flex justify-between items-center p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition duration-300 text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isRetiro ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {isRetiro ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {t.type === 'Retiro' ? "Retiro a Cuenta Bancaria" :
                               t.type === 'Venta' ? "Ingreso por Venta Local" :
                               t.type === 'Reembolso' ? 'Reembolso por Cancelación' :
                               t.type === 'Devolución' ? 'Cancelación de Venta' : t.type}
                            </p>
                            <p className="text-[9px] text-white/40 mt-0.5">{new Date(t.date).toLocaleDateString()} a las {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                        <span className={`font-black text-sm ${isRetiro ? 'text-red-400' : 'text-successLight'}`}>
                          {isRetiro ? "-" : "+"}${Math.abs(t.value).toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-white/40 text-center py-6">No hay transacciones ni retiros registrados en esta cuenta.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Recharge Modal with 3D Flip Card */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-[#09110a]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-green-950/95 border border-white/10 rounded-3xl w-full max-w-4xl overflow-y-auto max-h-[90vh] shadow-2xl p-6 md:p-8 font-poppins relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="text-successLight animate-pulse" />
                Recargar Saldo en Cuenta
              </h2>
              <button 
                onClick={() => {
                  setShowRechargeModal(false);
                  setCardDetails({ number: "", name: "", expiry: "", cvv: "" });
                  setRechargeAmount("");
                }} 
                className="text-white/60 hover:text-white font-bold text-sm tracking-wide bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300"
              >
                Cerrar
              </button>
            </div>

            {/* Two-Column Responsive Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Left Column: Interactive 3D Card Display */}
              <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-2xl shadow-inner min-h-[280px] md:min-h-[380px] relative overflow-hidden group">
                {/* Glow behind the card */}
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-successLight/10 rounded-full blur-3xl pointer-events-none transition duration-500 group-hover:bg-successLight/15" />
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition duration-500 group-hover:bg-emerald-500/15" />

                <div className="w-full max-w-[320px] h-[190px] perspective-1000 z-10">
                  <div className={`w-full h-full relative credit-card-inner preserve-3d ${isCardFlipped ? "flipped" : ""}`}>
                    
                    {/* Card Front */}
                    <div className="absolute inset-0 bg-gradient-to-br from-successLight/30 via-emerald-800 to-green-950 border border-white/20 rounded-2xl p-5 backface-hidden shadow-xl flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-xs uppercase tracking-widest text-successLight">AgroMarket Gold</span>
                        <span className="text-xl font-bold text-white/40">VISA</span>
                      </div>
                      
                      {/* Card Chip & Wi-Fi */}
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-7 bg-amber-400/80 rounded-md border border-amber-500/20 shadow-inner" />
                        <div className="text-white/40 font-semibold text-[10px]">)))</div>
                      </div>
                      
                      {/* Card Number */}
                      <div className="text-lg font-mono font-bold tracking-[0.15em] text-white/90 drop-shadow-md text-center py-2">
                        {cardDetails.number || "•••• •••• •••• ••••"}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-successLight/70 font-black">Tarjetahabiente</p>
                          <p className="text-xs font-bold truncate max-w-[150px] uppercase font-mono">{cardDetails.name || "NOMBRE COMPLETO"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-wider text-successLight/70 font-black">Vence</p>
                          <p className="text-xs font-bold font-mono">{cardDetails.expiry || "MM/AA"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Back */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-emerald-950 to-neutral-900 border border-white/20 rounded-2xl backface-hidden rotate-y-180 shadow-xl flex flex-col justify-between py-5 text-white">
                      {/* Magnetic Strip */}
                      <div className="w-full h-10 bg-neutral-900 mt-2" />
                      
                      {/* Signature & CVV */}
                      <div className="px-5 mt-2 flex items-center justify-between">
                        <div className="w-3/4 h-8 bg-white/10 border border-white/5 rounded-md flex items-center px-3 text-[10px] italic text-white/60 font-mono">
                          AgroMarket Authorized Signature
                        </div>
                        <div className="w-16 h-8 bg-white text-black font-mono font-bold text-center flex items-center justify-center rounded-md border border-white/20 shadow-inner">
                          {cardDetails.cvv || "•••"}
                        </div>
                      </div>
                      
                      {/* Back text */}
                      <div className="px-5 text-[7px] text-white/30 leading-normal">
                        Esta tarjeta es intransferible y de uso exclusivo en la pasarela simulada de AgroMarket. No ingrese datos reales.
                      </div>
                    </div>

                  </div>
                </div>

                {/* Helpful guides */}
                <div className="mt-8 text-center space-y-2 max-w-[280px] z-10">
                  <span className="inline-block text-[10px] font-black text-successLight uppercase tracking-widest bg-successLight/10 border border-successLight/20 px-2.5 py-1 rounded-full">
                    Tarjeta Interactiva 3D
                  </span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Al interactuar con el campo <span className="text-successLight font-bold">CVV</span> la tarjeta girará automáticamente en 3D para revelar su reverso.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-yellow-500/80 font-bold bg-yellow-500/5 px-3 py-1.5 rounded-lg border border-yellow-500/10">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Entorno de pruebas 100% simulado</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Wallet Recharge Form */}
              <div className="flex flex-col justify-between">
                <form onSubmit={handleRechargeSubmit} className="space-y-4 font-poppins h-full flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    {/* Recharge Amount */}
                    <div className="flex flex-col">
                      <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">Monto a Recargar ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        className="bg-green-950/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-bold text-sm shadow-inner"
                        placeholder="Ej: 20.00"
                        required
                        disabled={isRecharging}
                      />
                    </div>

                    {/* Cardholder Name */}
                    <div className="flex flex-col">
                      <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">Nombre en la Tarjeta</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value.substring(0, 22) }))}
                        className="bg-green-950/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm shadow-inner"
                        placeholder="Escribe el nombre como aparece en la tarjeta"
                        required
                        disabled={isRecharging}
                      />
                    </div>

                    {/* Card Number */}
                    <div className="flex flex-col">
                      <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">Número de Tarjeta</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          let formatted = val.match(/.{1,4}/g)?.join(" ") || "";
                          setCardDetails(prev => ({ ...prev, number: formatted.substring(0, 19) }));
                        }}
                        className="bg-green-950/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm shadow-inner"
                        placeholder="0000 0000 0000 0000"
                        required
                        disabled={isRecharging}
                      />
                    </div>

                    {/* Exp & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">Expiración</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length > 2) {
                              val = val.substring(0, 2) + "/" + val.substring(2, 4);
                            }
                            setCardDetails(prev => ({ ...prev, expiry: val.substring(0, 5) }));
                          }}
                          className="bg-green-950/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm shadow-inner"
                          placeholder="MM/AA"
                          required
                          disabled={isRecharging}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">CVV</label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            setCardDetails(prev => ({ ...prev, cvv: val.substring(0, 3) }));
                          }}
                          onFocus={() => setIsCardFlipped(true)}
                          onBlur={() => setIsCardFlipped(false)}
                          className="bg-green-950/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm shadow-inner"
                          placeholder="123"
                          required
                          disabled={isRecharging}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions: Recharge and Cancel */}
                  <div className="pt-6 mt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      disabled={isRecharging}
                      onClick={() => {
                        setShowRechargeModal(false);
                        setCardDetails({ number: "", name: "", expiry: "", cvv: "" });
                        setRechargeAmount("");
                      }}
                      className="w-full sm:w-1/3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-300 flex items-center justify-center h-14"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isRecharging}
                      className="w-full sm:w-2/3 bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)] flex items-center justify-center gap-2 h-14"
                    >
                      {isRecharging ? (
                        <>
                          <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-primaryAltDark" />
                          Procesando...
                        </>
                      ) : (
                        `Realizar Pago`
                      )}
                    </Button>
                  </div>

                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Withdraw Profits Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-[#09110a]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-green-950/95 border border-white/10 rounded-3xl w-full max-w-4xl overflow-y-auto max-h-[90vh] shadow-2xl p-6 md:p-8 font-poppins relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Landmark className="text-successLight animate-pulse" />
                Retirar Ganancias a tu Cuenta Bancaria
              </h2>
              <button 
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                  setWithdrawDetails({ bank: "Banco Agrícola", accountNumber: "", fullName: "" });
                }} 
                className="text-white/60 hover:text-white font-bold text-sm tracking-wide bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300"
              >
                Cerrar
              </button>
            </div>

            {/* Two-Column Responsive Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Left Column: Interactive Check / Bank Card Preview */}
              <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-2xl shadow-inner min-h-[280px] md:min-h-[380px] relative overflow-hidden group">
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-successLight/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Virtual Cheque Preview */}
                <div className="w-full max-w-[320px] bg-gradient-to-br from-emerald-800 to-green-950 border border-white/20 rounded-2xl p-5 shadow-xl flex flex-col justify-between text-white aspect-[1.6/1]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-[10px] uppercase tracking-widest text-successLight">AgroMarket Transfer</span>
                      <p className="text-[7px] text-white/50 tracking-wider">ORDEN DE RETIRO SIMULADA</p>
                    </div>
                    <Landmark className="w-6 h-6 text-white/40" />
                  </div>

                  <div className="py-2 border-b border-white/10">
                    <p className="text-[7px] uppercase tracking-wider text-successLight/70 font-black">Transferir a:</p>
                    <p className="text-sm font-black truncate font-mono uppercase tracking-wider">{withdrawDetails.fullName || "TITULAR DE LA CUENTA"}</p>
                  </div>

                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-[7px] uppercase tracking-wider text-successLight/70 font-black">Banco & Cuenta</p>
                      <p className="text-xs font-bold font-mono tracking-wider">{withdrawDetails.bank}</p>
                      <p className="text-[10px] font-mono text-white/60 mt-0.5">{withdrawDetails.accountNumber || "NÚMERO DE CUENTA"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] uppercase tracking-wider text-successLight/70 font-black">Monto Solicitado</p>
                      <p className="text-lg font-black text-successLight font-mono">${parseFloat(withdrawAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Helpful guides */}
                <div className="mt-8 text-center space-y-2 max-w-[280px] z-10">
                  <span className="inline-block text-[10px] font-black text-successLight uppercase tracking-widest bg-successLight/10 border border-successLight/20 px-2.5 py-1 rounded-full">
                    Transferencia Bancaria Inmediata
                  </span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Retira tus ganancias de ventas de forma instantánea a cualquiera de los principales bancos locales habilitados.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-yellow-500/80 font-bold bg-yellow-500/5 px-3 py-1.5 rounded-lg border border-yellow-500/10">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Entorno de retiro 100% simulado</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Withdrawal Form */}
              <div className="flex flex-col justify-between">
                <form onSubmit={handleWithdrawSubmit} className="space-y-4 font-poppins h-full flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    {/* Available Balance Preview */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-white/60 font-semibold">Ganancias Acumuladas Disponibles:</span>
                      <span className="text-successLight font-black text-base">${user.credit?.toFixed(2) || "0.00"}</span>
                    </div>

                    {/* Withdrawal Amount */}
                    <div className="flex flex-col">
                      <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">Monto a Retirar ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={user.credit}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-green-950/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-bold text-sm shadow-inner"
                        placeholder="Ej: 50.00"
                        required
                        disabled={isWithdrawing}
                      />
                    </div>

                    {/* Destination Bank */}
                    <div className="flex flex-col">
                      <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">Banco de Destino</label>
                      <select
                        value={withdrawDetails.bank}
                        onChange={(e) => setWithdrawDetails(prev => ({ ...prev, bank: e.target.value }))}
                        className="bg-green-950/40 text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm shadow-inner"
                        required
                        disabled={isWithdrawing}
                      >
                        <option value="Banco Agrícola" className="bg-green-950 text-white">Banco Agrícola</option>
                        <option value="Banco Cuscatlán" className="bg-green-950 text-white">Banco Cuscatlán</option>
                        <option value="BAC Credomatic" className="bg-green-950 text-white">BAC Credomatic</option>
                        <option value="Banco Davivienda" className="bg-green-950 text-white">Banco Davivienda</option>
                      </select>
                    </div>

                    {/* Account Number */}
                    <div className="flex flex-col">
                      <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">Número de Cuenta</label>
                      <input
                        type="text"
                        value={withdrawDetails.accountNumber}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          setWithdrawDetails(prev => ({ ...prev, accountNumber: val.substring(0, 16) }));
                        }}
                        className="bg-green-950/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm shadow-inner"
                        placeholder="0000 0000 0000 0000"
                        required
                        disabled={isWithdrawing}
                      />
                    </div>

                    {/* Account Holder Name */}
                    <div className="flex flex-col">
                      <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">Nombre Completo del Titular</label>
                      <input
                        type="text"
                        value={withdrawDetails.fullName}
                        onChange={(e) => setWithdrawDetails(prev => ({ ...prev, fullName: e.target.value }))}
                        className="bg-green-950/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm shadow-inner"
                        placeholder="Escribe el nombre registrado en la cuenta"
                        required
                        disabled={isWithdrawing}
                      />
                    </div>
                  </div>

                  {/* Actions: Withdraw and Cancel */}
                  <div className="pt-6 mt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      disabled={isWithdrawing}
                      onClick={() => {
                        setShowWithdrawModal(false);
                        setWithdrawAmount("");
                        setWithdrawDetails({ bank: "Banco Agrícola", accountNumber: "", fullName: "" });
                      }}
                      className="w-full sm:w-1/3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-300 flex items-center justify-center h-14"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isWithdrawing}
                      className="w-full sm:w-2/3 bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)] flex items-center justify-center gap-2 h-14"
                    >
                      {isWithdrawing ? (
                        <>
                          <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-primaryAltDark" />
                          Procesando...
                        </>
                      ) : (
                        `Confirmar Retiro`
                      )}
                    </Button>
                  </div>

                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-[#09110a]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-green-950/95 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 font-poppins relative text-white">
            <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
              <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <Activity className="text-successLight animate-pulse" />
                Detalle del Movimiento
              </h2>
              <button 
                onClick={() => setSelectedTransaction(null)} 
                className="text-white/60 hover:text-white font-bold text-xs tracking-wide bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              {/* Value and Type Banner */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center">
                <span className={`text-3xl font-black ${selectedTransaction.value < 0 ? 'text-red-400' : 'text-successLight'}`}>
                  {selectedTransaction.value < 0 ? "-" : "+"}${Math.abs(selectedTransaction.value).toFixed(2)}
                </span>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
                  Monto de la Transacción
                </p>
              </div>

              {/* Detail fields */}
              <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40 font-bold uppercase tracking-wider">Tipo:</span>
                  <span className="font-extrabold text-white">
                    {selectedTransaction.type === "Recarga" ? "Recarga de Saldo" :
                     selectedTransaction.type === "Retiro" ? "Retiro de Ganancias" :
                     selectedTransaction.type === "Compra" ? "Compra Realizada" :
                     selectedTransaction.type === "Venta" ? "Ingreso por Venta" :
                     selectedTransaction.type === "Reembolso" ? "Reembolso de Compra" :
                     selectedTransaction.type === "Devolución" ? "Devolución por Cancelación" :
                     selectedTransaction.type}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40 font-bold uppercase tracking-wider">Fecha:</span>
                  <span className="font-semibold text-white/95">
                    {new Date(selectedTransaction.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40 font-bold uppercase tracking-wider">Hora:</span>
                  <span className="font-semibold text-white/95">
                    {new Date(selectedTransaction.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                {/* Conditional Metadata rendering */}
                {selectedTransaction.type === "Recarga" && (
                  <>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40 font-bold uppercase tracking-wider">Método:</span>
                      <span className="font-bold text-white">Tarjeta de Crédito / Débito</span>
                    </div>
                    {selectedTransaction.metadata?.last4 ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-bold uppercase tracking-wider">Tarjeta:</span>
                          <span className="font-mono text-white/90">•••• •••• •••• {selectedTransaction.metadata.last4}</span>
                        </div>
                        {selectedTransaction.metadata.cardName && (
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-white/40 font-bold uppercase tracking-wider">Titular:</span>
                            <span className="font-semibold text-white/90">{selectedTransaction.metadata.cardName}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40 font-bold uppercase tracking-wider">Detalles:</span>
                        <span className="text-white/50 italic">Información de tarjeta no registrada</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.type === "Retiro" && (
                  <>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40 font-bold uppercase tracking-wider">Destino:</span>
                      <span className="font-bold text-white">Transferencia Bancaria</span>
                    </div>
                    {selectedTransaction.metadata?.bank ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-bold uppercase tracking-wider">Banco:</span>
                          <span className="font-semibold text-white/90">{selectedTransaction.metadata.bank}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-bold uppercase tracking-wider">Nº Cuenta:</span>
                          <span className="font-mono text-white/90">•••• {selectedTransaction.metadata.accountNumber}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-bold uppercase tracking-wider">Titular:</span>
                          <span className="font-semibold text-white/90">{selectedTransaction.metadata.fullName}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40 font-bold uppercase tracking-wider">Detalles:</span>
                        <span className="text-white/50 italic">Información de cuenta no registrada</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.type === "Compra" && (
                  <>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40 font-bold uppercase tracking-wider">Detalle:</span>
                      <span className="font-bold text-white">Compra en AgroMarket</span>
                    </div>
                    {selectedTransaction.metadata?.sellerName ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-bold uppercase tracking-wider">Vendedor:</span>
                          <span className="font-semibold text-white/90">@{selectedTransaction.metadata.sellerName}</span>
                        </div>
                        <div className="flex flex-col py-1 gap-1">
                          <span className="text-white/40 font-bold uppercase tracking-wider block">Productos:</span>
                          <span className="font-semibold text-successLight/90 pl-2 border-l-2 border-successLight/40 leading-relaxed block max-h-[80px] overflow-y-auto">
                            {selectedTransaction.metadata.productNames}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40 font-bold uppercase tracking-wider">Detalles:</span>
                        <span className="text-white/50 italic">Compra de productos demo</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.type === "Venta" && (
                  <>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40 font-bold uppercase tracking-wider">Detalle:</span>
                      <span className="font-bold text-white">Venta Realizada</span>
                    </div>
                    {selectedTransaction.metadata?.buyerName ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-bold uppercase tracking-wider">Comprador:</span>
                          <span className="font-semibold text-white/90">@{selectedTransaction.metadata.buyerName}</span>
                        </div>
                        <div className="flex flex-col py-1 gap-1">
                          <span className="text-white/40 font-bold uppercase tracking-wider block">Productos:</span>
                          <span className="font-semibold text-successLight/90 pl-2 border-l-2 border-successLight/40 leading-relaxed block max-h-[80px] overflow-y-auto">
                            {selectedTransaction.metadata.productNames}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40 font-bold uppercase tracking-wider">Detalles:</span>
                        <span className="text-white/50 italic">Ingreso de venta local</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.type === "Reembolso" && (
                  <>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40 font-bold uppercase tracking-wider">Detalle:</span>
                      <span className="font-bold text-white">Reembolso por Cancelación</span>
                    </div>
                    {selectedTransaction.metadata?.sellerName ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-bold uppercase tracking-wider">Vendedor:</span>
                          <span className="font-semibold text-white/90">@{selectedTransaction.metadata.sellerName}</span>
                        </div>
                        <div className="flex flex-col py-1 gap-1">
                          <span className="text-white/40 font-bold uppercase tracking-wider block">Productos:</span>
                          <span className="font-semibold text-successLight/90 pl-2 border-l-2 border-successLight/40 leading-relaxed block max-h-[80px] overflow-y-auto">
                            {selectedTransaction.metadata.productNames}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40 font-bold uppercase tracking-wider">Detalles:</span>
                        <span className="text-white/50 italic">Devolución de fondos</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.type === "Devolución" && (
                  <>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40 font-bold uppercase tracking-wider">Detalle:</span>
                      <span className="font-bold text-white">Cancelación de Venta (Devolución)</span>
                    </div>
                    {selectedTransaction.metadata?.buyerName ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-bold uppercase tracking-wider">Comprador:</span>
                          <span className="font-semibold text-white/90">@{selectedTransaction.metadata.buyerName}</span>
                        </div>
                        <div className="flex flex-col py-1 gap-1">
                          <span className="text-white/40 font-bold uppercase tracking-wider block">Productos:</span>
                          <span className="font-semibold text-successLight/90 pl-2 border-l-2 border-successLight/40 leading-relaxed block max-h-[80px] overflow-y-auto">
                            {selectedTransaction.metadata.productNames}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40 font-bold uppercase tracking-wider">Detalles:</span>
                        <span className="text-white/50 italic">Fondos devueltos al cliente</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between py-1">
                  <span className="text-white/40 font-bold uppercase tracking-wider">Estado:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Completado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección visual en mapa */}
      {isMapModalOpen && (
        <LocationModal
          position={mapPosition}
          setPosition={setMapPosition}
          setAddress={(newAddr) => setEditForm(prev => ({ ...prev, address: newAddr }))}
          setLat={(newLat) => setEditForm(prev => ({ ...prev, lat: newLat }))}
          setLng={(newLng) => setEditForm(prev => ({ ...prev, lng: newLng }))}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;