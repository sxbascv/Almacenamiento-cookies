const jwt = require('jsonwebtoken');

// ✅ MIGRACIÓN A COOKIES: Middleware de autenticación lee token desde cookies
function authenticateToken(req, res, next) {
  // Leer el token desde las cookies en lugar de headers
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };