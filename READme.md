📦 Entrega Final - Backend I

Este proyecto corresponde a la entrega final del curso Backend I, donde se desarrolló un servidor con Node.js utilizando Express, implementando persistencia en MongoDB, vistas dinámicas con Handlebars y comunicación en tiempo real mediante Socket.IO.

🚀 Funcionalidades principales
Gestión de productos
Crear, leer, actualizar y eliminar productos (CRUD completo)
Paginación, filtros y ordenamiento en endpoint /api/products
Persistencia en MongoDB
Gestión de carritos
Creación de carritos
Consulta de carrito por ID con populate de productos
Agregar productos al carrito
Eliminar productos del carrito
Actualizar cantidad de productos
Vaciar carrito
Vistas dinámicas
/ → listado de productos
/realtimeproducts → productos en tiempo real
Tiempo real con WebSockets
Actualización automática de productos al agregar, editar o eliminar
Comunicación cliente-servidor mediante Socket.IO
🛠️ Tecnologías utilizadas
Node.js
Express
MongoDB + Mongoose
Handlebars
Socket.IO

📌 Notas
Los productos y carritos utilizan _id generados por MongoDB.
La vista en tiempo real refleja los cambios sin necesidad de recargar la página.
La API sigue una estructura REST para el manejo de recursos.
