import { useState } from "react";
import Button from "../../components/Button";
import { addToCart } from "../../services/CartService";
import { customSwal } from "../../helpers/swalHelper";
import { XCircle, ShoppingCart } from "lucide-react";

const ModalProductDetail = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if(!quantity || quantity < 1) return;

    try {
      await addToCart(product._id, quantity);
      console.log('Producto agregado exitosamente');
      customSwal.fire({
        title: "¡Agregado al Carrito!",
        text: `${product.name} fue añadido a tus compras`,
        icon: "success",
        showConfirmButton: false,
        timer: 1500 
      });
      onClose();
    } catch (error) {
      console.error("Error al agregar al carrito", error);
      customSwal.fire({
        title: "Error al Agregar",
        text: "No ha sido posible añadir el producto en este momento.",
        icon: "error",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/60 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-xl bg-green-950/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-poppins text-white p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-red-400 hover:scale-110 transition duration-200 cursor-pointer"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-4 sm:mt-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-48 h-48 object-cover rounded-2xl border border-white/10 shadow-lg shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://static.vecteezy.com/system/resources/previews/009/007/134/non_2x/failed-to-load-page-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg";
            }}
          />

          <div className="flex-1 flex flex-col justify-between h-full gap-4 text-center sm:text-left">
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">{product.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 justify-center sm:justify-start">
                {product.category?.name && (
                  <span className="text-xxs font-black tracking-widest text-successLight/70 uppercase block">
                    Categoría: {product.category.name}
                  </span>
                )}
                <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  Stock: {product.stock > 0 ? `${product.stock} ${product.measureUnit?.name || 'uds'}` : 'Agotado'}
                </span>
              </div>
              <p className="text-white/60 text-xs mt-3 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <p className="text-successLight font-black text-3xl tracking-tight">
                ${product.price}
              </p>
              
              <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex flex-col text-left shrink-0">
                  <label className="text-[9px] font-black text-successLight uppercase tracking-widest mb-1 select-none text-center sm:text-left">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock || 1}
                    disabled={product.stock <= 0}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.stock || 1, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="bg-green-950/40 text-white border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-bold text-sm w-20 shadow-inner text-center disabled:opacity-50"
                    id="quantityInput"
                  />
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`w-full sm:w-auto font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-all duration-300 border flex items-center justify-center gap-2 self-end h-[46px] ${
                    product.stock <= 0
                      ? 'bg-neutral-800 text-neutral-500 border-neutral-700/50 cursor-not-allowed shadow-none'
                      : 'bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)]'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  {product.stock <= 0 ? "Agotado" : "Agregar al Carrito"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProductDetail;
