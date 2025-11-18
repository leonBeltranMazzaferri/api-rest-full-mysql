// js/modulo.js

// ==========================
// HEADER, NAV Y FOOTER
// ==========================
document.querySelector('#header').innerHTML = `
    <div class="header-left">
        <button id="searchBtn">
            <img src="images/search-alt.png" alt="lupa">
        </button>

        <a href="index.html">
            <button id="user">
                <img src="images/medal-star.png" alt="user">
            </button>
        </a>

        <a href="carrito.html">
            <button id="cartBtn"><img src="images/cart.png" alt="carrito"></button>
        </a>

        <a href="favoritos.html">
            <button id="favBtn">
                <img src="images/heart.png" alt="favoritos">
            </button>
        </a>
    </div>

    <h1 class="titulo">SUO</h1>

    <div class="header-right">
        <a href="login.html">
            <button id="userBtn">
                <img src="images/user-square.png" alt="usuario">
            </button>
        </a>
        <a href="admin.html">
            <button id="Admin">
                <img src="images/star-circle.png" alt="admin">
            </button>
        </a>
        <button id="menuBtn">
            <img src="images/menu-close.png" alt="menú">
        </button>
    </div>
`;

document.querySelector('#nav').innerHTML = `
    <ul>
        <li>link 1</li>
        <li>link 2</li>
    </ul>
`;

document.querySelector('#footer').innerHTML = `
    <h1 class="titulo">leon beltran -- belen martinez -- brisa farias</h1>
`;


document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('nav').classList.toggle('hidden');
});

// ==========================
// LÓGICA ESPECÍFICA PARA ADMIN.HTML
// ==========================

// Manejar el botón para mostrar el formulario de agregar en admin.html
document.addEventListener('DOMContentLoaded', () => {
    const btnAgregar = document.querySelector('.addcarrito');
    const formAgregar = document.getElementById('AgregarProd');
    const formEditar = document.getElementById('EditarProd');

    if (btnAgregar && formAgregar && formEditar) {
        btnAgregar.addEventListener('click', () => {
            // Mostrar el formulario para agregar y ocultar el de editar
            formAgregar.style.display = 'block';
            formEditar.style.display = 'none';
        });
        
        // Ocultar el formulario de edición al cargar la página si estamos en admin.html
        if (window.location.pathname.includes('admin.html')) {
            formEditar.style.display = 'none';
        }
    }
});