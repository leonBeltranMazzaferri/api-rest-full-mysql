// ====================================================================
// ARCHIVO: js/admin.js
// FUNCIÓN: Lógica CRUD para el panel de administración, interactuando
// con la base de datos a través de la API REST.
//
// CAMBIO: Se ha quitado la lógica y los mensajes de validación para 'stock'
// ya que no existe en la BD ni en el HTML.
// ====================================================================

const API_PRODUCTS_URL = "http://localhost:3000/api/producto";
const API_LOGOUT_URL = "http://localhost:3000/api/users/logout"; 

let productos = []; 
let productoSeleccionado = null; 
const adminContainer = document.getElementById('formAdmin'); // Contenedor del formulario de Crear/Editar
const galeriaContainer = document.getElementById('galeria-admin'); // Contenedor de la lista de productos

// ====================================================================
// --- Helpers para mensajes y confirmación ---
// ====================================================================

/**
 * Muestra un mensaje temporal en la interfaz (reemplazo de alert()).
 */
function displayMessage(msg, type = 'success') {
    const msgContainer = document.getElementById('msg-container');
    if (msgContainer) {
        msgContainer.textContent = msg;
        // Uso de clases para aplicar estilos Tailwind si están disponibles
        msgContainer.className = `message p-3 rounded-lg mt-2 ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`; 
        msgContainer.style.display = 'block'; 
        setTimeout(() => {
            msgContainer.style.display = 'none';
            msgContainer.textContent = '';
        }, 5000);
    } else {
        console.log(`[MSG ${type.toUpperCase()}]: ${msg}`);
    }
}

/**
 * Muestra un modal de confirmación personalizado (reemplazo de window.confirm()).
 */
function showConfirmation(message, onConfirm) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background: white; padding: 25px; border-radius: 10px; text-align: center; max-width: 90%; width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);';
    content.innerHTML = `
        <p style="margin-bottom: 20px; font-weight: 600;">${message}</p>
        <button id="confirm-yes" style="background-color: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin: 0 10px; cursor: pointer;">Sí, Proceder</button>
        <button id="confirm-no" style="background-color: #9ca3af; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin: 0 10px; cursor: pointer;">Cancelar</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('confirm-yes').onclick = () => {
        modal.remove();
        onConfirm(true);
    };
    document.getElementById('confirm-no').onclick = () => {
        modal.remove();
        onConfirm(false);
    };
}


// ====================================================================
// 🖼️ LÓGICA DE VISUALIZACIÓN DE PRODUCTOS (READ)
// ====================================================================

async function cargarProductosAdmin() {
    if (adminContainer) adminContainer.style.display = 'block';
    if (!galeriaContainer) return;

    galeriaContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Cargando productos...</p>';

    try {
        const res = await fetch(API_PRODUCTS_URL, { credentials: 'include' }); 

        if (res.status === 401 || res.status === 403) {
             galeriaContainer.innerHTML = `
                <p class="error-msg" style="color: orange; text-align: center; font-size: 1.1rem; padding: 30px;">
                    ADVERTENCIA: Interfaz de Administración cargada sin autenticación. 
                    No se pudieron cargar los datos de la API (${res.status}). 
                    Por favor, inicia sesión para ver/modificar productos.
                </p>`;
             productos = []; 
             return; 
        }
        
        if (!res.ok) throw new Error("Error al cargar productos: " + res.status);
        
        const data = await res.json();
        productos = data; 

        renderizarGaleriaAdmin(galeriaContainer, productos);
        
    } catch (err) {
        console.error("Error al cargar productos para Admin:", err);
        galeriaContainer.innerHTML = '<p class="error-msg" style="color: red; padding: 4px;">No se pudieron cargar los productos. Verifique la ruta de API y el servidor.</p>';
    }
}

function renderizarGaleriaAdmin(galeriaElement, productList) {
    galeriaElement.innerHTML = ''; 

    if (productList.length === 0) {
        galeriaElement.innerHTML = '<p style="text-align: center; padding: 20px;">No hay productos cargados en la base de datos.</p>';
        return;
    }

    productList.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('item', 'admin-item', 'shadow-md', 'hover:shadow-lg', 'transition-shadow', 'duration-300', 'rounded-lg', 'overflow-hidden');
        
        const defaultImg = 'https://placehold.co/200x200/cccccc/333333?text=Sin+Imagen';
        const precioDisplay = producto.precio ? Number(producto.precio).toFixed(2) : '0.00';
        // Mostrar "N/A" si stock no existe (lógica segura mantenida)
        const stockDisplay = producto.stock !== undefined ? producto.stock : 'N/A';
        const descripcionDisplay = producto.descripcion ? producto.descripcion.substring(0, 50) + '...' : 'Sin descripción';


        div.innerHTML = `
            <img src="${producto.imagen || defaultImg}" 
                 alt="${producto.nombre}"
                 class="w-full h-32 object-cover"
                 onerror="this.onerror=null;this.src='${defaultImg}';" />
            <div class="product-info p-4 text-center">
                <h2 style="font-size: 1.2rem; font-weight: bold;">${producto.nombre}</h2>
                <h3 style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">${descripcionDisplay}</h3>
                <p style="font-size: 1.1rem; color: #008000; font-weight: 600; margin-bottom: 5px;"><strong>$${precioDisplay}</strong></p>
                <p style="font-size: 0.9rem;">Stock: ${stockDisplay}</p>
                <div class="admin-actions mt-3 flex gap-2">
                    <button class="editar-btn flex-1 py-2 px-4 rounded transition-colors duration-200 bg-blue-500 hover:bg-blue-700 text-white" data-id="${producto.id_producto}"><i class='bx bx-pencil'></i> Editar</button>
                    <button class="eliminar-btn flex-1 py-2 px-4 rounded transition-colors duration-200 bg-red-500 hover:bg-red-700 text-white" data-id="${producto.id_producto}"><i class='bx bx-trash'></i> Eliminar</button>
                </div>
            </div>
        `;
        galeriaElement.appendChild(div);
    });

    // RE-ADJUNTA LISTENERS
    document.querySelectorAll('.editar-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            mostrarFormularioEdicion(e.currentTarget.dataset.id);
        });
    });
    
    document.querySelectorAll('.eliminar-btn').forEach(button => {
        button.addEventListener('click', (e) => {
             eliminarProducto(e.currentTarget.dataset.id);
        });
    });
}

// ====================================================================
// ➕ LÓGICA DE AGREGAR PRODUCTO (CREATE)
// ====================================================================

document.getElementById('nuevoProd')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newProduct = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        precio: Number(formData.get('precio')),
        // Stock no se incluye
        imagen: formData.get('imagen_url') || 'images/default.jpeg'
    };

    // 🟢 Ajuste: Solo validamos el precio y corregimos el mensaje
    if (isNaN(newProduct.precio)) {
        displayMessage('El precio debe ser un número válido.', 'error');
        return;
    }
    
    try {
        const res = await fetch(API_PRODUCTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
            credentials: 'include' 
        });
        
        const data = await res.json();
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                displayMessage("ERROR DE PERMISO: Sesión expirada o no tiene permisos. Inicie sesión para crear productos.", 'error');
                return;
            }
            throw new Error(data.msg || 'Fallo al crear producto.');
        }
        
        displayMessage('Producto agregado correctamente.');
        e.target.reset();
        cargarProductosAdmin(); 
        
    } catch (error) {
        displayMessage('Error al agregar producto: ' + error.message, 'error');
        console.error('Error al crear producto:', error);
    }
});

// ====================================================================
// ✏️ LÓGICA DE ACTUALIZAR PRODUCTO (UPDATE) - CORRECTA
// ====================================================================

function mostrarFormularioEdicion(id) {
    // 1. Encontrar el producto en el array local
    productoSeleccionado = productos.find(p => String(p.id_producto) === String(id));
    
    if (!productoSeleccionado) {
        displayMessage("Producto no encontrado para editar.", 'error');
        return;
    }
    
    // 2. Obtener el formulario de edición y asignarle el ID
    const formActualizar = document.getElementById('actualizar');
    const editProdDiv = document.getElementById('EditarProd');
    const agregarProdDiv = document.getElementById('AgregarProd');
    const mostrarFormBtn = document.getElementById('mostrarFormAgregar');

    if (!formActualizar || !editProdDiv) {
        displayMessage("Error interno: Faltan elementos de edición en el HTML.", 'error');
        console.error("[ERROR] Faltan elementos clave en el DOM para la edición.");
        return;
    }

    formActualizar.dataset.productId = productoSeleccionado.id_producto; 
    
    // 3. Rellenar los campos con los datos actuales
    document.getElementById('edit-nombre').value = productoSeleccionado.nombre || '';
    document.getElementById('edit-descripcion').value = productoSeleccionado.descripcion || '';
    document.getElementById('edit-precio').value = productoSeleccionado.precio || 0;

    const editImgUrl = document.getElementById('edit-imagen-url');
    if(editImgUrl) editImgUrl.value = productoSeleccionado.imagen || ''; 
    
    // 🔴 NOTA: La línea de 'edit-stock' NO está presente aquí, lo cual es CORRECTO
    // para evitar el fallo si el campo no existe en el HTML.

    // 4. Control de visibilidad: Ocultar Agregar, Mostrar Editar
    if(agregarProdDiv) agregarProdDiv.style.display = 'none';
    if(editProdDiv) editProdDiv.style.display = 'block'; 
    if(mostrarFormBtn) mostrarFormBtn.style.display = 'none';

}

document.getElementById('actualizar')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.dataset.productId;
    const formData = new FormData(e.target);
    
    const updatedData = {
        nombre: formData.get('edit-nombre'),
        descripcion: formData.get('edit-descripcion'),
        precio: Number(formData.get('edit-precio')),
        
        imagen: formData.get('edit-imagen-url') || (productoSeleccionado ? productoSeleccionado.imagen : '')
    };

    // 🟢 Ajuste: Solo validamos el precio y corregimos el mensaje
    if (isNaN(updatedData.precio) ) {
        displayMessage('El precio debe ser un número válido.', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_PRODUCTS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
            credentials: 'include' 
        });

        const data = await res.json();
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                 displayMessage("ERROR DE PERMISO: Sesión expirada o no tiene permisos para actualizar. Inicie sesión.", 'error');
                 return;
            }
            throw new Error(data.msg || 'Fallo al actualizar.');
        }

        displayMessage('Producto actualizado correctamente.');
        
        // Regresar a la vista de agregar
        document.getElementById('EditarProd').style.display = 'none';
        document.getElementById('AgregarProd').style.display = 'block';
        document.getElementById('mostrarFormAgregar').style.display = 'inline-block';
        cargarProductosAdmin(); 
        
    } catch (error) {
        displayMessage('Error al actualizar producto: ' + error.message, 'error');
        console.error('Error al actualizar producto:', error);
    }
});

document.getElementById('cancelarEdicion')?.addEventListener('click', () => {
    document.getElementById('EditarProd').style.display = 'none';
    document.getElementById('AgregarProd').style.display = 'block';
    document.getElementById('mostrarFormAgregar').style.display = 'inline-block';
});


// ====================================================================
// 🗑️ LÓGICA DE ELIMINAR PRODUCTO (DELETE)
// ====================================================================

async function eliminarProducto(id) {
    showConfirmation(`¿Estás seguro de que quieres eliminar el producto ID ${id}? Esta acción es irreversible.`, async (confirmed) => {
        if (!confirmed) {
            return;
        }

        try {
            const res = await fetch(`${API_PRODUCTS_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include' 
            });
            
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    displayMessage("ERROR DE PERMISO: Sesión expirada o no tiene permisos para eliminar. Inicie sesión.", 'error');
                    return;
                }
                throw new Error(data.msg || 'Fallo al eliminar.');
            }

            displayMessage('Producto eliminado correctamente.');
            cargarProductosAdmin(); 
            
        } catch (error) {
            displayMessage('Error al eliminar producto: ' + error.message, 'error');
            console.error('Error al eliminar producto:', error);
        }
    });
}


// ====================================================================
// 🏁 INICIALIZACIÓN
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosAdmin(); 

    // Listener para mostrar el formulario de agregar
    document.getElementById('mostrarFormAgregar')?.addEventListener('click', (e) => {
        e.currentTarget.style.display = 'none'; 
        const agregarProdDiv = document.getElementById('AgregarProd');
        const editarProdDiv = document.getElementById('EditarProd');

        if(agregarProdDiv) agregarProdDiv.style.display = 'block';
        if(editarProdDiv) editarProdDiv.style.display = 'none'; 
    });

    // Listener para cerrar sesión
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
         try {
             await fetch(API_LOGOUT_URL, { method: 'POST', credentials: 'include' });
         } catch (e) {
             console.log("Error al hacer logout, redirigiendo de todas formas...");
         } finally {
            window.location.href = "login.html";
         }
    });
});