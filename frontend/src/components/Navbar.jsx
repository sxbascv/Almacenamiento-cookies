import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ✅ MIGRACIÓN: handleLogout ahora es async
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">🔐 Auth App</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Inicio</Link>
        {!isAuthenticated() ? (
          <>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span className="user-greeting">Hola, {user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;