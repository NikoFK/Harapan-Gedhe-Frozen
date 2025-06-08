import React, { useState, useEffect } from 'react'; // Tambahkan useState dan useEffect
import { Link } from 'react-router-dom';
import axios from 'axios'; // Tambahkan axios

function Admin({ user }) {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoadingStock, setIsLoadingStock] = useState(true); // State untuk loading data stok

  useEffect(() => {
    // Fungsi untuk mengambil semua produk dan mengecek stoknya
    const checkLowStockProducts = async () => {
      // Hanya jalankan jika user adalah admin
      if (user && user.role === 'admin') {
        setIsLoadingStock(true);
        try {
          // Asumsi endpoint ini mengembalikan semua produk beserta stoknya
          const response = await axios.get('http://localhost:3001/api/products');
          if (Array.isArray(response.data)) {
            const lowStockItems = response.data.filter(
              (product) => (parseInt(product.stock, 10) || 0) < 10
            );
            setLowStockProducts(lowStockItems);
          } else {
            console.error("Data produk yang diterima bukan array:", response.data);
            setLowStockProducts([]);
          }
        } catch (error) {
          console.error('Gagal mengambil data produk untuk cek stok:', error);
          setLowStockProducts([]); // Set kosong jika error
        } finally {
          setIsLoadingStock(false);
        }
      } else {
        setIsLoadingStock(false); // Jika bukan admin, tidak perlu loading
        setLowStockProducts([]); // Pastikan kosong jika bukan admin
      }
    };

    checkLowStockProducts();
  }, [user]); // Jalankan ulang efek jika objek user berubah

  // Pengecekan akses admin tetap di awal
  if (!user || user.role !== 'admin') {
    return <div className="text-center mt-5">Akses ditolak. Anda bukan admin.</div>;
  }

  return (
    <>
      <div className="container mt-4">
        <h3 className="mb-4">Dashboard Admin</h3>

        {/* Alert untuk Stok Menipis */}
        {!isLoadingStock && lowStockProducts.length > 0 && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <h4 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>Perhatian: Stok Produk Menipis!
            </h4>
            <p>Beberapa produk memiliki stok kurang dari 10 unit dan perlu segera di-resupply:</p>
            <ul>
              {lowStockProducts.map(product => (
                <li key={product.id}>
                  <strong>{product.name}</strong> (Stok saat ini: {product.stock})
                </li>
              ))}
            </ul>
            <hr />
            <p className="mb-0">
              Silakan lakukan pemesanan ulang untuk menjaga ketersediaan produk.
              <Link to="/admin/resupplyadmin" className="btn btn-primary btn-sm ms-3">
                <i className="bi bi-truck me-1"></i> Ke Menu Resupply Barang
              </Link>
            </p>
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}
        
        {/* Opsional: Pesan jika semua stok aman */}
        {!isLoadingStock && lowStockProducts.length === 0 && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i> Semua stok produk terpantau aman (10 unit atau lebih).
          </div>
        )}

        {/* Menu Admin */}
        <div className="row g-4 mt-3"> {/* Beri sedikit margin atas jika alert muncul */}
          <div className="col-md-4 col-lg-3 mb-3"> {/* Sesuaikan kolom untuk layout yang lebih baik */}
            <Link to="/admin/kategori" className="text-decoration-none">
              <div className="card text-center p-3 p-md-4 shadow-sm h-100">
                <i className="bi bi-tags fs-1 text-primary"></i>
                <h5 className="mt-3 text-dark">Kelola Kategori</h5>
              </div>
            </Link>
          </div>

          <div className="col-md-4 col-lg-3 mb-3">
            <Link to="/admin/produk" className="text-decoration-none">
              <div className="card text-center p-3 p-md-4 shadow-sm h-100">
                <i className="bi bi-box-seam fs-1 text-primary"></i>
                <h5 className="mt-3 text-dark">Persediaan Barang</h5>
              </div>
            </Link>
          </div>

          <div className="col-md-4 col-lg-3 mb-3">
            <Link to="/admin/user" className="text-decoration-none">
              <div className="card text-center p-3 p-md-4 shadow-sm h-100">
                <i className="bi bi-people fs-1 text-primary"></i>
                <h5 className="mt-3 text-dark">Kelola User</h5>
              </div>
            </Link>
          </div>

          <div className="col-md-4 col-lg-3 mb-3">
            {/* Mengarahkan ke halaman manajemen pesanan resupply (AdminResupplyManagement) */}
            <Link to="/admin/ordersadmin" className="text-decoration-none">
              <div className="card text-center p-3 p-md-4 shadow-sm h-100">
                {/* Mengganti ikon order pelanggan dengan ikon yang lebih umum untuk manajemen order */}
                <i className="bi bi-card-checklist fs-1 text-primary"></i> 
                <h5 className="mt-3 text-dark">Manajemen Pesanan</h5>
              </div>
            </Link>
          </div>
          
          <div className="col-md-4 col-lg-3 mb-3">
            {/* Ini adalah link untuk membuat permintaan resupply baru */}
            <Link to="/admin/resupplyadmin" className="text-decoration-none"> 
              <div className="card text-center p-3 p-md-4 shadow-sm h-100">
                <i className="bi bi-truck fs-1 text-primary"></i>
                <h5 className="mt-3 text-dark">Buat Resupply</h5>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;