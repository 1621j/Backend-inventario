const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const inventarioRoutes = require('./routes/inventario.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'viverodb'
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos.');
  }
});

app.set('db', db);

// Rutas
app.use('/api/inventario', (req, res, next) => {
  req.db = db;
  next();
}, inventarioRoutes);

// Test
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

