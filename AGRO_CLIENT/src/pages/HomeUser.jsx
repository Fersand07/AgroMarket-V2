import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../features/products/ProductGrid';
import Pagination from '../components/Pagination';
import TopControls from '../features/products/TopControls';
import { getProductsByArea } from '../services/productService';
import { Search } from 'lucide-react';
 
const Home = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortValue, setSortValue] = useState('name-asc');
  const [distanceRadius, setDistanceRadius] = useState(1000);
  const [searchParams] = useSearchParams();
 
  const searchTerm = searchParams.get('search') || '';
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProductsByArea(distanceRadius);
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
  }, [distanceRadius]);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
 
  const categories = ['Todos', ...new Set(products.map(p => p.category?.name).filter(Boolean))];
 
  const searchFiltered = searchTerm.trim()
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;
 
  const categoryFiltered = selectedCategory === 'Todos'
    ? searchFiltered
    : searchFiltered.filter(p => p.category.name === selectedCategory);
 
  const sorted = [...categoryFiltered].sort((a, b) => {
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
      {searchTerm && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            <span className="font-semibold">Resultados para:</span> "{searchTerm}"
            <span className="ml-4 text-sm text-green-600">
              ({sorted.length} producto{sorted.length !== 1 ? 's' : ''} encontrado{sorted.length !== 1 ? 's' : ''})
            </span>
          </p>
        </div>
      )}
 
      <TopControls
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortValue={sortValue}
        setSortValue={setSortValue}
        categories={categories}
        distanceRadius={distanceRadius}
        setDistanceRadius={setDistanceRadius}
      />
 
      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? `No hay productos que coincidan con "${searchTerm}"`
              : 'No hay productos disponibles en esta categoría'
            }
          </p>
        </div>
      ) : (
        <>
          <ProductGrid products={currentProducts} />
 
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};
 
export default Home;