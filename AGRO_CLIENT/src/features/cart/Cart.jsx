import { Trash2, ShoppingCart, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import { getCart, removeFromCart, updateCart } from "../../services/CartService";
import { createOrder } from "../../services/OrderService";
import { customSwal } from "../../helpers/swalHelper";

const Cart = () => {
    const [items, setItems] = useState([]);
    const updateTimeoutRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        try {
            const data = await getCart();
            setItems(data.items);
        } catch (error) {
            console.error('No se pudo cargar el carrito', error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleCreateOrder = async () => {
        const result = await customSwal.fire({
            title: '¿Confirmar compra?',
            text: `¿Estás seguro de que deseas realizar esta compra por un total de $${total.toFixed(2)}?`,
            icon: 'question',
            iconColor: '#A4D6A0',
            showCancelButton: true,
            confirmButtonText: 'Sí, comprar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const data = await createOrder();
            console.log("Orden creada:", data);
            customSwal.fire({
                title: "Orden Creada",
                text: "Tu orden ha sido creada con éxito",
                icon: "success",
                iconColor: '#A4D6A0',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            customSwal.fire({
                title: 'Ocurrió un error',
                text: "Tu orden no ha sido creada. Verifica tu saldo.",
                icon: "error",
                iconColor: '#EF4444',

                timer: 2500,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
            fetchCart();
        }
    };

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
    };

    const handleDelete = async (itemId) => {
        const item = items.find(item => item._id === itemId);
        if (!item) return;

        const result = await customSwal.fire({
            title: '¿Eliminar producto?',
            text: `¿Estás seguro de que deseas quitar "${item.product.name}" de tu carrito?`,
            icon: 'warning',
            iconColor: '#FBBF24',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await removeFromCart(item.product._id); 
                await fetchCart();
                customSwal.fire({
                    title: 'Eliminado',
                    text: 'El producto ha sido removido de tu carrito',
                    icon: 'success',
                    iconColor: '#A4D6A0',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Error al eliminar producto", error);
                customSwal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar el producto del carrito',
                    icon: 'error',
                    iconColor: '#EF4444',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        }
    };

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
        <div className="max-w-5xl mx-auto py-2 font-poppins select-none animate-fade-in">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-wide">Tu Carrito</h1>
                    <p className="text-white/60 text-sm mt-1">Revisa y procesa tu listado de productos locales seleccionados</p>
                </div>
            </div>

            {items.length === 0 ? (
                /* Empty state */
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center shadow-2xl max-w-xl mx-auto mt-8">
                    <div className="text-successLight/60 mb-6 flex justify-center">
                        <div className="p-4 bg-white/5 rounded-full border border-white/10 shadow-lg">
                            <ShoppingCart size={44} className="animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-wide">El carrito está vacío</h3>
                    <p className="text-white/60 text-sm max-w-sm mx-auto leading-relaxed">
                        Aún no tienes productos agregados a tu carrito. ¡Explora los productos de tu zona para iniciar tus compras!
                    </p>
                </div>
            ) : (
                /* Cart Grid Layout */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Column: Cart items */}
                    <div className="lg:col-span-2 space-y-4">
                        
                        {/* Table headers (Visible on larger screens) */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl font-black text-xxs tracking-widest text-successLight uppercase shadow-md">
                            <div className="col-span-6">Producto</div>
                            <div className="col-span-2 text-center">Precio</div>
                            <div className="col-span-2 text-center">Cantidad</div>
                            <div className="col-span-2 text-right">Subtotal</div>
                        </div>

                        {/* Cart items list */}
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div 
                                    key={item._id} 
                                    className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center transition-all duration-300 hover:border-successLight/35 hover:shadow-[0_12px_40px_rgba(164,214,160,0.08)] relative"
                                >
                                    {/* Product and image details */}
                                    <div className="col-span-6 flex items-center gap-4 w-full">
                                        <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 overflow-hidden shadow-md shrink-0 flex items-center justify-center">
                                            {item.product.image ? (
                                                <img 
                                                    src={item.product.image} 
                                                    alt={item.product.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://static.vecteezy.com/system/resources/previews/009/007/134/non_2x/failed-to-load-page-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg"
                                                    }}
                                                />
                                            ) : (
                                                <ShoppingCart className="w-6 h-6 text-white/30" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-extrabold text-white text-base tracking-wide block">
                                                {item.product.name}
                                            </span>
                                            {item.product.category?.name && (
                                                <span className="text-xxs font-black tracking-widest text-successLight/70 uppercase">
                                                    {item.product.category.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Product unit price */}
                                    <div className="col-span-2 text-center font-bold text-white/80 text-sm">
                                        <span className="sm:hidden text-xxs font-black text-successLight block uppercase mb-1">Precio</span>
                                        ${item.product.price.toFixed(2)}
                                    </div>
                                    
                                    {/* Quantity adjustments */}
                                    <div className="col-span-2 flex flex-col justify-center items-center">
                                        <span className="sm:hidden text-xxs font-black text-successLight block uppercase mb-1">Cantidad</span>
                                        <div className="flex items-center gap-2 bg-green-950/40 rounded-xl p-1 border border-white/10 shadow-inner">
                                            <button 
                                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition duration-200 cursor-pointer shadow-md"
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-white font-bold text-sm">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition duration-200 cursor-pointer shadow-md"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Product items subtotal */}
                                    <div className="col-span-2 text-right font-black text-successLight text-base w-full sm:w-auto flex justify-between sm:block border-t border-white/5 sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                        <span className="sm:hidden text-xxs font-black text-successLight block uppercase">Subtotal</span>
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </div>

                                    {/* Delete floating button */}
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        className="absolute top-3 right-3 sm:static text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 p-2 rounded-xl transition duration-300 cursor-pointer shrink-0"
                                        title="Eliminar producto"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Checkout Summary Panel */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col justify-between gap-6">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider border-b border-white/10 pb-4 text-center flex items-center justify-center gap-2">
                                Resumen de Compra
                            </h3>
                            
                            <div className="space-y-4 mt-6">
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span className="text-white/50">Subtotal</span>
                                    <span className="text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span className="text-white/50">Descuento</span>
                                    <span className="text-white/90">${descuento.toFixed(2)}</span>
                                </div>
                                
                                <div className="border-t border-white/10 my-4" />
                                
                                <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-white text-base">Total a Pagar</span>
                                    <span className="font-black text-successLight text-2xl tracking-tight">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <Button 
                                onClick={handleCreateOrder} 
                                disabled={loading} 
                                className="w-full font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-300 bg-successLight text-primaryAltDark hover:bg-white border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.25)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.2)] cursor-pointer flex items-center justify-center h-[50px]"
                            >
                                {loading ? "Procesando pedido..." : "Confirmar Compra"}
                            </Button>
                            <p className="text-[10px] text-white/40 flex items-center gap-1.5 justify-center leading-relaxed">
                                <Info className="w-3 h-3 text-successLight shrink-0" />
                                El saldo virtual será debitado tras confirmar.
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Cart;