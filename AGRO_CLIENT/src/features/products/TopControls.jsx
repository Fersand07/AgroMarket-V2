import Button from "../../components/Button";
import { ChevronDown, SlidersHorizontal, MapPin, Eye } from "lucide-react";

const TopControls = ({ 
  selectedCategory, 
  setSelectedCategory, 
  sortValue, 
  setSortValue, 
  categories, 
  setShowModal,
  distanceRadius,
  setDistanceRadius 
}) => {

  const role = localStorage.getItem("role");

  const distanceOptions = [
    { value: 1000, label: "1 km" },
    { value: 5000, label: "5 km" },
    { value: 10000, label: "10 km" },
    { value: 25000, label: "25 km" },
    { value: 50000, label: "50 km" },
    { value: 100000, label: "100 km" }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-8 gap-6 font-poppins select-none">
      
      {/* Filters & Sorting container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 flex-1">
        
        {/* Category Filter */}
        <div className="flex flex-col">
          <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtrar por Categoría
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-green-950/40 text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm cursor-pointer w-full appearance-none pr-10 shadow-inner"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-green-950 text-white font-semibold py-2">
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Distance Filter (Only for Buyers) */}
        {role === 'user' ? (
          <div className="flex flex-col">
            <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 animate-pulse" />
              Radio de Distancia
            </label>
            <div className="relative">
              <select
                value={distanceRadius}
                onChange={(e) => setDistanceRadius(Number(e.target.value))}
                className="bg-green-950/40 text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm cursor-pointer w-full appearance-none pr-10 shadow-inner"
              >
                {distanceOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-green-950 text-white font-semibold py-2">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Sort Controls */}
        <div className="flex flex-col">
          <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Ordenar Resultados
          </label>
          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              className="bg-green-950/40 text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm cursor-pointer w-full appearance-none pr-10 shadow-inner"
            >
              <option value="name-asc" className="bg-green-950 text-white font-semibold py-2">Nombre A-Z</option>
              <option value="name-desc" className="bg-green-950 text-white font-semibold py-2">Nombre Z-A</option>
              <option value="price-asc" className="bg-green-950 text-white font-semibold py-2">Precio: Menor a Mayor</option>
              <option value="price-desc" className="bg-green-950 text-white font-semibold py-2">Precio: Mayor a Menor</option>
              <option value="distance-asc" className="bg-green-950 text-white font-semibold py-2">Distancia: Cercanos primero</option>
              <option value="distance-desc" className="bg-green-950 text-white font-semibold py-2">Distancia: Lejanos primero</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Seller Action Button (Only for Sellers) */}
      {role === 'seller' ? (
        <div className="flex items-end justify-stretch mt-4 lg:mt-0">
          <Button 
            className="w-full lg:w-auto bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.3)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.2)] whitespace-nowrap self-end h-[50px] flex items-center justify-center"
            onClick={() => setShowModal(true)}
          >
            Crear Producto
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default TopControls;