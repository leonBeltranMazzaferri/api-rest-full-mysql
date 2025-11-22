// js/auth.js (FINAL Y OPTIMIZADO)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuración Inicial ---
    
    const form = document.querySelector('.form');
    const submitButton = document.querySelector('.form-btn'); 
    
    // Asegúrate de que esta URL sea la correcta para tu proyecto (ej: http://localhost:3000)
    const BASE_URL = 'http://localhost:3000/api/users'; 

    if (!form || !submitButton) {
        console.error("No se encontró el formulario o el botón. Verifica las clases 'form' y 'form-btn'.");
        return;
    }

    const isRegisterPage = window.location.pathname.includes('register.html');
    const endpoint = isRegisterPage ? `${BASE_URL}/register` : `${BASE_URL}/login`;

    // ----------------------------------------------------
    // Manejar el envío del formulario
    // ----------------------------------------------------
    submitButton.addEventListener('click', async (event) => {
        event.preventDefault(); 

        // 1. Obtener todos los inputs del formulario
        const inputs = form.querySelectorAll('.input');
        
        // Inicializar variables para login (solo email y password)
        let nombre = '';
        let email = '';
        let password = '';

        // 2. Determinar la extracción de datos basada en la página
        if (isRegisterPage) {
            // Se ASUME el orden en register.html: [0] nombre, [1] email, [2] password
            if (inputs.length < 3) {
                 alert('Error: La página de registro debe tener campos de Nombre, Email y Contraseña.');
                 return;
            }
            nombre = inputs[0].value.trim();
            email = inputs[1].value.trim();
            password = inputs[2].value.trim();
            
            if (!nombre || !email || !password) {
                alert('Por favor, rellena tu nombre, email y contraseña.');
                return;
            }

        } else { // Login
            // Se ASUME el orden en login.html: [0] email, [1] password
            if (inputs.length < 2) {
                 alert('Error: La página de login debe tener campos de Email y Contraseña.');
                 return;
            }
            email = inputs[0].value.trim();
            password = inputs[1].value.trim();

            if (!email || !password) {
                alert('Por favor, rellena tu email y contraseña.');
                return;
            }
        }

        // 3. Preparar el cuerpo de la solicitud
        const bodyData = { email, password };
        if (isRegisterPage) {
            bodyData.nombre = nombre;
        }

        try {
            // 4. Enviar la solicitud POST al backend
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();

            // 5. Manejar la respuesta
            if (response.ok) {
                alert(`${isRegisterPage ? 'Registro' : 'Inicio de sesión'} exitoso: ${data.msg}`);
                // Redirigir al usuario
                window.location.href = 'index.html'; 
            } else {
                // Manejo de errores (ej: credenciales incorrectas, email duplicado)
                alert(`Error: ${data.msg || 'Algo salió mal en el servidor.'}`);
            }

        } catch (error) {
            console.error("Error de red o del servidor:", error);
            alert("No se pudo conectar con el servidor de autenticación. Verifica que el backend esté corriendo en " + BASE_URL);
        }
    });
});