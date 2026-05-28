import { useState, useEffect } from "react";
import { customSwal } from "../../helpers/swalHelper";
import { updateProduct } from "../../services/productService";
import { getCategories, getMeasureUnits } from "../../services/categoryService";
import Button from "../../components/Button";
import { uploadImage } from "../../helpers/cloudinary";
import { ImagePlus, Edit3, ChevronDown, Package } from "lucide-react";

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
      setPreviewUrl(product.image || null);
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
      customSwal.fire({
        icon: "warning",
        iconColor: "#FBBF24",
        title: "Campos requeridos",
        text: "Por favor llena todos los campos obligatorios."
      });
      return;
    }

    if(Number(form.price) < 0.01 || Number(form.stock) < 0) {
      customSwal.fire({
        icon: "warning",
        iconColor: "#FBBF24",
        title: "Valores incorrectos",
        text: "Por favor, el precio y stock deben ser mayores a 0."
      });
      return;
    }
    
    const selectedCategory = categories.find((c) => c.name === category);
    const selectedUnit = measureUnits.find((u) => u.name === measureUnit);

    if (!selectedCategory || !selectedUnit) {
      customSwal.fire({
        icon: "error",
        iconColor: "#EF4444",
        title: "Datos inválidos",
        text: "Categoría o unidad de medida no válidas."
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    let imageUrl = product.image;

    if (image instanceof File) {
      try {
        imageUrl = await uploadImage(image);
      } catch (err) {
        customSwal.fire({
          icon: "error",
          iconColor: "#EF4444",
          title: "Error al subir imagen",
          text: "Verifica tu conexión o intenta nuevamente."
        });
        setIsSubmitting(false);
        console.error(err);
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
    };

    try {
      await updateProduct(product._id, updatedProduct);
      customSwal.fire({
        icon: "success",
        iconColor: "#A4D6A0",
        title: "Producto actualizado",
        text: "Los cambios se guardaron exitosamente",
        timer: 2000,
        showConfirmButton: false
      });
      onClose();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      customSwal.fire({
        icon: "error",
        iconColor: "#EF4444",
        title: "Error",
        text: "No se pudo actualizar el producto"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/60 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-green-950/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-poppins text-white select-none">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-successLight/15 via-primaryColor/25 to-primaryAltDark/30 text-white text-center py-4.5 text-lg font-black uppercase tracking-wider border-b border-white/10 flex items-center justify-center gap-2">
          <Edit3 className="w-5 h-5 text-successLight" />
          Editar Detalles del Producto
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 flex flex-col gap-5.5">
          
          {/* Image Uploader */}
          <div className="flex flex-col">
            <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-2">
              Fotografía del Producto
            </label>
            <label
              htmlFor="imageUploadEdit"
              className="group relative cursor-pointer bg-white/5 hover:bg-white/10 h-36 flex items-center justify-center rounded-2xl border-2 border-dashed border-white/15 hover:border-successLight/40 transition-all duration-300 overflow-hidden shadow-inner"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              ) : (
                <div className="text-white/50 text-sm flex flex-col items-center justify-center text-center gap-2">
                  <ImagePlus className="w-8 h-8 text-successLight/60 group-hover:scale-110 transition duration-300" />
                  <span className="font-bold uppercase tracking-wider text-xxs">Cargar Imagen</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ImagePlus className="w-8 h-8 text-successLight" />
              </div>
            </label>

            <input
              id="imageUploadEdit"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Details Row: Name and Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">
                Nombre del Producto
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre del producto"
                className="bg-green-950/40 text-white placeholder-white/35 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">
                Descripción Breve
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descripción del producto"
                className="bg-green-950/40 text-white placeholder-white/35 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner h-[46px] resize-none overflow-hidden"
              />
            </div>
          </div>

          {/* Category & Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">
                Categoría
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="bg-green-950/40 text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm cursor-pointer w-full appearance-none pr-10 shadow-inner"
                >
                  <option value="" className="bg-green-950 text-white/50 font-semibold">Seleccionar</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name} className="bg-green-950 text-white font-semibold py-2">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">
                Unidad de Medida
              </label>
              <div className="relative">
                <select
                  name="measureUnit"
                  value={form.measureUnit}
                  onChange={handleChange}
                  className="bg-green-950/40 text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm cursor-pointer w-full appearance-none pr-10 shadow-inner"
                >
                  {measureUnits.map((unit) => (
                    <option key={unit._id} value={unit.name} className="bg-green-950 text-white font-semibold py-2">
                      {unit.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">
                Inventario / Stock
              </label>
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={form.stock}
                onChange={handleChange}
                className="bg-green-950/40 text-white placeholder-white/35 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xxs font-black text-successLight uppercase tracking-widest mb-1.5">
                Precio Unitario ($)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Precio"
                className="bg-green-950/40 text-white placeholder-white/35 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-successLight/40 focus:bg-green-950/60 transition-all duration-300 font-semibold text-sm w-full shadow-inner"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={onClose}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-xl transition-all duration-300 border ${
                isSubmitting 
                  ? 'bg-neutral-800 text-neutral-500 border-neutral-700/50 cursor-not-allowed' 
                  : 'bg-successLight text-primaryAltDark hover:bg-white border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.2)]'
              }`}
            >
              {isSubmitting ? "Subiendo..." : "Guardar Cambios"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalEditProduct;
