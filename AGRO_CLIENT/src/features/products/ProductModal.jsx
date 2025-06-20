import React, { useState, useEffect } from 'react';
import { getCategories, getMeasureUnits } from '../../services/categoryService';
import { createProductService } from '../../services/productService';
import { uploadImage } from '../../helpers/cloudinary';
import Swal from "sweetalert2";

const ProductCreateModal = ({ onClose }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    measureUnit: 'Lb',
    quantity: '',
    price: '',
    stock: '',
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catData, unitData] = await Promise.all([
          getCategories(),
          getMeasureUnits()
        ]);
        setCategories(catData);
        setMeasureUnits(unitData);
      } catch (error) {
        console.error('Error al cargar datos', error);
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
    if (isSubmitting) return; // Evita múltiples clics

    setIsSubmitting(true);
    
    const { name, description, category, measureUnit, quantity, price, stock, image } = form;

    if (!name || !description || !category || !measureUnit || !quantity || !price || !stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
      });
      setIsSubmitting(false);
      return;
    }   

    if (Number(quantity) <= 0 || Number(price) <= 0 || Number(stock) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Valores inválidos',
        text: 'Cantidad, precio y stock deben ser mayores a 0.',
      });
      setIsSubmitting(false);
      return;
    }

    if (!image) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Por favor, selecciona una imagen del producto.',
      });
      setIsSubmitting(false);
      return;
    }

    const selectedCategory = categories.find((cat) => cat.name === category);
    const selectedUnit = measureUnits.find((u) => u.name === measureUnit);

    if (!selectedCategory || !selectedUnit) {
      Swal.fire({
        icon: 'error',
        title: 'Datos inválidos',
        text: 'Categoría o unidad de medida no válidas.',
      });
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('token');
    let imageUrl = '';

    try {
      imageUrl = await uploadImage(image);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al subir la imagen',
        text: 'Verifica tu conexión o intenta nuevamente.',
      });
      setIsSubmitting(false);
      console.error(err)
      return;
    }

    const productToSend = {
      name,
      description,
      category: selectedCategory.name,
      measureUnit: selectedUnit.name,
      quantity: Number(quantity),
      price: Number(price),
      stock: Number(stock),
      image: imageUrl,
    };

    try {
      await createProductService(productToSend, token);
      Swal.fire({
        title: 'Producto creado',
        text: 'Producto creado correctamente',
        icon: 'success',
      });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear producto',
        text: err.message || 'Intenta nuevamente',
      });
      console.error('Error al crear producto:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center">
      <div className="w-[400px] bg-white rounded-md overflow-hidden shadow-lg">
        <div className="bg-green-800 text-white text-center py-3 text-lg font-semibold">
          Información del Producto
        </div>

        <div className="p-6 flex flex-col gap-3">
          <label
            htmlFor="imageUpload"
            className="cursor-pointer bg-gray-200 h-32 flex items-center justify-center rounded-md border border-dashed border-gray-400"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="max-h-full object-contain" />
            ) : (   
              <span className="text-gray-600 text-center text-sm">
                <span className="text-4xl font-bold">+</span>
                <br />
                Agregar imagen
              </span>
            )}
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
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          />

          <input
            type="text"
            name="description"
            placeholder="Descripción"
            value={form.description}
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

          <input
            type="number"
            name="quantity"
            placeholder="Cantidad"
            value={form.quantity}
            onChange={handleChange}
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

          <input
            type="number"
            name="price"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          />

          <div className="flex justify-between mt-4">
            <button
              onClick={onClose}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
            >
              CANCELAR
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded text-white ${isSubmitting ? 'bg-green-300 cursor-not-allowed' : 'bg-green-800 hover:bg-green-900'}`}
                >
                {isSubmitting ? 'Procesando...' : 'SIGUIENTE'}
                </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreateModal;
