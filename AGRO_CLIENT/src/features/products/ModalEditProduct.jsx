import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { updateProduct } from "../../services/productService"; // <-- asegúrate de tener este servicio
import { getCategories, getMeasureUnits } from "../../services/categoryService";
import Button from "../../components/Button";
import { uploadImage } from "../../helpers/cloudinary";
import { ImagePlus } from "lucide-react";

const ModalEditProduct = ({ product, isOpen, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    measureUnit: "",
    image: ""
  });

  const [categories, setCategories] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || 0,
        category: product.category.name || "",
        measureUnit: product.measureUnit.name || "",
        image: product.image || ""
      });
      setPreviewUrl(product.image || null)
    }
  }, [product]);

  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catData, unitData] = await Promise.all([
          getCategories(),
          getMeasureUnits(),
        ]);
        setCategories(catData);
        setMeasureUnits(unitData);
      } catch (error) {
        console.error("Error al cargar datos", error);
      }
    };

    loadInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {

    const {
      name,
      description,
      category,
      measureUnit,
      price,
      stock,
      image,
    } = form;

    if (!form.name || !form.price || !form.stock  || !form.category || !form.description || !form.measureUnit) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor llena todos los campos obligatorios.",
      });
      return;
    }

    if(form.price < 0.01 || form.stock < 0) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor precio y stock deben ser mayores a 0",
      });
      return;
    }
    
    const selectedCategory = categories.find((c) => c.name === category);
    const selectedUnit = measureUnits.find((u) => u.name === measureUnit);

    if (!selectedCategory || !selectedUnit) {
      Swal.fire({
        icon: "error",
        title: "Datos inválidos",
        text: "Categoría o unidad de medida no válidas.",
      });
      setIsSubmitting(false);
      return;
    }

    let imageUrl = product.image;

    if (image instanceof File) {
      try {
        imageUrl = await uploadImage(image);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error al subir imagen",
          text: "Verifica tu conexión o intenta nuevamente.",
        });
        setIsSubmitting(false);
        console.error(err)
        return;
      }
    }

    const updatedProduct = {
      name, 
      description, 
      category: selectedCategory.name,
      measureUnit: selectedUnit.name,
      price: Number(price), 
      stock: Number(stock),
      image: imageUrl
    }

    try {
      await updateProduct(product._id, updatedProduct);
      Swal.fire({
        icon: "success",
        title: "Producto actualizado",
        showConfirmButton: false,
        timer: 1300,
      });
      onClose();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el producto",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl relative shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-green-800">Editar Producto</h2>

        <div className="flex flex-col gap-3">
          <label
            htmlFor="imageUpload"
            className="group relative cursor-pointer bg-gray-200 h-32 flex items-center justify-center rounded-md border border-dashed border-gray-400 overflow-hidden"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="max-h-full object-contain w-full"
              />
            ) : (
              <span className="text-gray-600 text-center text-sm">
                <ImagePlus style={{width: '2em', height: '2em'}}/>
                <br />
                Agregar imagen
              </span>
            )}

            <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ImagePlus style={{width: '2em', height: '2em'}}/>
            </div>
          </label>

          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre del producto"
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          />
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Precio"
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          />
           <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="">Categoría</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            name="measureUnit"
            value={form.measureUnit}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          >
            {measureUnits.map((unit) => (
              <option key={unit._id} value={unit.name}>
                {unit.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end mt-4 gap-2">
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primaryColor"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEditProduct;
