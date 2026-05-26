import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  MessageSquare, Send, X, Bot, Sparkles, User, 
  ArrowUpRight, Landmark, Activity, ShieldAlert 
} from "lucide-react";

const AgroHelpChat = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const isSeller = user?.role === "seller" || localStorage.getItem("role") === "seller";
  const username = user?.username || localStorage.getItem("username") || "Productor";

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text: `¡Hola @${username}! Soy **AgroHelp AI 🌾**, tu asistente agrícola virtual. ¿En qué puedo ayudarte a potenciar tu negocio hoy?`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [username]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle Quick Suggestion Click
  const handleQuickQuestion = (questionText) => {
    sendMessage(questionText);
  };

  // Get Custom Bot Response based on keywords
  const getBotResponse = (userText) => {
    const text = userText.toLowerCase();

    // 1. Withdrawal / Earnings
    if (text.includes("retiro") || text.includes("retirar") || text.includes("banco") || text.includes("ganancia") || text.includes("saldo") || text.includes("dinero") || text.includes("cuenta")) {
      if (isSeller) {
        return "¡Hola! Como **Vendedor**, puedes retirar tus ganancias acumuladas entrando a tu **Perfil** y dando clic en **'Retirar Ganancias'**. Habilitamos un simulador bancario completo (Banco Agrícola, Cuscatlán, BAC, Davivienda) en el que ingresas tu cuenta y tus fondos se transferirán de manera instantánea y segura, actualizando el saldo en tu base de datos Neon. ¡Pruébalo ahora!";
      } else {
        return "Como **Comprador**, puedes recargar tu saldo en tu **Perfil** utilizando nuestra pasarela de tarjeta de crédito interactiva en 3D. El saldo recargado te servirá para realizar compras locales rápidas. Si deseas ganar dinero vendiendo, ¡puedes registrarte como Vendedor!";
      }
    }

    // 2. Deliveries / Map Truck Animation
    if (text.includes("camion") || text.includes("entrega") || text.includes("reparto") || text.includes("ruta") || text.includes("camioncito") || text.includes("pedido") || text.includes("orden") || text.includes("mapa") || text.includes("uber")) {
      return "¡Monitoreo en tiempo real! 🚚 Al generar una orden de compra, el sistema traza las calles reales usando el API de OSRM (Open Source Routing Machine). En el **Detalle de la Orden**, verás un marcador animado de camión que recorre en un bucle interactivo la ruta exacta del mapa. ¡Es espectacular para impresionar al jurado en la presentación!";
    }

    // 3. Farming/Pest Control/Soil pH
    if (text.includes("plaga") || text.includes("hongo") || text.includes("cultivo") || text.includes("tizon") || text.includes("mildiu") || text.includes("tierra") || text.includes("ph") || text.includes("abono") || text.includes("insectos") || text.includes("sembrar")) {
      return "¡Hablemos de cultivos! 🌱 Para combatir plagas fúngicas (como el mildiu o tizón de forma orgánica), te sugiero aplicar **extracto de ajo y cebolla** o **aceite de neem** diluido en agua durante el atardecer. Si tienes suelos ácidos en tu finca, puedes regular el pH aplicando **cal agrícola (carbonato de calcio)** unas semanas antes de la siembra. ¡Mira las Alertas de Clima en el inicio para predecir estas plagas!";
    }

    // 4. Prices and Business Dashboard
    if (text.includes("precio") || text.includes("venta") || text.includes("negocio") || text.includes("costo") || text.includes("transporte") || text.includes("mercado") || text.includes("dolar") || text.includes("dashboard") || text.includes("ganar")) {
      if (isSeller) {
        return "¡Optimiza tus ventas! 📊 En tu **Perfil** tienes un **Dashboard de Control Comercial** completo. Analizamos en tiempo real tus ingresos acumulados, estatus logístico de pedidos e incluso la popularidad de tus productos (mediante visitas únicas simuladas consistentemente e historial de ventas reales). ¡Perfecto para tomar decisiones!";
      } else {
        return "El costo promedio de flete agrícola local en El Salvador ronda los $1.50 a $3.00 por kilómetro. En AgroMarket, puedes buscar productos frescos directos del agricultor, ahorrándote intermediarios y consiguiendo el mejor precio del mercado local.";
      }
    }

    // 5. How to Buy
    if (text.includes("comprar") || text.includes("carrito") || text.includes("compra") || text.includes("adquirir") || text.includes("pagar")) {
      return "¡Comprar es súper sencillo! 🛒 Navega por los productos frescos cercanos en tu pantalla de inicio, agrégalos a tu **Carrito** y procesa el pedido. Recuerda tener saldo suficiente recargando tu billetera virtual en tu **Perfil** con la tarjeta 3D.";
    }

    // 6. Generic Default
    return `¡Excelente pregunta, @${username}! 🌾 Como AgroHelp AI, estoy programado para asistirte en todo lo relacionado con tu cuenta. Te sugiero explorar temas específicos como: **Retiros de ganancias**, **Clima real y alerta de plagas**, **Simulador de entregas 🚚** o **Plagas y pH del suelo**. ¡Prueba haciendo clic en una de las preguntas rápidas abajo!`;
  };

  // Send Message Logic
  const sendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI typing delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const botMsg = {
      sender: "bot",
      text: getBotResponse(text),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  // Predefined Quick suggestions depending on role
  const quickQuestions = isSeller ? [
    "¿Cómo retirar mis ganancias? 💰",
    "¿Dónde ver mi rendimiento comercial? 📊",
    "¿Cómo combatir plagas y regular el pH del suelo? 🌱",
    "¿Cómo funciona la simulación de entregas? 🚚"
  ] : [
    "¿Cómo comprar productos y pagar? 🛒",
    "¿Cómo ver la entrega en el mapa real? 🚚",
    "¿Consejos para combatir hongos de cultivos? 🥬",
    "¿Cómo recargo saldo en mi billetera? 💳"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-poppins select-none">
      
      {/* Floating Glowing Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-successLight text-primaryAltDark p-4 rounded-full shadow-[0_4px_25px_rgba(164,214,160,0.4)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center relative group animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          {/* Pulsating Ring */}
          <span className="absolute inset-0 rounded-full border-2 border-successLight/40 animate-ping pointer-events-none" />
          <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition duration-300" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-green-950/95 border border-white/10 rounded-2xl w-[350px] sm:w-[380px] h-[500px] shadow-2xl flex flex-col overflow-hidden animate-fade-in backdrop-blur-md">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-successLight/15 via-emerald-800/30 to-green-950 px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-successLight/10 rounded-lg border border-successLight/20 text-successLight shrink-0 relative">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-green-950 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-white text-xs uppercase tracking-wider">AgroHelp AI</h4>
                <p className="text-[10px] text-successLight font-bold">Asistente en línea</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/5 transition duration-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#09110a]/50">
            {messages.map((msg, idx) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={idx} className={`flex items-start gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}>
                  <div className={`p-1.5 rounded-lg border text-[10px] shrink-0 ${isBot ? "bg-successLight/10 text-successLight border-successLight/20" : "bg-white/5 text-white/60 border-white/10"}`}>
                    {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isBot 
                      ? "bg-white/5 border border-white/5 text-white/90" 
                      : "bg-successLight text-primaryAltDark font-semibold"
                  }`}>
                    {/* Render basic bold text formatting for simulated markdown */}
                    <p className="whitespace-pre-line" dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                    <span className={`block text-[8px] text-right mt-1.5 ${isBot ? "text-white/35" : "text-primaryAltDark/60"}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Bending typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg border text-[10px] shrink-0 bg-successLight/10 text-successLight border-successLight/20">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-xs text-white/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-successLight rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-successLight rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-successLight rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions footer */}
          <div className="px-3 pt-2 bg-[#09110a]/80 border-t border-white/5 max-h-[85px] overflow-y-auto flex flex-wrap gap-1.5 justify-start">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q.replace(/[💰📊🌱🚚🛒💳🥬]/gu, ""))}
                className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 hover:bg-successLight hover:text-primaryAltDark border border-white/5 text-white/70 transition-all duration-300 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-green-950 border-t border-white/10 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregúntale a AgroHelp..."
              className="flex-1 bg-black/40 text-white placeholder-white/30 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-successLight/40 focus:bg-black/60 transition duration-300 text-xs shadow-inner"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="bg-successLight text-primaryAltDark p-2.5 rounded-xl border border-successLight/10 hover:bg-white hover:text-green-950 disabled:opacity-40 transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default AgroHelpChat;
