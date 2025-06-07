const ProductCard = ({ title, description, price, image }) => {
    
    const truncateText = (text, maxLength ) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength - 2) + '...' : text;
    }


    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden max-w-sm">
        {image && (
            <img src={image} alt={title} className="w-full h-48 object-cover rounded-2xl"/>
        )}
        <div className="font-poppins p-2">
            <h2 className="text-black text-base">{title}</h2>
            <p className="text-gray-500 text-xs">{truncateText(description, 58)}</p>
            <p className="text-black text-base">${price}</p>
        </div>
    </div>
    );
};

export default ProductCard;