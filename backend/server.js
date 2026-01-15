const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // ✅ MIGRACIÓN: Importar cookie-parser
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth'); // ✅ Importar desde middleware

const app = express();

// ✅ MIGRACIÓN A COOKIES: Configurar CORS para aceptar cookies
app.use(cors({
  origin: 'http://localhost:5173', // Origen específico requerido para credentials
  credentials: true // Permite envío de cookies entre dominios
}));

app.use(express.json());
app.use(cookieParser()); // ✅ MIGRACIÓN: Middleware para parsear cookies

// Rutas
app.use('/api/auth', authRoutes);

// Ruta protegida de ejemplo
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Acceso concedido a contenido protegido',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({ 
    message: '🔐 API de Autenticación',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      profile: 'GET /api/auth/me (requiere cookie)',
      protected: 'GET /api/protected (requiere cookie)'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📚 Documentación: http://localhost:${PORT}`);
});