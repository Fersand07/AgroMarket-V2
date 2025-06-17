import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import { getCart, removeFromCart, updateCart } from "../../services/CartService";

const Cart = () => {
    const [items, setItems] = useState([]);
    const updateTimeoutRef = useRef(null);

    const fetchCart = async () => {
        try {
            const data = await getCart()
            setItems(data.items)
        } catch (error) {
            console.error('No se pudo cargar el carrito', error)
        }
    }

    useEffect(() => {
        fetchCart()
    }, []);

    const handleQuantityChange = async (itemId, newQty) => {
        if (newQty < 1) return;

        
        const updatedItems = items.map(item =>
            item._id === itemId ? { ...item, quantity: newQty } : item
        );
        
        setItems(updatedItems);

        
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        
        updateTimeoutRef.current = setTimeout(async () => {
            try {
               
                const itemsForUpdate = updatedItems.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity
                }));

                await updateCart(itemsForUpdate);
                console.log("Carrito actualizado exitosamente");
            } catch (err) {
                console.error("Error actualizando carrito:", err);
               
                fetchCart();
            }
        }, 1200);
    }

    const handleDelete = async (itemId) => {
        try {
            
            const item = items.find(item => item._id === itemId);
            if (item) {
                await removeFromCart(item.product._id); 
                await fetchCart();
            }
        } catch (error) {
            console.error("Error para eliminar productos", error)
        }
    }

    
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const descuento = 0.00;
    const total = subtotal - descuento;

    return (
        <div className="max-w-5xl font-poppins mx-auto p-6 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-altLight text-white p-3 rounded-t-lg">
                        <div className="grid grid-cols-12 gap-4 font-medium">
                            <div className="col-span-4">Producto</div>
                            <div className="col-span-2 text-center">Precio</div>
                            <div className="col-span-3 text-center">Cantidad</div>
                            <div className="col-span-2 text-center">Subtotal</div>
                            <div className="col-span-1"></div>
                        </div>
                    </div>
                
                    <div className="border border-gray-200 rounded-b-lg">
                        {items.map((item) => (
                            <div key={item._id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 last:border-b-0 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-16 h-16 bg-gray-200 rounded">
                                        <img src={item.product.image} alt={item.product.name} />
                                    </div>
                                    <span className="font-medium">{item.product.name}</span>
                                </div>
                                
                                <div className="col-span-2 text-center font-medium">
                                    ${item.product.price.toFixed(2)}
                                </div>
                                
                                <div className="col-span-3 flex justify-center items-center gap-2">
                                    <button 
                                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                                
                                <div className="col-span-2 text-center font-medium">
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </div>
                                
                                <div className="col-span-1 flex justify-center">
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-altLight text-white p-6 rounded-lg h-fit w-xs">
                    <h3 className="text-xl font-bold mb-6 text-center">Resumen</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span>Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span>Descuento</span>
                            <span className="font-medium">${descuento.toFixed(2)}</span>
                        </div>
                        
                        <hr className="border-altBgColor" />
                        
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="px-6 w-xs">
                        <Button className="uppercase">
                            Continuar tu compra
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart