// carrito.js
function mostrarCarrito() {
  syncCarrito();

  const container = document.getElementById("carrito-container");
  if (!container) return;

  container.innerHTML = "";

  if (carrito.length === 0) {
    container.innerHTML = "<p>El carrito está vacío.</p>";
    return;
  }

  let totalGeneral = 0;

  carrito.forEach(producto => {
    const subtotal = Number(producto.precio) * Number(producto.cantidad);
    totalGeneral += subtotal;

    const div = document.createElement("div");
    div.classList.add("producto-carrito");
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" width="100">
      <div>
        <p><strong>${producto.nombre}</strong></p>
        <p>Precio unitario: $${producto.precio}</p>
        <p>
          Cantidad: 
          <input type="number" min="1" value="${producto.cantidad}" id="cantidad-${producto.id}" style="width:60px">
          <button onclick="actualizarCantidad(${producto.id})">Actualizar</button>
        </p>
        <p>Subtotal: $${subtotal}</p>
        <button onclick="eliminarDelCarrito(${producto.id})">Eliminar</button>
      </div>
    `;
    container.appendChild(div);
  });

  const totalDiv = document.createElement("div");
  totalDiv.style.marginTop = "20px";
  totalDiv.style.fontWeight = "bold";
  totalDiv.innerHTML = `Total general: $${totalGeneral}`;
  container.appendChild(totalDiv);
}

function actualizarCantidad(id) {
  const input = document.getElementById(`cantidad-${id}`);
  let nuevaCantidad = parseInt(input?.value, 10);
  if (isNaN(nuevaCantidad) || nuevaCantidad < 1) nuevaCantidad = 1;

  const producto = carrito.find(p => Number(p.id) === Number(id));
  if (producto) {
    producto.cantidad = nuevaCantidad;
    guardarCarrito();
    mostrarCarrito();
  }
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => Number(p.id) !== Number(id));
  guardarCarrito();
  mostrarCarrito();
}
