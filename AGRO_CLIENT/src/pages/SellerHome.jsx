import { useState, useEffect } from 'react';
import ProductGrid from '../features/products/ProductGrid';
import Pagination from '../components/Pagination';
import TopControls from '../features/products/TopControls';
import { getProductsPostedByUser } from '../services/productService';
import ProductCreateModal from '../features/products/ProductModal';

const SellerHome = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortValue, setSortValue] = useState('name-asc');


  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProductsPostedByUser();
        const validProducts = data.products.filter(p =>
          p &&
          typeof p.name === 'string' &&
          typeof p.price === 'number' &&
          typeof p.description === 'string' &&
          typeof p.image === 'string' &&
          p.category && typeof p.category.name === 'string'
        );
        setProducts(validProducts);
      } catch (error) {
        console.error('No se pudo cargar los productos', error);
      }
    };

    fetchData();
  }, []);

  const categories = ['Todos', ...new Set(products.map(p => p.category?.name).filter(Boolean))];
  const filtered = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.category.name === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortValue === 'name-asc') return a.name.localeCompare(b.name);
    if (sortValue === 'name-desc') return b.name.localeCompare(a.name);
    if (sortValue === 'price-asc') return a.price - b.price;
    if (sortValue === 'price-desc') return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const start = (currentPage - 1) * perPage;
  const currentProducts = sorted.slice(start, start + perPage);

  return (
    <div className="px-4 sm:px-10 md:px-32 py-4">
        
      <TopControls
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortValue={sortValue}
        setSortValue={setSortValue}
        categories={categories}
        setShowModal={setShowModal}
      />

      
      <ProductGrid products={currentProducts}  />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {showModal && (
          <ProductCreateModal
            onClose={() => setShowModal(false)}
          />
       )}
    </div>
  );
};

export default SellerHome;
