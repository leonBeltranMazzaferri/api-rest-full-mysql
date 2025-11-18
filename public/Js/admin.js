// js/admin.js

const API_PRODUCTS_URL = "http://localhost:3000/api/products";
const API_PROFILE_URL = "http://localhost:3000/api/users/profile";
let productos = []; // Almacena la copia local de los productos para la galería
let productoSeleccionado = null; // Producto actualmente en edición

// ====================================================================
// 🔒 FUNCIÓN DE VERIFICACIÓN DE AUTENTICACIÓN (RUTA PROTEGIDA)
// ====================================================================

/**
 * Verifica si el usuario tiene un token JWT válido (cookie)
 * intentando acceder a la ruta protegida del backend.
 */
async function checkAuthAndLoad() {
    try {
        const res = await fetch(API_PROFILE_URL, {
            method: 'GET',
            // CRUCIAL: 'include' asegura que el navegador envíe las cookies JWT
            credentials: 'include' 
        });

        if (!res.ok) {
            // Si la respuesta no es 200 (ej: 401 Unauthorized), redirige al login
            alert("Acceso denegado. Debes iniciar sesión para ver el administrador.");
            window.location.href = "login.html"; 
        } else {
            // Usuario autenticado. Ahora sí, carga el panel y los datos
            const user = await res.json();
            console.log(`Bienvenido, ${user.user.nombre}. Cargando panel de administración.`);
            
            // Opcional: Si necesitas verificar rol (admin)
            // if (user.user.rol !== 'admin') { ... }

            cargarProductosAdmin(); // Inicia la carga de datos del CRUD
        }
    } catch (error) {
        console.error("Error verificando autenticación:", error);
        alert("Error de conexión con el servidor. Revisar backend.");
        window.location.href = "login.html"; 
    }
}

// ====================================================================
// 🖼️ LÓGICA DE VISUALIZACIÓN DE PRODUCTOS (READ - LECTURA)
// ====================================================================

/**
 * Carga los productos desde el backend para mostrarlos en el panel de administración.
 */
async function cargarProductosAdmin() {
    const galeria = document.getElementById('galeria-admin');
    if (!galeria) return;

    galeria.innerHTML = '<p>Cargando productos...</p>';

    try {
        const res = await fetch(API_PRODUCTS_URL);
        if (!res.ok) throw new Error("Error al cargar productos: " + res.status);
        
        const data = await res.json();
        productos = data; // Guardar la lista local

        renderizarGaleriaAdmin(galeria, productos);
        
    } catch (err) {
        console.error("Error al cargar productos para Admin:", err);
        galeria.innerHTML = '<p class="error-msg">No se pudieron cargar los productos. Verifique el backend y la base de datos.</p>';
    }
}

/**
 * Renderiza la galería con botones de edición y eliminación.
 */
function renderizarGaleriaAdmin(galeriaElement, productList) {
    galeriaElement.innerHTML = ''; 

    productList.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('item');
        // Asegúrate de usar los campos correctos (id_producto, nombre, etc.) según tu DB
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" />
            <h2>${producto.nombre}</h2>
            <h3>${producto.descripcion}</h3>
            <p><strong>$${producto.precio.toFixed(2)}</strong></p>
            <p>Stock: ${producto.stock}</p>
            <button class="editar-btn" data-id="${producto.id_producto}"><i class="bx bx-pencil"></i> Editar</button>
            <button class="eliminar-btn" data-id="${producto.id_producto}"><i class="bx bx-trash"></i> Eliminar</button>
        `;
        galeriaElement.appendChild(div);
    });

    // Añadir event listeners para Editar y Eliminar
    document.querySelectorAll('.editar-btn').forEach(button => {
        button.addEventListener('click', (e) => mostrarFormularioEdicion(e.target.dataset.id));
    });
    document.querySelectorAll('.eliminar-btn').forEach(button => {
        button.addEventListener('click', (e) => eliminarProducto(e.target.dataset.id));
    });
}

// ====================================================================
// ➕ LÓGICA DE AGREGAR PRODUCTO (CREATE - CREACIÓN)
// ====================================================================

document.getElementById('nuevoProd')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Convertir el FormData a un objeto JSON
    const newProduct = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        // Convertir precio y stock a números
        precio: Number(formData.get('precio')),
        stock: Number(formData.get('stock')),
        // Usar un placeholder simple si no se maneja la subida de archivos
        imagen: formData.get('imagen_url') || 'images/default.jpeg' 
    };

    try {
        const res = await fetch(API_PRODUCTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Fallo al crear producto.');
        
        alert('Producto agregado correctamente.');
        e.target.reset();
        cargarProductosAdmin(); 
    } catch (error) {
        alert('Error al agregar producto: ' + error.message);
    }
});

// ====================================================================
// ✏️ LÓGICA DE ACTUALIZAR PRODUCTO (UPDATE - ACTUALIZACIÓN)
// ====================================================================

/**
 * Muestra el formulario de edición y precarga datos del producto seleccionado.
 */
function mostrarFormularioEdicion(id) {
    // Buscar el producto por su ID (cuidado con los tipos: Number/String)
    productoSeleccionado = productos.find(p => String(p.id_producto) === String(id));
    
    if (!productoSeleccionado) {
        alert("Producto no encontrado para editar.");
        return;
    }
    
    // Asignar el ID al formulario de actualización para la petición PUT
    const formActualizar = document.getElementById('actualizar');
    formActualizar.dataset.productId = productoSeleccionado.id_producto; 
    
    // Precargar datos en los campos de edición
    document.getElementById('edit-nombre').value = productoSeleccionado.nombre;
    document.getElementById('edit-descripcion').value = productoSeleccionado.descripcion;
    document.getElementById('edit-precio').value = productoSeleccionado.precio;
    document.getElementById('edit-stock').value = productoSeleccionado.stock;
    
    // Mostrar/ocultar secciones
    document.getElementById('AgregarProd').style.display = 'none';
    document.getElementById('EditarProd').style.display = 'block';
}

// Envío del formulario de ACTUALIZAR
document.getElementById('actualizar')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.dataset.productId;
    const formData = new FormData(e.target);
    
    const updatedData = {
        nombre: formData.get('edit-nombre'),
        descripcion: formData.get('edit-descripcion'),
        precio: Number(formData.get('edit-precio')),
        stock: Number(formData.get('edit-stock')),
        // Mantener la imagen existente si no se sube una nueva
        imagen: productoSeleccionado.imagen 
    };

    try {
        const res = await fetch(`${API_PRODUCTS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Fallo al actualizar.');

        alert('Producto actualizado correctamente.');
        
        // Volver a la vista de agregar
        document.getElementById('EditarProd').style.display = 'none';
        document.getElementById('AgregarProd').style.display = 'block';
        cargarProductosAdmin(); 
        
    } catch (error) {
        alert('Error al actualizar producto: ' + error.message);
    }
});

// ====================================================================
// 🗑️ LÓGICA DE ELIMINAR PRODUCTO (DELETE - ELIMINACIÓN)
// ====================================================================

/**
 * Función para eliminar un producto mediante su ID.
 */
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) return;

    try {
        const res = await fetch(`${API_PRODUCTS_URL}/${id}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Fallo al eliminar.');

        alert('Producto eliminado correctamente.');
        cargarProductosAdmin(); // Recargar la lista
        
    } catch (error) {
        alert('Error al eliminar producto: ' + error.message);
    }
}


// ====================================================================
// 🏁 INICIALIZACIÓN
// ====================================================================

// Inicia la verificación de autenticación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoad();
});