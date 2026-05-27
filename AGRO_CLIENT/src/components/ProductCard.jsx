import { useMemo } from "react";
import Button from "./Button";

const ProductCard = ({ product, onViewDetails }) => {
    const role = useMemo(() => localStorage.getItem('role'), []);
    
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength - 2) + '...' : text;
    };

    const isSeller = role === "seller";
    const isOutOfStock = product.stock === 0;

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-successLight/30 hover:shadow-[0_20px_50px_rgba(164,214,160,0.12)] hover:scale-[1.03] transition-all duration-300 overflow-hidden max-w-sm flex flex-col justify-between h-full group shadow-2xl">
            {/* Image Container with Elegant Overlay */}
            <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
                {product.image ? (
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://static.vecteezy.com/system/resources/previews/009/007/134/non_2x/failed-to-load-page-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg"
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/40">
                        Sin imagen
                    </div>
                )}
                {/* Visual gradient overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Premium category tag on top right */}
                {product.category?.name && (
                    <span className="absolute top-3 right-3 bg-green-950/80 backdrop-blur-md text-successLight text-xxs font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
                        {product.category.name}
                    </span>
                )}
            </div>

            {/* Content body */}
            <div className="font-poppins p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                    <h2 className="text-white font-extrabold text-lg tracking-wide group-hover:text-successLight transition-colors duration-200">
                        {product.name}
                    </h2>
                    <p className="text-white/60 text-xs mt-1.5 leading-relaxed font-medium">
                        {truncateText(product.description, 75)}
                    </p>
                </div>
                
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-successLight font-black text-2xl tracking-tight">
                            ${product.price}
                        </span>
                        
                        {/* Unit or stock indicator */}
                        {isSeller ? (
                            <div className="text-right">
                                <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold uppercase tracking-wider ${
                                    isOutOfStock 
                                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                        : 'bg-white/5 border-white/10 text-white/90'
                                }`}>
                                    Stock: {product.stock} {product.measureUnit?.name || ''}
                                </span>
                            </div>
                        ) : (
                            isOutOfStock && (
                                <span className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase tracking-wider">
                                    Agotado
                                </span>
                            )
                        )}
                    </div>
                    {isSeller && isOutOfStock && (
                        <p className="text-red-400 text-xs font-semibold mt-1">
                            ⚠️ Este producto no tiene stock disponible
                        </p>
                    )}
                </div>
            </div> 

            {/* Action button */}
            <div className="px-5 pb-5 flex justify-center">
                <Button 
                    className={`w-full font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all duration-300 ${
                        isOutOfStock && !isSeller 
                            ? 'bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed hover:bg-neutral-800' 
                            : 'bg-successLight text-primaryAltDark hover:bg-white border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.3)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.2)]'
                    }`}
                    onClick={() => onViewDetails(product)}
                    disabled={isOutOfStock && !isSeller}
                >
                    {isSeller 
                        ? 'Editar Producto' 
                        : isOutOfStock 
                            ? 'Sin Stock' 
                            : 'Agregar al Carrito'
                    }
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;