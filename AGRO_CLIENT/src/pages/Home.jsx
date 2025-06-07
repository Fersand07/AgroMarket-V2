import { useState, useEffect } from 'react';
import ProductGrid from '../features/products/ProductGrid';
import Pagination from '../components/Pagination';
import TopControls from '../features/products/TopControls';
import { getProducts } from '../services/productService';

const Home = () => {
  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortValue, setSortValue] = useState('name-asc');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();

        console.log("Productos crudos desde API:", data.products);

        const validProducts = data.products.filter(p =>
          p &&
          typeof p.name === 'string' && p.name.trim() !== '' &&
          typeof p.price === 'number' &&
          typeof p.description === 'string' && p.description.trim() !== '' &&
          typeof p.image === 'string' && p.image.trim() !== ''
        );

        console.log("Productos válidos después del filtro:", validProducts);

        setProducts(validProducts);
      } catch (error) {
        console.error('No se pudo cargar los productos', error);
      }
    };

    fetchData();
  }, []);


  // Revisar logica de esto por la categorias 
  const categories = ['Todos', ...new Set(products
  .filter(p => p.category && p.category)
  .map(p => p.category))];

  const filtered = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.category === selectedCategory);

  
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
    <div className="px-32 py-4">

      <TopControls
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortValue={sortValue}
        setSortValue={setSortValue}
        categories={categories}
      />

      <ProductGrid products={currentProducts} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Home;
