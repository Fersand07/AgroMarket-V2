import Button from "../../components/Button";

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
    <div className="flex flex-wrap justify-between font-poppins items-center mb-6 gap-4">
      <div className="flex flex-wrap justify-between gap-4 flex-1">
        <div>
          <label className="text-sm mr-2">Filtrar por categoría:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-black text-gray-600 px-2 py-1 rounded"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        { role === 'user' ? (
          <div>
          <label className="text-sm mr-2">Distancia:</label>
          <select
            value={distanceRadius}
            onChange={(e) => setDistanceRadius(Number(e.target.value))}
            className="border border-black text-gray-600 px-2 py-1 rounded"
          >
            {distanceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        ) : null}

        <div>
          <label className="text-sm mr-2">Ordenar por:</label>
          <select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="border border-black text-gray-600 px-2 py-1 rounded"
          >
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="price-asc">Precio menor</option>
            <option value="price-desc">Precio mayor</option>
            <option value="distance-asc">Distancia menor</option>
            <option value="distance-desc">Distancia mayor</option>
          </select>
        </div>
      </div>

      { role === 'seller' ? (
        <Button className="bg-primaryColor" onClick={() => setShowModal(true)}>
          Crear nuevo Producto
        </Button>
      ) : null}
    </div>
  );
};

export default TopControls;