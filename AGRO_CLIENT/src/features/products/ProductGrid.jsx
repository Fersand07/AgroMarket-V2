import { useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import ModalProductDetail from "./ModalProduct";
import ModalEditProduct from "./ModalEditProduct";

const ProductGrid = ({ products, onProductModalClose }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const role = useMemo(() => localStorage.getItem('role'), [])
  const isSeller = role === 'seller'

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    onProductModalClose?.()
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onViewDetails={() => handleViewDetails(product)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No hay productos disponibles
          </p>
        )}
      </div>

      {
        isSeller ? (
          <ModalEditProduct
            product={selectedProduct}
            isOpen={modalOpen}
            onClose={handleCloseModal}
          />
        ) : (
          <ModalProductDetail
            product={selectedProduct}
            isOpen={modalOpen}
            onClose={handleCloseModal}
          />
        )
      }
    </>
  );
};

export default ProductGrid;
