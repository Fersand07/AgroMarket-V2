# AgroMarket

**AgroMarket** Es una plataforma de código abierto diseñada para fortalecer la comercialización de productos agrícolas en El Salvador. Su propósito es mejorar la interacción entre pequeños productores, vendedores de mercados locales y consumidores, utilizando tecnologías accesibles como la geolocalización y el cálculo de rutas.

##  Stack Tecnológico

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB
- **Otros:** Mapas y geolocalización con la libreria de codigo abierto leaflet

##  Estructura del proyecto
/
 -AGROMARKET_CLIENT -> Cliente web (frontend en React)
 -AGROMARKET_SERVER -> Servidor backend (Node.js + Express)
 -README.md -> Este archivo

###  AGROMARKET_CLIENT

Aplicación web desarrollada en React.

- Visualización de productos agrícolas.
- Mapa interactivo con rutas para facilitar la compra.
- Interfaz amigable para productores y consumidores.

### AGROMARKET_SERVER

Servidor backend que ofrece:

- API RESTful para el cliente web.
- Gestión de usuarios, productos y transacciones.
- Cálculo de rutas optimizadas con geolocalización.


## Requisitos

- Node.js >= 18.x
- MongoDB >= 6.x
- NPM >= 9.x

## La documentación está disponible en el siguiente enlace: https://moiezequiel.github.io/documentacion-agromarket/

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/acardo02/AgroMarket.git

# Instalar dependencias del cliente
cd AGROMARKET_CLIENT
npm install

# Instalar dependencias del servidor
cd ../AGROMARKET_SERVER
npm install

# Correr el frontend
cd AGROMARKET_CLIENT
npm run dev

# Correr el backend
cd ../AGROMARKET_SERVER
npm run start

