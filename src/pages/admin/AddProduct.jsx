import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    image: null,
    category_id: '',
    stock: '0', // Tambahkan stock, default ke string '0' agar input terkontrol
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(''); // Untuk preview gambar
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Gagal mengambil kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setForm({ ...form, image: file });
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview('');
      }
    } else if (name === "stock" || name === "price") {
        // Izinkan string kosong untuk sementara, tapi pastikan non-negatif
        const numValue = value === '' ? '' : Math.max(0, parseFloat(value));
        setForm({ ...form, [name]: numValue.toString() });
    }
    else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category_id) {
        alert("Nama Produk, Harga, dan Kategori wajib diisi.");
        return;
    }
    // Pastikan stok adalah angka atau default ke 0 jika string kosong
    const stockValue = form.stock === '' ? 0 : parseInt(form.stock, 10);
    if (isNaN(stockValue) || stockValue < 0) {
        alert("Jumlah stok tidak valid.");
        return;
    }


    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('price', form.price);
      data.append('description', form.description);
      data.append('category_id', form.category_id);
      data.append('stock', stockValue.toString()); // Kirim sebagai string, backend akan parse

      if (form.image) { // Hanya append image jika ada file yang dipilih
        data.append('image', form.image);
      }
      // Jika image tidak wajib, tidak perlu 'required' di input dan tidak perlu error jika kosong

      await axios.post('http://localhost:3001/api/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Penting jika ada file
        },
      });
      navigate('/admin/produk');
    } catch (err) {
      console.error("Gagal menambah produk:", err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || 'Gagal menambah produk'}`);
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-link p-0 me-2" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left fs-4"></i>
        </button>
        <h2>Tambah Produk</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nama Produk <span className="text-danger">*</span></label>
          <input
            type="text"
            name="name"
            value={form.name}
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <div className="row">
            <div className="col-md-6 mb-3">
                <label className="form-label">Harga <span className="text-danger">*</span></label>
                <input
                    type="number"
                    name="price"
                    value={form.price}
                    className="form-control"
                    onChange={handleChange}
                    required
                    min="0"
                    step="any" 
                />
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label">Stok Awal</label>
                <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    className="form-control"
                    onChange={handleChange}
                    min="0" // Stok tidak boleh negatif
                    placeholder="0"
                />
            </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            className="form-control"
            rows="3"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Gambar Produk</label>
          {imagePreview && (
            <div className="mb-2">
                <img src={imagePreview} alt="Preview" style={{ width: '150px', height: 'auto', display: 'block', marginBottom: '10px' }} />
            </div>
          )}
          <input
            type="file"
            name="image"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
            // 'required' bisa dihilangkan jika gambar opsional
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Kategori <span className="text-danger">*</span></label>
          <select
            name="category_id"
            value={form.category_id}
            className="form-select"
            onChange={handleChange}
            required
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-success" type="submit">Simpan Produk</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/admin/produk')}>
            Batal
        </button>
      </form>
    </div>
  );
};

export default AddProduct;