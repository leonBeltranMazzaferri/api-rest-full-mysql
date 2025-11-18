// js/auth.js

const API_BASE_URL = "http://localhost:3000/api/users"; // Usamos la ruta de usuarios

// Función de Registro (singUp.html)
const handleRegister = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const nombre = form.querySelector('#nombre').value; // Asumiendo que tienes un campo nombre

    try {
        const res = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password }),
        });
        
        const data = await res.json();

        if (res.ok) {
            alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
            window.location.href = "login.html"; // Redirigir al login
        } else {
            alert(`Error de registro: ${data.msg || 'Datos inválidos.'}`);
        }
    } catch (error) {
        console.error("Fallo de conexión:", error);
        alert("Error de conexión con el servidor.");
    }
};

// Función de Login (login.html)
const handleLogin = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            // ¡Importante! El backend debe usar cookies para esto.
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await res.json();

        if (res.ok) {
            alert("¡Inicio de sesión exitoso!");
            // Redirigir a una ruta protegida (ej. admin.html o perfil.html)
            window.location.href = "admin.html"; 
        } else {
            alert(`Error de inicio de sesión: ${data.msg || 'Credenciales inválidas.'}`);
        }
    } catch (error) {
        console.error("Fallo de conexión:", error);
        alert("Error de conexión con el servidor.");
    }
};

// Asignar los handlers a los formularios al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registro-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});