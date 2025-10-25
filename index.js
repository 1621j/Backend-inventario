const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const authRoutes = require('./routes/auth.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const { auth, isAdmin } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Conexión a la base de datos
const connection = mysql.createConnection({
  host: '185.254.204.132',
  port: 3307,
  user: 'JeniferAdmin',
  password: 'JeniferDev10',
  database: 'growsync'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos remota (growsync)');
});

app.set('db', connection);

// 🔹 Ruta de prueba
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente con base growsync' });
});

// 🔹 Registrar rutas de autenticación
app.use('/api/auth', (req, res, next) => {
  req.db = connection; // pasamos la conexión a las rutas
  next();
}, authRoutes);

// 🔹 Registrar rutas de inventario (solo admin)
app.use('/api/inventario', (req, res, next) => {
  req.db = connection;
  next();
}, auth, isAdmin, inventarioRoutes);

// 🔹 Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
