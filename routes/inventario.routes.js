const express = require('express');
const router = express.Router();

//  CONSULTAR INVENTARIO
router.get('/', (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT id_inventario, nombre, precio, cantidad, stock_minimo
    FROM inventario
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(' Error al obtener inventario:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al obtener inventario' });
    }
    res.json(results);
  });
});

//  CONSULTAR PRODUCTOS (para llenar el selector del frontend)
router.get('/productos', (req, res) => {
  const db = req.app.get('db');
  const sql = `
    SELECT id_producto, nombre, precio
    FROM productos
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(' Error al obtener productos:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    console.log(' Productos obtenidos correctamente');
    res.json(results);
  });
});

//  INSERTAR usando id_producto (toma nombre y precio desde productos)
router.post('/', (req, res) => {
  const db = req.app.get('db');
  const { id_producto, cantidad, stock_minimo } = req.body;

  // Verificar si ya existe ese producto en el inventario
  const checkSql = 'SELECT * FROM inventario WHERE nombre = (SELECT nombre FROM productos WHERE id_producto = ?)';
  db.query(checkSql, [id_producto], (err, results) => {
    if (err) {
      console.error(' Error al verificar duplicados:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al verificar duplicados' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Este producto ya está en inventario.' });
    }

    // Insertar tomando nombre y precio desde la tabla productos
    const insertSql = `
      INSERT INTO inventario (nombre, precio, cantidad, stock_minimo)
      SELECT nombre, precio, ?, ?
      FROM productos
      WHERE id_producto = ?
    `;
    db.query(insertSql, [cantidad, stock_minimo, id_producto], (err) => {
      if (err) {
        console.error(' Error al insertar:', err.sqlMessage || err);
        return res.status(500).json({ error: 'Error al insertar' });
      }
      res.json({ message: 'Producto agregado correctamente.' });
    });
  });
});


// ✅ ACTUALIZAR
router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const { nombre, precio, cantidad, stock_minimo } = req.body;
  const { id } = req.params;

  const updateSql = `
    UPDATE inventario
    SET nombre=?, precio=?, cantidad=?, stock_minimo=?
    WHERE id_inventario=?
  `;
  db.query(updateSql, [nombre, precio, cantidad, stock_minimo, id], (err) => {
    if (err) {
      console.error(' Error al actualizar:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al actualizar' });
    }
    res.json({ message: 'Inventario actualizado correctamente.' });
  });
});

// ✅ ELIMINAR
router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  db.query('DELETE FROM inventario WHERE id_inventario = ?', [req.params.id], (err) => {
    if (err) {
      console.error(' Error al eliminar:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al eliminar' });
    }
    res.json({ message: 'Elemento eliminado correctamente.' });
  });
});

module.exports = router;


