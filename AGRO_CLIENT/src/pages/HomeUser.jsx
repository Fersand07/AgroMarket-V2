import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../features/products/ProductGrid';
import Pagination from '../components/Pagination';
import TopControls from '../features/products/TopControls';
import { getProductsByArea } from '../services/productService';
import { Search } from 'lucide-react';
import AgroWeather from '../components/AgroWeather';
 
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
    <div className="py-2 space-y-6">
      <AgroWeather />
      {searchTerm && (
        <div className="mb-6 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white shadow-xl flex items-center justify-between font-poppins animate-fade-in">
          <p className="text-sm">
            <span className="font-bold text-white/70 uppercase tracking-wider mr-2">Búsqueda:</span> 
            <span className="text-successLight font-extrabold text-base">"{searchTerm}"</span>
          </p>
          <span className="text-xs px-3 py-1 rounded-full bg-successLight/10 border border-successLight/20 text-successLight font-black uppercase tracking-widest">
            {sorted.length} {sorted.length === 1 ? 'Producto' : 'Productos'}
          </span>
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
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center shadow-2xl max-w-2xl mx-auto font-poppins mt-8">
          <div className="text-successLight/60 mb-6 flex justify-center">
            <div className="p-4 bg-white/5 rounded-full border border-white/10 shadow-lg">
              <Search size={54} className="animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-3 tracking-wide">
            No se encontraron productos
          </h3>
          <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
            {searchTerm
              ? `Lamentablemente no encontramos coincidencias para la búsqueda de "${searchTerm}". Intenta buscar otra palabra clave o cambiar los filtros.`
              : 'No hay productos disponibles actualmente en esta categoría para tu zona.'
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