# AgroMarket 🌾🛒📍

**AgroMarket** es una plataforma tecnológica avanzada y de código abierto diseñada para transformar y potenciar la comercialización de productos agrícolas locales en El Salvador. Su propósito principal es conectar de manera inteligente a pequeños agricultores, vendedores de mercados locales y consumidores finales, utilizando geolocalización geoespacial, cálculo logístico de rutas en tiempo real y herramientas de agricultura digital.

---

## 🌟 Características Premium Avanzadas (Fase Demo)

Nuestra plataforma ha sido dotada de herramientas innovadoras y un diseño *glassmorphic* de alto impacto estético, ideal para presentaciones comerciales y demostraciones académicas de alto nivel:

### 1. 🌡️ Widget de Clima Satelital y Alertas de Cultivos (`Smart Farming`)
* **Ubicación:** Visible al iniciar sesión en el Home de Compradores y Vendedores.
* **Tecnología:** Solicita permiso de geolocalización física al navegador. Traduce las coordenadas GPS en tu dirección textual (calle, colonia y municipio) usando **OSM Nominatim Reverse-Geocoding**, y consulta en vivo la API satelital de **Open-Meteo**.
* **Inteligencia:** Evalúa dinámicamente temperatura, humedad y velocidad del viento locales para calcular de forma automatizada **Alertas Agrícolas del Clima** (ej: riesgos fúngicos por humedad, estrés térmico por calor extremo, o protección contra ráfagas de viento fuertes).

### 2. 📍 Dirección y Mapa Localizador Interactivo en el Perfil
* **Ubicación:** Sección de edición de perfil (`Userprofile.jsx`).
* **Tecnología:** Ofrece un campo de dirección autogestionado. El usuario puede escribir su dirección para que el sistema la geocodifique automáticamente mediante **Nominatim API**, o dar clic en el pin **📍** para desplegar un mapa interactivo. El mapa se centra en su ubicación actual y le permite mover o dar clic a un marcador de Leaflet para autocompletar su dirección y coordenadas exactas en Postgres.

### 3. 💳 Pasarela de Pago con Tarjeta de Crédito 3D Interactiva
* **Ubicación:** Modal de recarga de saldo en el perfil de compradores.
* **Tecnología:** Diseñado con un diseño responsivo de doble columna esmerilada. Incorpora una tarjeta de crédito en 3D interactiva que se actualiza en tiempo real mientras el usuario escribe sus datos.
* **Efecto WOW:** Al enfocar el campo del **CVV**, la tarjeta realiza un espectacular **giro en 3D de 180 grados** para revelar la banda magnética y la firma de seguridad trasera de manera ultra-suave. Conectada de forma real con base de datos Neon.

### 4. 📊 Dashboard de Control Comercial y Retiro de Ganancias
* **Ubicación:** Perfil de vendedores.
* **Tecnología:** Un centro analítico corporativo completo para agricultores y comerciantes locales:
  * **Retiro simulado:** Un simulador de cheque bancario para transferir ganancias acumuladas a cuentas bancarias de El Salvador (Banco Agrícola, Cuscatlán, BAC, Davivienda).
  * **Análisis comercial:** Fichas de KPIs en tiempo real (Ingresos acumulados, saldo actual, inventario, ventas completadas), barra interactiva animada de popularidad que cruza visitas únicas con ventas reales del producto, listado logístico de envíos e historial contable detallado de caja.

### 5. 🤖 Asistente Conversacional Global "AgroHelp AI"
* **Ubicación:** Botón flotante esmerilado que palpita suavemente en toda la plataforma.
* **Tecnología:** Un chatbot conversacional inteligente y sensible al contexto. Lee la sesión del usuario para reconocer su rol y ofrecerle sugerencias rápidas e información relevante sobre regulación del pH del suelo, control de plagas típicas en El Salvador, cálculos de fletes de camiones de carga y simulaciones financieras. Incorpora indicadores de escritura fluida y animaciones HSL premium.

### 6. 🚚 Rastreo Logístico en Tiempo Real y Animación del Camión
* **Ubicación:** Detalle de órdenes e historial de compras.
* **Tecnología:** Traza rutas de calles reales utilizando el servicio de mapas OSRM. Inicializa un marcador de camión repartidor (`🚚`) que recorre físicamente las avenidas de nodo a nodo en un **bucle infinito de demostración**, permitiendo al evaluador apreciar el movimiento del transporte logístico durante la presentación sin interrupciones.

### 7. ⭕ Círculo de Cobertura Geográfica de 15 km
* **Ubicación:** Mapa de vendedores cercanos.
* **Tecnología:** Ejecuta la **Fórmula de Haversine** en SQL nativo en el backend para calcular la distancia exacta entre el comprador y los vendedores. Filtra automáticamente a los vendedores lejanos mostrando únicamente a aquellos ubicados dentro del **radio de cobertura comercial de 15 km**, representado en el mapa por un anillo glowing con un degradado de opacidad premium.

---

## 📂 Estructura del Proyecto

El repositorio está dividido en dos partes principales:
- `AGRO_CLIENT/` -> Aplicación web frontend.
- `AGRO_SERVER/` -> API REST de backend.
- `AgroMarket_Postman_Collection.json` -> Archivo de Postman listo para importar la API.

---

## 🛠 Instalación y Despliegue Local

### Requisitos Previos
- Node.js >= 18.x
- PostgreSQL >= 14.x (local o en la nube, por ejemplo: [Neon](https://neon.tech), Supabase, Render)

### 1. Variables de Entorno (.env)

En la carpeta `AGRO_SERVER/`, asegúrese de tener el archivo `.env` configurado:
```env
PORT=3000
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/nombre_db?sslmode=require"
SECRET_KEY=tu_secreto_para_jwt
REFRESH_KEY=tu_secreto_refresh
OPENROUTE_KEY=tu_llave_de_api_de_openrouteservice
MODE=developer
```

En la carpeta `AGRO_CLIENT/`, cree su archivo `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_PUBLIC_CLOUDINARY_CLOUD_NAME=
```
> Si no tienes cuenta de Cloudinary, puedes dejarlo vacío. Las imágenes se guardarán directamente en la base de datos.

### 2. Inicializar la Base de Datos

Desde la carpeta `AGRO_SERVER/`, ejecuta:
```bash
npx prisma generate
npx prisma db push
```

### 3. Cargar Datos de Prueba

Usa estos endpoints (vía Postman o navegador) de forma secuencial para poblar la base de datos:
```
POST http://localhost:3000/api/v1/upload/sample1   (Categorías)
POST http://localhost:3000/api/v1/upload/sample2   (Unidades de medida)
POST http://localhost:3000/api/v1/upload/sample3   (Usuarios y productos demo)
```

### 4. Ejecutar Cliente (Frontend)
```bash
cd AGRO_CLIENT
npm install
npm run dev
```

### 5. Ejecutar Servidor (Backend)
```bash
cd AGRO_SERVER
npm install
npm run dev
```

---

## 🚀 API Endpoints

Puedes usar la colección de Postman incluida en el repositorio o revisar los endpoints principales a continuación.

**Base URL:** `http://localhost:3000/api/v1`

| Módulo | Métodos | Endpoints Principales |
|---|---|---|
| **Auth** | `POST` `GET` | `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` |
| **Profile** | `GET` `PATCH` `PUT` | `/profile/info`, `/profile/update`, `/profile/change-password`, `/profile/nearby-sellers` |
| **Products** | `GET` `POST` `PATCH` `DELETE`| `/products/all`, `/products/:id`, `/products/create`, `/products/update/:id`, `/products/delete/:id`, `/products/category/:id`, `/products/nearby` |
| **Cart** | `GET` `POST` `PATCH` `DELETE`| `/cart/`, `/cart/add`, `/cart/remove`, `/cart/update`, `/cart/clear` |
| **Orders** | `GET` `POST` `PUT` `PATCH` `DELETE` | `/orders/`, `/orders/:id`, `/orders/status/:id` |
| **Data Lists**| `GET` | `/data/categories`, `/data/measureUnits` |
| **Transactions**| `POST` `GET` | `/transactions/add`, `/transactions/get` |
| **Credits** | `GET` `POST` | `/credits/get`, `/credits/add`, `/credits/substract` |
| **Upload Data**| `POST` | `/upload/sample1`, `/upload/sample2`, `/upload/sample3` |

📌 Todas las rutas protegidas requieren enviar un Token JWT válido en las cabeceras de la solicitud.
