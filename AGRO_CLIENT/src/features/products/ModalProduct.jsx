
const ModalProductDetail = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg  p-6 w-full max-w-xl relative shadow-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
        >
          &times;
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
                defaultValue={1}
                className="border rounded px-2 py-1 w-20"
                id="quantityInput"
              />
              <button
                className="bg-primaryColor text-white px-4 py-2 rounded hover:bg-primaryAltDark"
                // TODO: logica de añadir al carrito
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProductDetail;
