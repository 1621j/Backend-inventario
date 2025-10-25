const jwt = require('jsonwebtoken');

// Middleware para validar token JWT
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'team-secret');
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Middleware para permitir solo admin
function isAdmin(req, res, next) {
  if (req.user && req.user.id_rol === 1) {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado: solo admin' });
}

module.exports = { auth, isAdmin };
