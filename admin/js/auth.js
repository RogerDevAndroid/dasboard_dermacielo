// Función para verificar si el usuario está autenticado
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

// Verificar autenticación al cargar cualquier página
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    // Configurar el menú de usuario
    const adminUserInfo = document.getElementById('adminUserInfo');
    if (adminUserInfo) {
        adminUserInfo.addEventListener('click', () => {
            // Aquí puedes agregar la lógica para mostrar un menú desplegable
            logout();
        });
    }
});