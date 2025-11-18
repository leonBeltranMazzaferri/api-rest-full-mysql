// obtenerProductosFech.js
let productos = [];

function cargarProductosDesdeJSON(callback) {
  fetch('data/data.json')
    .then(res => {
      if (!res.ok) throw new Error("Error al cargar JSON: " + res.status);
      return res.json();
    })
    .then(data => {
      productos = data;
      if (callback) callback();
    })
    .catch(err => console.error(err));
}

function renderizarGaleria() {
  const galeria = document.getElementById('galeria');
  if (!galeria) return;

  galeria.innerHTML = '';

  productos.forEach(producto => {
    const div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      <h2>${producto.nombre}</h2>
      <h3>${producto.descripcion}</h3>
      <p><strong>$${producto.precio}</strong></p>
      <input type="number" id="gal-cantidad-${producto.id}" min="1" value="1" style="width:60px">
      <button id="btn-agregar-${producto.id}">Agregar al carrito 🛒</button>
      <button id="btn-fav-${producto.id}" style="color:red; font-size:20px;">❤️</button>
    `;
    galeria.appendChild(div);


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

document.addEventListener('DOMContentLoaded', () => {
  cargarProductosDesdeJSON(renderizarGaleria);
});
