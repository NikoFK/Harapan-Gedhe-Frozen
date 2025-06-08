import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProduct = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    image: null,
    category_id: '',
  });
  const [categories, setCategories] = useState([]);
  const [existingImage, setExistingImage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/products/${id}`),
          axios.get('http://localhost:3001/api/categories'),
        ]);
        const product = productRes.data;
console.log(productRes.data);
console.log(existingImage);
        setForm({
          name: product.name,
          price: product.price,
          description: product.description,
          image: null,
          category_id: product.category_id,
        });

        setExistingImage(product.image_url);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('price', form.price);
      data.append('description', form.description);
      data.append('category_id', form.category_id);

      if (form.image) {
        data.append('image', form.image);
      } else {
        data.append('existingImage', existingImage); // untuk tetap pakai gambar lama
      }

      await axios.put(`http://localhost:3001/api/products/${id}`, data);
      navigate('/admin/produk');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container my-4">
      <h2>Edit Produk</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nama Produk</label>
          <input
            type="text"
            name="name"
            value={form.name}
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Harga</label>
          <input
            type="number"
            name="price"
            value={form.price}
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            className="form-control"
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Gambar</label>
          {existingImage && (
            <div className="mb-2">
              <img
                src={`../../../src/assets/${existingImage}`}
                alt="Produk"
                style={{ width: '100px', height: 'auto' }}
              />
            </div>
          )}
          <input
            type="file"
            name="image"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Kategori</label>
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
        <button className="btn btn-primary" type="submit">Update Produk</button>
      </form>
    </div>
  );
};

export default EditProduct;
