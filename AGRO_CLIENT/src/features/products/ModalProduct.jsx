import { useState } from "react";
import Button from "../../components/Button";
import { addToCart } from "../../services/CartService";
import Swal from "sweetalert2";
import {  XCircle } from "lucide-react";

const ModalProductDetail = ({ product, isOpen, onClose }) => {

  const [quantity, setQuantity] = useState();

  const handleAddToCart = async () => {
    if(!quantity || quantity < 1) return;

    try {
      await addToCart(product._id, quantity);
      console.log('Producto agregado exitosamente');
      Swal.fire({
        title: "Producto agregado al carrito",
        icon: "success",
        showConfirmButton: false,
        timer: 1250 
      })
      onClose();
    } catch (error) {
      console.error("Error al agregar al carrito", error)
      Swal.fire({
        title: "No ha sido posible agregar el producto",
        icon: "error",
        showConfirmButton: false,
        timer: 1250
      })
    }
  }

  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg  p-6 w-full max-w-xl relative shadow-md">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          <XCircle/>
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-48 h-48 object-cover rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://static.vecteezy.com/system/resources/previews/009/007/134/non_2x/failed-to-load-page-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg";
            }}
          />

          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p className="text-gray-600 mt-1">{product.description}</p>
            <p className="mt-2 text-lg font-bold text-green-700">
              ${product.price}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Categoría: {product.category?.name || "Sin categoría"}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                defaultValue={1}
                onChange={(e) =>  setQuantity(e.target.value)}
                className="border rounded px-2 py-1 w-20"
                id="quantityInput"
              />
              <Button onClick={handleAddToCart}>
                Agregar al carrito
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProductDetail;
