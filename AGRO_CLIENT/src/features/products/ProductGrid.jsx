import ProductCard from "../../components/ProductCard";

const ProductGrid = ({ products }) => {
    return ( 
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2">
            {Array.isArray(products) && products.length > 0 ? (
                products.map((product) => (
                    <ProductCard 
                        key={product._id}
                        image={product.image}
                        title={product.name}
                        description={product.description}
                        price={product.price}
                    />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No hay productos disponibles</p>
            )}
        </div>
    );
}

export default ProductGrid;