// src/pages/admin/Kategori.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function Kategori() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/categories', newCategory);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        await axios.delete(`http://localhost:3001/api/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (category) => {
    setEditing(category);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/api/categories/${editing.id}`, editing);
      setEditing(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center mb-4">
        <button 
        className="btn btn-link p-0 me-3" 
        onClick={() => window.location.href = '/admin'}>
        <i className="bi bi-arrow-left fs-4"></i>
        </button>
        <h2>Kelola Kategori</h2>
      </div>
      <form onSubmit={handleAddCategory} className="mb-4">
        <div className="row g-2">
          <div className="col-md-4">
            <input type="text" name="name" className="form-control" placeholder="Nama Kategori" value={newCategory.name} onChange={handleInputChange} required />
          </div>
          <div className="col-md-6">
            <input type="text" name="description" className="form-control" placeholder="Deskripsi" value={newCategory.description} onChange={handleInputChange} required />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" type="submit">Tambah</button>
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Deskripsi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={cat.id}>
              <td>{index+1}</td>
              <td>
                {editing?.id === cat.id ? (
                  <input
                    className="form-control"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td>
                {editing?.id === cat.id ? (
                  <input
                    className="form-control"
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                ) : (
                  cat.description
                )}
              </td>
              <td>
                {editing?.id === cat.id ? (
                  <>
                    <button className="btn btn-sm btn-primary me-2" onClick={handleUpdate}>Simpan</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditing(null)}>Batal</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(cat)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id)}>Hapus</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Kategori;
