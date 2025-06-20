import Button from "../../components/Button";

const TopControls = ({ selectedCategory, setSelectedCategory, sortValue, setSortValue, categories, setShowModal }) => {

  const role = localStorage.getItem("role");

  return (
    <div className="flex flex-wrap justify-between font-poppins items-center mb-6 gap-4">
      <div>
        <label className="text-sm mr-2">Filtrar por categoría:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-black text-gray-600  px-2 py-1 rounded"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm  mr-2">Ordenar por:</label>
        <select
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value)}
          className="border border-black text-gray-600 px-2 py-1 rounded"
        >
          <option value="name-asc">Nombre A-Z</option>
          <option value="name-desc">Nombre Z-A</option>
          <option value="price-asc">Precio menor</option>
          <option value="price-desc">Precio mayor</option>
        </select>
      </div>
      { role === 'seller' ? <Button className="bg-primaryColor" onClick={() => setShowModal(true)}>Crear nuevo Producto</Button> : null}
    </div>
  );
};

export default TopControls;
