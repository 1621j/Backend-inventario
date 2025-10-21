const express = require('express');
const router = express.Router();

// CONSULTAR INVENTARIO CON JOIN
router.get('/', (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT i.id_inventario, i.id_producto, p.nombre, p.precio, i.cantidad, i.stock_minimo
    FROM Inventario i
    JOIN Productos p ON i.id_producto = p.id_producto
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener inventario' });
    res.json(results);
  });
});

// CONSULTAR PRODUCTOS
router.get('/productos', (req, res) => {
  const db = req.app.get('db');
  db.query('SELECT id_producto, nombre, precio FROM Productos', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(results);
  });
});

// INSERTAR CON VERIFICACIÓN DE DUPLICADOS
router.post('/', (req, res) => {
  const db = req.app.get('db');
  const { id_producto, cantidad, stock_minimo } = req.body;

  // Verificar si ya existe el producto en Inventario
  const checkSql = 'SELECT * FROM Inventario WHERE id_producto = ?';
  db.query(checkSql, [id_producto], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al verificar duplicados' });

    if (results.length > 0) {
      return res.status(400).json({ error: 'Este producto ya está en inventario.' });
    }

    // Insertar si no existe
    const insertSql = 'INSERT INTO Inventario (id_producto, cantidad, stock_minimo) VALUES (?, ?, ?)';
    db.query(insertSql, [id_producto, cantidad, stock_minimo], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al insertar' });
      res.json({ message: 'Producto agregado correctamente.' });
    });
  });
});

// ACTUALIZAR
router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id_producto, cantidad, stock_minimo } = req.body;
  const { id } = req.params;

  const updateSql = 'UPDATE Inventario SET id_producto=?, cantidad=?, stock_minimo=? WHERE id_inventario=?';
  db.query(updateSql, [id_producto, cantidad, stock_minimo, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar' });
    res.json({ message: 'Inventario actualizado correctamente.' });
  });
});

// ELIMINAR
router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  db.query('DELETE FROM Inventario WHERE id_inventario = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar' });
    res.json({ message: 'Elemento eliminado correctamente.' });
  });
});

module.exports = router;

