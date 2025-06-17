const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');  // Pastikan baris ini ada!
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_harapan_gedhe_frozen'
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const sql = 'SELECT * FROM categories';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get all products (with category name)
app.get('/api/products', (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Register
// Di backend: POST /api/register
app.post('/api/register', (req, res) => {
  const {
    username, password, email,
    date_of_birth, gender, address,
    city, contact_no
  } = req.body;

  const sql = `INSERT INTO users 
    (username, password, email, date_of_birth, gender, address, city, contact_no, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    username, password, email, date_of_birth, gender, address, city, contact_no, 'customer'
  ], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal registrasi' });
    }
    res.json({ success: true, message: 'Registrasi berhasil' });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Email tidak ditemukan' });
    }

    const user = results[0];

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
});

// GET semua kategori
app.get('/api/categories', (req, res) => {
  const sql = 'SELECT * FROM categories';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST kategori baru
app.post('/api/categories', (req, res) => {
  const { name, description } = req.body;
  const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
  db.query(sql, [name, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// PUT (update) kategori
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const sql = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
  db.query(sql, [name, description, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE kategori
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM categories WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/assets')); // Pastikan folder ini ada
  },
  filename: (req, file, cb) => {
    // Ambil nama produk dari form (pastikan 'name' ada sebelum ini dipanggil)
    const productName = req.body.name || 'produk'; // fallback
    const ext = path.extname(file.originalname); // contoh: .jpg
    const cleanName = productName.replace(/\s+/g, '_').toLowerCase(); // bersihkan nama
    cb(null, `${cleanName}${ext}`);
  }
});

const upload = multer({ storage });

app.get('/api/produk', (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json(result[0]); // karena hanya satu produk yang dicari
  });
});

// POST Menambah products (dengan upload gambar)
// Di file API backend Anda (misalnya, routes/products.js atau server.js)

// POST Menambah produk baru (dengan stock dan upload gambar opsional)
app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price, description, category_id, stock } = req.body;

  // Validasi dasar
  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Nama produk, harga, dan kategori wajib diisi.' });
  }

  // Validasi dan parsing nilai
  const priceValue = parseFloat(price);
  const categoryIdValue = parseInt(category_id, 10);
  let stockValue = parseInt(stock, 10);

  if (isNaN(priceValue) || priceValue < 0) {
    return res.status(400).json({ message: 'Harga tidak valid.' });
  }

  if (isNaN(categoryIdValue)) {
    return res.status(400).json({ message: 'ID Kategori tidak valid.' });
  }

  if (isNaN(stockValue) || stockValue < 0) {
    stockValue = 0;
  }

  // Nama file gambar dari multer (kalau ada)
  const image_url = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO products (name, price, description, image_url, category_id, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [name, priceValue, description, image_url, categoryIdValue, stockValue], (err, result) => {
    if (err) {
      console.error("Error saat menambah produk:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Produk berhasil ditambahkan', id: result.insertId });
  });
});


app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const productId = req.params.id;
  const { name, price, description, category_id, existingImage } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Nama produk, harga, dan kategori wajib diisi.' });
  }

  const priceValue = parseFloat(price);
  const categoryIdValue = parseInt(category_id, 10);
  if (isNaN(priceValue) || priceValue < 0) {
    return res.status(400).json({ message: 'Harga tidak valid.' });
  }
  if (isNaN(categoryIdValue)) {
    return res.status(400).json({ message: 'ID Kategori tidak valid.' });
  }

  const image_url = req.file ? req.file.filename : existingImage; // Pakai upload baru atau gambar lama

  const sql = `
    UPDATE products
    SET name = ?, price = ?, description = ?, image_url = ?, category_id = ?
    WHERE id = ?
  `;
  db.query(sql, [name, priceValue, description, image_url, categoryIdValue, productId], (err, result) => {
    if (err) {
      console.error("Gagal update produk:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    res.json({ message: 'Produk berhasil diperbarui' });
  });
});


// Di backend Express.js Anda:

app.put('/api/products/:id/stock', (req, res) => { // Dihilangkan async jika tidak ada await di dalam selain db.query callback
  const { id } = req.params;
  const { stock } = req.body; 

  // Validasi input stock
  const newStock = parseInt(stock, 10); // Parse ke integer
  if (stock === undefined || isNaN(newStock) || newStock < 0) {
    return res.status(400).json({ message: 'Nilai stok tidak valid. Harus angka non-negatif.' });
  }

  const sql = 'UPDATE products SET stock = ? WHERE id = ?';
  db.query(sql, [newStock, id], (err, result) => {
    if (err) {
      console.error("Error updating stock:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan untuk update stok.' });
    }
    res.json({ message: 'Stok produk berhasil diupdate.', newStock: newStock }); // Kirim balik stok baru
  });
});

// DELETE products
app.delete('/api/products/:id', (req, res) => {
  const sql = 'DELETE FROM products WHERE id = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'products berhasil dihapus' });
  });
});

// GET semua user (tampilkan semua kolom)
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST tambah user (hanya untuk admin/seller)
app.post('/api/users', (req, res) => {
  const {
    username,
    email,
    password,
    date_of_birth,
    gender,
    address,
    city,
    contact_no,
    role
  } = req.body;

  if (!['admin', 'seller'].includes(role)) {
    return res.status(400).json({ error: 'Role tidak valid' });
  }

  const sql = `INSERT INTO users 
    (username, email, password, date_of_birth, gender, address, city, contact_no, role) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [username, email, password, date_of_birth, gender, address, city, contact_no, role],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User ditambahkan', id: result.insertId });
    }
  );
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
  const {
    username,
    email,
    password,
    date_of_birth,
    gender,
    address,
    city,
    contact_no,
    role
  } = req.body;

  const { id } = req.params;

  const sql = `UPDATE users SET 
    username = ?,
    email = ?,
    password = ?,
    date_of_birth = ?,
    gender = ?,
    address = ?,
    city = ?,
    contact_no = ?,
    role = ?
    WHERE id = ?`;

  db.query(
    sql,
    [username, email, password, date_of_birth, gender, address, city, contact_no, role, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User diperbarui', id });
    }
  );
});

// DELETE user (kecuali username = 'admin')
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;

  const checkSql = 'SELECT username FROM users WHERE id = ?';
  db.query(checkSql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });

    const username = results[0].username;
    if (username.toLowerCase() === 'admin') {
      return res.status(403).json({ error: 'User dengan nama "admin" tidak boleh dihapus' });
    }

    const deleteSql = 'DELETE FROM users WHERE id = ?';
    db.query(deleteSql, [userId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User berhasil dihapus' });
    });
  });
});

// Guest book entries
// GET semua entri guestbook
app.get('/api/guestbook', (req, res) => {
  db.query('SELECT * FROM guestbook ORDER BY created_at DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST entri baru
app.post('/api/guestbook', (req, res) => {
  const { name, message } = req.body;
  const sql = 'INSERT INTO guestbook (name, message) VALUES (?, ?)';
  db.query(sql, [name, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Entri ditambahkan' });
  });
});

// DELETE entri guest book
app.delete('/api/guestbook/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM guestbook WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Entri berhasil dihapus.' });
  });
});

// GET cart items for user
app.get('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = `
  SELECT
  cart.id, products.name, products.price, products.image_url,
  products.category_id, cart.quantity,
  categories.name AS category_name 
FROM cart 
JOIN products ON cart.product_id = products.id
JOIN categories ON products.category_id = categories.id 
WHERE cart.user_id = ? AND cart.is_checked_out = 0;
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result); // Mengirimkan data dalam bentuk array JSON
  });
});

// Post Cart
app.post('/api/cart', (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  // Pastikan data yang diperlukan ada
  if (!user_id || !product_id || !quantity) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  // Cek apakah produk sudah ada dalam keranjang
  const sqlCheck = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND is_checked_out = 0';
  db.query(sqlCheck, [user_id, product_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: 'Database error' });
    }

    if (result.length > 0) {
      // Jika produk sudah ada, update quantity
      const sqlUpdate = 'UPDATE cart SET quantity = quantity + ? WHERE id = ? AND is_checked_out = 0';
      db.query(sqlUpdate, [quantity, result[0].id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ error: 'Failed to update cart' });
        }
        res.status(200).send({ message: 'Quantity updated successfully' });
      });
    } else {
      // Jika produk belum ada, masukkan produk baru ke keranjang
      const sqlInsert = 'INSERT INTO cart (user_id, product_id, quantity, is_checked_out) VALUES (?, ?, ?, 0)';
      db.query(sqlInsert, [user_id, product_id, quantity], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ error: 'Failed to add product to cart' });
        }
        res.status(200).send({ message: 'Product added to cart successfully' });
      });
    }
  });
});

// UPDATE quantity
app.put('/api/cart/:id', (req, res) => {
  const { quantity } = req.body;
  db.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// DELETE item
app.delete('/api/cart/:id', (req, res) => {
  db.query('DELETE FROM cart WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// CHECKOUT
app.post('/api/checkout', (req, res) => {
  const { user_id, payment_method } = req.body;

  const getCart = `SELECT c.*, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ? AND c.is_checked_out = 0`;
  db.query(getCart, [user_id], (err, cart) => {
    if (err) return res.status(500).send(err);
    if (cart.length === 0) return res.status(400).send('Cart kosong');

    const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const insertOrder = 'INSERT INTO orders (user_id, total_price, status, payment_method) VALUES (?, ?, "packaging", ?)';
    
    db.query(insertOrder, [user_id, total, payment_method], (err, result) => {
      if (err) return res.status(500).send(err);
      const orderId = result.insertId;

      const items = cart.map(item => [orderId, item.product_id, item.quantity, item.price]);
      const insertItems = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';

      db.query(insertItems, [items], (err) => {
        if (err) return res.status(500).send(err);

        // Update cart items to mark as checked out
        const updateCart = 'UPDATE cart SET is_checked_out = 1 WHERE user_id = ? AND is_checked_out = 0';
        db.query(updateCart, [user_id], (err) => {
          if (err) return res.status(500).send(err);
          res.sendStatus(200);
        });
      });
    });
  });
});

//order customer
app.get('/api/orders/user/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = 'SELECT * FROM orders WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.get('/api/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT o.id AS order_id, o.status, o.total_price, o.payment_method, o.created_at,
           oi.product_id, p.name, p.image_url, oi.quantity, oi.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    
    // Gabungkan order_items ke dalam setiap order
    const orders = [];
    const orderMap = {};

    results.forEach(row => {
      if (!orderMap[row.order_id]) {
        orderMap[row.order_id] = {
          order_id: row.order_id,
          status: row.status,
          total_price: row.total_price,
          payment_method: row.payment_method,
          created_at: row.created_at,
          items: []
        };
        orders.push(orderMap[row.order_id]);
      }
      orderMap[row.order_id].items.push({
        product_id: row.product_id,
        name: row.name,
        image_url: row.image_url,
        quantity: row.quantity,
        price: row.price
      });
    });

    res.json(orders);
  });
});

app.put('/api/orders/:orderId/complete', (req, res) => {
  const { orderId } = req.params;
  const sql = 'UPDATE orders SET status = "completed" WHERE id = ?';
  db.query(sql, [orderId], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.put('/api/orders/:orderId/cancel', (req, res) => {
  const { orderId } = req.params;

  const checkSql = 'SELECT status FROM orders WHERE id = ?';
  db.query(checkSql, [orderId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('Order tidak ditemukan');

    const currentStatus = results[0].status;
    if (currentStatus === 'shipped' || currentStatus === 'completed') {
      return res.status(400).send('Pesanan tidak dapat dibatalkan pada status ini');
    }

    const updateSql = 'UPDATE orders SET status = "cancelled" WHERE id = ?';
    db.query(updateSql, [orderId], (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    });
  });
});

//update status order admin
app.patch('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, orderId], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.put('/api/orders/:id/ship', (req, res) => {
  const orderId = req.params.id;
  const updateStatus = 'UPDATE orders SET status = "shipped" WHERE id = ?';
  db.query(updateStatus, [orderId], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.get('/api/ordersAdmin', (req, res) => {
  const query = `
  SELECT 
  oi.*, 
  p.name AS product_name,  -- Alias agar jelas
  p.price AS product_price, -- Alias agar jelas
  p.image_url AS product_image_url, -- Alias agar jelas
  p.stock AS product_current_stock -- <-- TAMBAHKAN INI
  -- c.name AS category_name (jika ada kategori)
FROM order_items oi
JOIN products p ON oi.product_id = p.id
-- LEFT JOIN categories c ON p.category_id = c.id
WHERE oi.order_id = ?;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);

    // Struktur hasil ke dalam array per order
    const orders = {};
    results.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          id: row.order_id,
          user: {
            id: row.user_id,
            username: row.username
          },
          total_price: row.total_price,
          status: row.status,
          payment_method: row.payment_method,
          created_at: row.created_at,
          items: []
        };
      }

      orders[row.order_id].items.push({
        product_id: row.product_id,
        quantity: row.quantity,
        price: row.price,
        product: {
          name: row.product_name,
          image_url: row.image_url
        }
      });
    });

    res.json(Object.values(orders));
  });
});

// Diasumsikan Anda sudah memiliki setup Express 'app' dan koneksi database 'db'
// serta middleware 'upload' untuk file.

// GET semua produk supplier (dengan nama supplier)
app.get('/api/supplier-products', (req, res) => {
  const sql = `
    SELECT sp.*, s.supplier_name
    FROM supplier_products sp
    LEFT JOIN suppliers s ON sp.supplier_id = s.supplier_id
    ORDER BY sp.supplier_product_id DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// GET semua suppliers
app.get('/api/suppliers', (req, res) => { // Mengubah path ke /api/suppliers untuk jamak dan konsistensi
  const sql = `SELECT * FROM suppliers`; // Query untuk mengambil semua supplier
  db.query(sql, (err, result) => {       // Tidak perlu parameter [id] di sini
    if (err) return res.status(500).json({ error: err.message });
    res.json(result); // Mengirim semua hasil sebagai array
  });
});

// GET produk supplier berdasarkan ID (dengan nama supplier)
app.get('/api/supplier-products/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT sp.*, s.supplier_name
    FROM supplier_products sp
    LEFT JOIN suppliers s ON sp.supplier_id = s.supplier_id
    WHERE sp.supplier_product_id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(404).json({ message: 'Produk supplier tidak ditemukan' });
    }
    res.json(result[0]);
  });
});

// POST Menambah produk supplier (TANPA gambar)
app.post('/api/supplier-products', (req, res) => { // Hapus upload.single('image')
  const {
    supplier_id,
    product_name,
    product_description,
    supplier_stock,
    unit_price_from_supplier,
    availability_status,
    estimated_ready_date, // Bisa NULL
    notes // Bisa NULL
  } = req.body;

  // image_url dihapus dari sini

  // Pastikan supplier_id, product_name, supplier_stock, availability_status tidak kosong
  if (!supplier_id || !product_name || supplier_stock === undefined || !availability_status) {
    return res.status(400).json({ message: 'Field supplier_id, product_name, supplier_stock, dan availability_status wajib diisi.' });
  }

  const sql = `
    INSERT INTO supplier_products
    (supplier_id, product_name, product_description, supplier_stock, unit_price_from_supplier, availability_status, estimated_ready_date, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
  `; // image_url dan placeholder '?' terakhir dihapus
  const values = [
    supplier_id,
    product_name,
    product_description || null,
    supplier_stock,
    unit_price_from_supplier || null,
    availability_status,
    estimated_ready_date || null,
    notes || null
    // image_url dihapus dari sini
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Produk supplier berhasil ditambahkan', id: result.insertId });
  });
});

// PUT Update produk supplier (TANPA gambar)
app.put('/api/supplier-products/:id', (req, res) => { // Hapus upload.single('image')
  const { id } = req.params;
  const {
    supplier_id,
    product_name,
    product_description,
    supplier_stock,
    unit_price_from_supplier,
    availability_status,
    estimated_ready_date, // Bisa NULL
    notes // Bisa NULL
    // existingImage dihapus karena tidak ada gambar
  } = req.body;

  // image_url dihapus dari sini
  
  if (!supplier_id || !product_name || supplier_stock === undefined || !availability_status) {
    return res.status(400).json({ message: 'Field supplier_id, product_name, supplier_stock, dan availability_status wajib diisi.' });
  }

  const sql = `
    UPDATE supplier_products SET
    supplier_id = ?,
    product_name = ?,
    product_description = ?,
    supplier_stock = ?,
    unit_price_from_supplier = ?,
    availability_status = ?,
    estimated_ready_date = ?,
    notes = ? 
    WHERE supplier_product_id = ?
  `; // image_url = ? dihapus
  const values = [
    supplier_id,
    product_name,
    product_description || null,
    supplier_stock,
    unit_price_from_supplier || null,
    availability_status,
    estimated_ready_date || null,
    notes || null,
    // image_url dihapus dari sini
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Produk supplier tidak ditemukan untuk diupdate' });
    }
    res.json({ message: 'Produk supplier berhasil diupdate' });
  });
});

// DELETE produk supplier (tidak ada perubahan di sini terkait gambar)
app.delete('/api/supplier-products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM supplier_products WHERE supplier_product_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Produk supplier tidak ditemukan untuk dihapus' });
    }
    res.json({ message: 'Produk supplier berhasil dihapus' });
  });
});

// POST untuk membuat pesanan resupply baru
app.post('/api/resupply-orders', async (req, res) => {
  const { requested_by_user_id, items, notes } = req.body;

  if (!requested_by_user_id || !items || items.length === 0) {
    return res.status(400).json({ message: 'User ID dan item resupply wajib diisi.' });
  }

  // Mulai transaksi database karena ada multiple insert
  db.beginTransaction(async (err) => {
    if (err) {
      console.error("Error memulai transaksi:", err);
      return res.status(500).json({ error: "Gagal memulai transaksi database." });
    }

    try {
      let totalEstimatedCost = 0;
      for (const item of items) {
        totalEstimatedCost += item.price_at_order * item.quantity_ordered;
      }

      // 1. Insert ke tabel resupply_orders
      const orderSql = `
        INSERT INTO resupply_orders (requested_by_user_id, total_estimated_cost, notes, status)
        VALUES (?, ?, ?, ?)
      `;
      const orderValues = [requested_by_user_id, totalEstimatedCost, notes || null, 'pending_approval'];
      
      const [orderResult] = await db.promise().query(orderSql, orderValues);
      const newResupplyOrderId = orderResult.insertId;

      // 2. Insert ke tabel resupply_order_items
      // const itemPromises = items.map(item => {
        
      //   // Kita perlu mengambil supplier_id dari supplier_products
      //   // Ini bisa dilakukan dengan query tambahan atau jika supplier_id sudah ada di item
      //   // Untuk contoh ini, asumsikan kita query untuk mendapatkan supplier_id
      //   // Atau lebih baik, frontend mengirim supplier_id per item jika sudah tahu
        
      //   // Versi sederhana: Asumsikan frontend tidak mengirim supplier_id per item, kita ambil dari DB
      //   // atau modifikasi agar frontend mengirim supplier_id yang didapat dari GET /api/supplier-products
      //   return new Promise(async (resolve, reject) => {
      //       try {
      //           const [productDetails] = await db.promise().query(
      //               'SELECT supplier_id FROM supplier_products WHERE supplier_product_id = ?',
      //               [item.supplier_product_id]
      //           );
      //           if (productDetails.length === 0) {
      //               return reject(new Error(`Produk supplier dengan ID ${item.supplier_product_id} tidak ditemukan.`));
      //           }
      //           const supplierId = productDetails[0].supplier_id;

      //           const itemSql = `
      //               INSERT INTO resupply_order_items 
      //               (resupply_order_id, supplier_product_id, supplier_id, quantity_ordered, price_at_order, product_name_at_order)
      //               VALUES (?, ?, ?, ?, ?, ?)                
      //           `;
      //           const itemValues = [
      //             newResupplyOrderId,
      //             item.supplier_product_id,
      //             item.supplier_id, // Menggunakan supplier_id yang dikirim dari frontend
      //             item.quantity_ordered,
      //             item.price_at_order,
      //             item.product_name_at_order // Menggunakan product_name_at_order yang dikirim dari frontend
      //         ];
      //         await db.promise().query(itemSql, itemValues);
      //           resolve();
      //       } catch (itemErr) {
      //           reject(itemErr);
      //       }
      //   });
      // });

      // await Promise.all(itemPromises);

      const itemPromises = items.map(item => {
        // Frontend sekarang mengirimkan product_name_at_order dan supplier_id
        if (!item.product_name_at_order || !item.supplier_id) {
            // Tambahkan error handling jika field penting ini tidak ada dari frontend
            return Promise.reject(new Error(`Item ${item.supplier_product_id} kekurangan product_name_at_order atau supplier_id.`));
        }

        const itemSql = `
            INSERT INTO resupply_order_items 
            (resupply_order_id, supplier_product_id, supplier_id, product_name_at_order, quantity_ordered, price_at_order)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const itemValues = [
            newResupplyOrderId,
            item.supplier_product_id,
            item.supplier_id,         // Langsung dari item yang dikirim frontend
            item.product_name_at_order, // Langsung dari item yang dikirim frontend
            item.quantity_ordered,
            item.price_at_order
        ];
        return db.promise().query(itemSql, itemValues);
      });

      await Promise.all(itemPromises);


      // Jika semua berhasil, commit transaksi
      db.commit((commitErr) => {
        if (commitErr) {
          console.error("Error saat commit:", commitErr);
          return db.rollback(() => {
            res.status(500).json({ error: "Gagal menyimpan pesanan resupply (commit error)." });
          });
        }
        res.status(201).json({ message: 'Pesanan resupply berhasil dibuat', resupply_order_id: newResupplyOrderId });
      });

    } catch (error) {
      // Jika ada error, rollback transaksi
      db.rollback(() => {
        console.error("Error saat proses resupply order:", error);
        res.status(500).json({ error: `Gagal memproses pesanan resupply: ${error.message}` });
      });
    }
  });
});

// Diasumsikan 'app' adalah instance Express dan 'db' adalah koneksi database Anda

// GET semua pesanan resupply beserta item dan detail terkait
app.get('/api/resupply-orders', async (req, res) => {
  try {
    const ordersSql = `
      SELECT 
        ro.resupply_order_id, 
        ro.order_date, 
        ro.status, 
        ro.total_estimated_cost, 
        ro.notes AS order_notes,
        ro.requested_by_user_id,
        u.username AS requested_by_username 
      FROM resupply_orders ro
      LEFT JOIN users u ON ro.requested_by_user_id = u.id
      ORDER BY ro.order_date DESC;
    `;
    const [orders] = await db.promise().query(ordersSql);

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderItemsPromises = orders.map(order => {
      const itemsSql = `
        SELECT 
          roi.resupply_order_item_id, 
          roi.supplier_product_id,
          roi.product_name_at_order,
          roi.quantity_ordered,
          roi.price_at_order,
          roi.quantity_received,
          roi.item_status,
          s.supplier_name
        FROM resupply_order_items roi
        LEFT JOIN suppliers s ON roi.supplier_id = s.supplier_id
        WHERE roi.resupply_order_id = ?;
      `;
      return db.promise().query(itemsSql, [order.resupply_order_id]).then(([items]) => ({
        ...order,
        items: items
      }));
    });

    const ordersWithItems = await Promise.all(orderItemsPromises);
    res.json(ordersWithItems);

  } catch (err) {
    console.error('Error fetching resupply orders:', err);
    res.status(500).json({ error: 'Gagal mengambil pesanan resupply: ' + err.message });
  }
});

// PUT untuk mengubah status pesanan resupply
// PUT untuk mengubah status pesanan resupply
app.put('/api/resupply-orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { newStatus, receivedItems } = req.body; 

  if (!newStatus) {
    return res.status(400).json({ message: 'Status baru wajib diisi.' });
  }

  const validStatuses = ['pending_approval', 'approved', 'ordered_to_supplier', 'partially_shipped_by_supplier', 'fully_shipped_by_supplier', 'partially_received', 'fully_received', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ message: 'Status baru tidak valid.' });
  }

  db.beginTransaction(async (transactionErr) => {
    if (transactionErr) {
        console.error("Gagal memulai transaksi:", transactionErr);
        return res.status(500).json({ error: 'Gagal memulai transaksi.' });
    }

    try {
      let finalOrderStatus = newStatus; // Status akhir yang akan dikembalikan dan disimpan

      // 1. Logika khusus jika frontend secara eksplisit meminta 'fully_received'
      // Ini dipicu oleh tombol "Tandai Semua Diterima Penuh" di frontend
      if (newStatus === 'fully_received') {
        if (!receivedItems || !Array.isArray(receivedItems)) {
            // Jika frontend seharusnya mengirim item untuk 'fully_received' tapi tidak ada, ini bisa jadi error
            // Atau, kita bisa asumsikan semua item diterima penuh jika 'receivedItems' tidak ada/kosong.
            // Namun, frontend Anda MENGIRIM 'receivedItems' yang sudah dihitung.
            db.rollback(() => res.status(400).json({ message: 'Data item yang diterima diperlukan untuk status fully_received.' }));
            return;
        }

        for (const item of receivedItems) {
          // Frontend mengirim 'quantity_newly_received' sebagai sisa agar penuh.
          // Jadi (quantity_received_lama + quantity_newly_received) akan = quantity_ordered.
          const updateItemSql = `
            UPDATE resupply_order_items 
            SET 
              quantity_received = quantity_received + ?, 
              item_status = 'fully_received', -- Langsung set item_status
              last_received_date = IF(? > 0, CURDATE(), last_received_date), -- Update jika ada penambahan
              updated_at = CURRENT_TIMESTAMP
            WHERE resupply_order_item_id = ? AND resupply_order_id = ?;
          `;
          await db.promise().query(updateItemSql, [
            item.quantity_newly_received,
            item.quantity_newly_received, // Untuk kondisi IF pada last_received_date
            item.resupply_order_item_id,
            orderId
          ]);
        }
        // Status order utama sudah pasti 'fully_received' karena itu intensi awalnya
        finalOrderStatus = 'fully_received';

      } else if (newStatus === 'partially_received' && receivedItems && Array.isArray(receivedItems) && receivedItems.length > 0) {
        // Logika untuk penerimaan parsial (jika ada tombol terpisah untuk ini di masa depan)
        for (const item of receivedItems) {
          if (item.quantity_newly_received > 0) {
            const updateItemSql = `
              UPDATE resupply_order_items 
              SET 
                quantity_received = quantity_received + ?, 
                item_status = IF((quantity_received + ?) >= quantity_ordered, 'fully_received', 'partially_received'),
                last_received_date = CURDATE(),
                updated_at = CURRENT_TIMESTAMP
              WHERE resupply_order_item_id = ? AND resupply_order_id = ?;
            `;
            await db.promise().query(updateItemSql, [
              item.quantity_newly_received,
              item.quantity_newly_received,
              item.resupply_order_item_id,
              orderId
            ]);
          }
        }
        // Setelah update item parsial, cek apakah semua item jadi fully_received
        const [itemsStatusCheck] = await db.promise().query(
          'SELECT COUNT(*) as total_items, SUM(IF(item_status = "fully_received", 1, 0)) as num_fully_received FROM resupply_order_items WHERE resupply_order_id = ?',
          [orderId]
        );
        if (itemsStatusCheck.length > 0) {
          const { total_items, num_fully_received } = itemsStatusCheck[0];
          if (total_items > 0 && total_items === num_fully_received) {
            finalOrderStatus = 'fully_received';
          } else {
            finalOrderStatus = 'partially_received'; // Tetap atau menjadi partially_received
          }
        }
      }
      // Untuk status lain seperti 'approved', 'ordered_to_supplier', 'cancelled', 'fully_shipped_by_supplier',
      // kita hanya mengupdate status order utama, karena 'receivedItems' tidak relevan.
      // 'finalOrderStatus' sudah diinisialisasi dengan 'newStatus' dari request.

      // 2. Update status utama order dengan finalOrderStatus yang sudah ditentukan
      const updateOrderStatusSql = 'UPDATE resupply_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE resupply_order_id = ?';
      const [orderUpdateResult] = await db.promise().query(updateOrderStatusSql, [finalOrderStatus, orderId]);

      if (orderUpdateResult.affectedRows === 0) {
        // Seharusnya tidak terjadi jika orderId valid, tapi sebagai pengaman
        throw new Error('Pesanan resupply tidak ditemukan atau gagal diupdate.');
      }

      db.commit(commitErr => {
        if (commitErr) {
          console.error("Gagal commit:", commitErr);
          // Rollback sudah dipanggil di catch block utama jika ada error query sebelumnya
          // Jika commit gagal, coba rollback lagi
          return db.rollback(() => res.status(500).json({ error: 'Gagal commit transaksi.' }));
        }
        res.json({ message: `Status pesanan resupply berhasil diupdate menjadi ${finalOrderStatus.replace(/_/g, ' ')}` });
      });

    } catch (err) {
      db.rollback(() => {
        console.error("Error dalam transaksi:", err);
        res.status(500).json({ error: 'Gagal update status pesanan resupply: ' + err.message });
      });
    }
  });
});

// Jangan lupa untuk mengekspor 'app' atau mendaftarkan rute ini jika file ini terpisah
// module.exports = app; // Contoh jika ini adalah file rute terpisah

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
