import { useMemo } from "react";
import Button from "./Button";

const ProductCard = ({ product,  onViewDetails}) => {

    const role = useMemo(() => localStorage.getItem('role'), [])
    
    const truncateText = (text, maxLength ) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength - 2) + '...' : text;
    }

    const isSeller = role ==="seller";

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden max-w-sm">
        {product.image && (
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-2xl" 
            onError={(e) =>{
                e.target.onerror = null;
                e.target.src = "https://static.vecteezy.com/system/resources/previews/009/007/134/non_2x/failed-to-load-page-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg"
            }}

            />
        )}
        <div className="font-poppins p-2">
            <h2 className="text-black text-base">{product.name}</h2>
            <p className="text-gray-500 text-xs">{truncateText(product.description, 58)}</p>
            <p className="text-black text-base">${product.price}</p>
        </div> 
        <div className="max-w-sm mb-2  flex justify-center">
            <Button className="bg-primaryColor hover:bg-primaryAltDark" onClick={() => onViewDetails(product)}>
                {isSeller ? 'Editar' : 'Agregar al carrito'}
            </Button>
        </div>
    </div>
    );
};

export default ProductCard;