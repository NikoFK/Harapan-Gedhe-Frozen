import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Tambahkan useNavigate

const Produk = () => {
  const [produkList, setProdukList] = useState([]);
  const navigate = useNavigate(); // Untuk tombol kembali

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/products');
      // Pastikan setiap produk memiliki properti stock
      setProdukList(res.data.map(p => ({ ...p, stock: p.stock !== undefined ? p.stock : 0 })));
    } catch (err) {
      console.error('Gagal mengambil produk:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
    }
  };

  // Fungsi baru untuk update stok
  const handleUpdateStock = async (productId, currentStock, change) => {
    let newStock = currentStock + change;
    if (newStock < 0) {
      newStock = 0; // Stok tidak boleh negatif
    }

    try {
      await axios.put(`http://localhost:3001/api/products/${productId}/stock`, { stock: newStock });
      // Optimistic update (opsional, untuk respons UI lebih cepat)
      // setProdukList(prevList => 
      //   prevList.map(p => p.id === productId ? { ...p, stock: newStock } : p)
      // );
      fetchProducts(); // Atau fetch ulang untuk data yang pasti konsisten
    } catch (err) {
      console.error('Gagal mengupdate stok:', err.response?.data?.message || err.message);
      alert(`Gagal mengupdate stok: ${err.response?.data?.message || err.message}`);
    }
  };
  
  // Helper untuk path gambar (sesuaikan jika path Anda berbeda)
  const getImagePath = (imageName) => {
    if (!imageName) return "/placeholder-image.png"; // Gambar placeholder jika tidak ada
    // Asumsi backend menyajikan gambar dari folder 'uploads' di root server API
    // atau dari folder public jika frontend dan backend satu origin.
    // Sesuaikan path ini! Jika gambar di 'public/uploads', pathnya bisa jadi '/uploads/namafile.jpg'
    return `/assets/${imageName}`; 
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
            <button 
            className="btn btn-link p-0 me-3" 
            // Menggunakan navigate untuk konsistensi SPA
            onClick={() => navigate('/admin')}> 
            <i className="bi bi-arrow-left fs-4"></i>
            </button>
            <h2 className="mb-0">Kelola Produk</h2>
        </div>
        <Link to="/admin/produk/AddProduct" className="btn btn-primary">
            Tambah Produk
        </Link>
        </div>
      <table className="table table-bordered">
      <thead className="table-light">
        <tr>
          <th>No</th>
          <th>Gambar</th>
          <th>Kategori</th>
          <th>Nama</th>
          <th>Harga (Rp)</th>
          <th style={{minWidth: '150px'}}>Stok</th>
          <th>Deskripsi</th>
          <th style={{minWidth: '130px'}}>Aksi</th>
        </tr>
      </thead>
        <tbody>
          {Array.isArray(produkList) && produkList.length > 0 ? (
            produkList.map((produk, index) => (
              <tr key={produk.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={getImagePath(produk.image_url)} // Menggunakan helper getImagePath
                    alt={produk.name}
                    style={{ width: '80px', height: 'auto', maxHeight: '80px', objectFit: 'contain' }}
                  />
                </td>
                <td>{produk.category_name || '-'}</td>
                <td>{produk.name}</td>
                <td>{parseFloat(produk.price).toLocaleString('id-ID')}</td>
                {/* Sel Stok dengan Tombol +/- */}
                <td>
                  <div className="d-flex align-items-center justify-content-center">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleUpdateStock(produk.id, produk.stock, -1)}
                      disabled={produk.stock <= 0}
                    >
                      -
                    </button>
                    <span className="mx-2" style={{minWidth: '30px', textAlign: 'center'}}>
                        {produk.stock}
                    </span>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleUpdateStock(produk.id, produk.stock, 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={produk.description}>
                  {produk.description}
                </td>
                <td>
                  <Link to={`/admin/produk/EditProduct/${produk.id}`} className="btn btn-sm btn-warning me-2 mb-1">
                    Edit
                  </Link>
                  <button
                    className="btn btn-sm btn-danger mb-1"
                    onClick={() => handleDelete(produk.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              {/* Sesuaikan colSpan dengan jumlah kolom baru */}
              <td colSpan="8" className="text-center"> 
                Tidak ada produk.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Produk;