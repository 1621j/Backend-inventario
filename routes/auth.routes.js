const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'team-secret';

// 🔹 Ruta para iniciar sesión
router.post('/login', (req, res) => {
  const db = req.app.get('db');
  const { email, password } = req.body;

  db.query('SELECT id_usuario, id_rol, password FROM Usuarios WHERE email = ?', [email], async (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id_usuario: user.id_usuario, id_rol: user.id_rol, email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id_usuario: user.id_usuario,
        id_rol: user.id_rol,
        email
      }
    });
  });
});

// 🔹 Ruta para registrar usuarios nuevos (agregar esta parte)
router.post('/register', async (req, res) => {
  const db = req.app.get('db');
  const { nombre, email, password } = req.body;

  try {
    const [existe] = await db.promise().query(
      'SELECT id_usuario FROM Usuarios WHERE email = ?',
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      'INSERT INTO Usuarios (nombre, email, password, id_rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, 2]
    );

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

module.exports = router;

