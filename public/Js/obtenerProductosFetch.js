// ====================================================================
// ARCHIVO: js/obtenerProductosFech.js
// FUNCIÓN: Carga y muestra productos obtenidos de la API REST (MySQL)
// ====================================================================

let productos = [];
// 🚨 CORRECCIÓN CRÍTICA: Se reemplaza [PUERTO] por el puerto 3000.
const API_PRODUCTOS_URL = 'http://localhost:3000/api/producto'; 

/**
 * Función que carga los productos desde la API REST.
 * Reemplaza la carga desde el archivo JSON estático.
 * @param {function} callback - Función a ejecutar después de cargar los datos (renderizarGaleria).
 */
function cargarProductosDesdeAPI(callback) {
  fetch(API_PRODUCTOS_URL)
    .then(res => {
      if (!res.ok) {
        // Log de error en la consola si la petición falla por CORS, 404, etc.
        console.error(`ERROR HTTP: La petición a ${API_PRODUCTOS_URL} falló con estado ${res.status}`);
        throw new Error("Error al cargar la API: " + res.status);
      }
      return res.json();
    })
    .then(data => {
      // ⚠️ Mapeo CRÍTICO: Ajusta las columnas de MySQL a las esperadas por el Front (id, precio)
      productos = data.map(p => ({
        id: p.id_producto || p.id, // Usa id_producto, o 'id' como fallback
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: parseFloat(p.precio), // Convertir el precio a un número flotante
        imagen: p.imagen 
      }));
      
      console.log("✅ Productos cargados y mapeados correctamente:", productos);

      if (callback) callback();
    })
    .catch(err => {
      // Este error ya no debería aparecer una vez que se corrige la URL.
      console.error("❌ Error CRÍTICO al obtener o procesar productos:", err);
      // Muestra un mensaje de error en la galería
      const galeria = document.getElementById('galeria');
      if (galeria) galeria.innerHTML = '<h2>❌ Error al cargar los productos. Revisa la Consola del Navegador (F12) para más detalles.</h2>';
    });
}

/**
 * Función que renderiza los productos en la galería HTML.
 */
function renderizarGaleria() {
  const galeria = document.getElementById('galeria');
  if (!galeria) return;

  // Limpia la galería antes de renderizar
  galeria.innerHTML = '';

  if (productos.length === 0) {
      galeria.innerHTML = '<h2>No hay productos disponibles en la base de datos.</h2>';
      return;
  }

  productos.forEach(producto => {
    // Verificación de datos básicos antes de renderizar
    if (!producto.id || !producto.nombre || isNaN(producto.precio)) {
        console.warn("Producto inválido, omitiendo:", producto);
        return; 
    }

    const div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      <h2>${producto.nombre}</h2>
      <h3>${producto.descripcion}</h3>
      <p><strong>$${producto.precio.toFixed(2)}</strong></p>
      <input type="number" id="gal-cantidad-${producto.id}" min="1" value="1" style="width:60px">
      <button id="btn-agregar-${producto.id}">Agregar al carrito 🛒</button>
      <button id="btn-fav-${producto.id}" style="color:red; font-size:20px;">❤️</button>
    `;
    galeria.appendChild(div);

    // Event listeners
    document.getElementById(`btn-agregar-${producto.id}`).addEventListener('click', () => {
      let cantidad = parseInt(document.getElementById(`gal-cantidad-${producto.id}`).value);
      if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
      agregarAlCarritoConCantidad(producto.id, cantidad);
      mostrarCarrito();
    });

    document.getElementById(`btn-fav-${producto.id}`).addEventListener('click', () => {
      agregarAFavoritos(producto);
      mostrarFavoritos();
    });
  });
}

// Inicia la carga de productos desde la API al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarProductosDesdeAPI(renderizarGaleria);
});