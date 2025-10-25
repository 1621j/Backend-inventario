const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const authRoutes = require('./routes/auth.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const { auth, isAdmin } = require('./middleware/auth');

const app = express();

// ✅ Configuración CORS para Render y Firebase
app.use(cors({
  origin: [
    "https://growsync-vivero.web.app",  // tu dominio del frontend
    "http://localhost:3000"             // para pruebas locales
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

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

// 🔹 Rutas de autenticación
app.use('/api/auth', (req, res, next) => {
  req.db = connection;
  next();
}, authRoutes);

// 🔹 Rutas de inventario (solo admin)
app.use('/api/inventario', (req, res, next) => {
  req.db = connection;
  next();
}, auth, isAdmin, inventarioRoutes);

// 🔹 Puerto dinámico (necesario para Render)
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
