import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Nama komponen bisa diubah jika ini khusus untuk produk supplier, misal: SupplierProduk
const ProdukSupplier = () => { 
  const [supplierProductList, setSupplierProductList] = useState([]); // Ganti nama state

  // Fungsi untuk mengambil data produk supplier
  const fetchSupplierProducts = async () => {
    try {
      // 1. Ubah endpoint API
      const res = await axios.get('http://localhost:3001/api/supplier-products'); 
      setSupplierProductList(res.data);
    } catch (err) {
      console.error('Gagal mengambil produk supplier:', err);
    }
  };

  // Fungsi untuk menghapus produk supplier
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk supplier ini?')) return;
    try {
      // Sesuaikan endpoint delete jika berbeda, dan gunakan ID yang tepat
      await axios.delete(`http://localhost:3001/api/supplier-products/${id}`); 
      fetchSupplierProducts(); // Panggil fungsi yang sudah di-rename
    } catch (err) {
      console.error('Gagal menghapus produk supplier:', err);
    }
  };

  useEffect(() => {
    fetchSupplierProducts(); // Panggil fungsi yang sudah di-rename
  }, []);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
            <button 
            className="btn btn-link p-0 me-3" 
            onClick={() => window.location.href = '/supplier'}> {/* Asumsi ini kembali ke halaman admin utama */}
            <i className="bi bi-arrow-left fs-4"></i>
            </button>
            {/* Judul bisa disesuaikan */}
            <h2 className="mb-0">Kelola Produk Supplier</h2> 
        </div>
        {/* Link untuk tambah produk supplier bisa disesuaikan pathnya jika berbeda */}
        <Link to="/supplier/addsupplierproduct/" className="btn btn-primary">
            Tambah Produk Supplier 
        </Link>
        </div>
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          {/* 3. Sesuaikan kolom tabel */}
          <tr>
            <th>No</th>
            <th>Nama Produk (Supplier)</th>
            <th>Supplier</th>
            <th>Deskripsi</th>
            <th>Stok Supplier</th>
            <th>Harga Satuan (Rp)</th>
            <th>Status Ketersediaan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(supplierProductList) && supplierProductList.length > 0 ? (
            supplierProductList.map((item, index) => (
              // Gunakan supplier_product_id sebagai key dan untuk aksi
              <tr key={item.supplier_product_id}> 
                <td>{index + 1}</td>
                <td>{item.product_name}</td>
                {/* Asumsi backend mengirim 'supplier_name' hasil join */}
                <td>{item.supplier_name || '-'}</td> 
                <td>{item.product_description || '-'}</td>
                <td>{item.supplier_stock}</td>
                <td>{item.unit_price_from_supplier ? parseFloat(item.unit_price_from_supplier).toLocaleString() : '-'}</td>
                <td>{item.availability_status}</td>
                <td>
                  {/* Link edit disesuaikan path dan ID */}
                  <Link 
                    to={`/supplier/editsupplierproduct/${item.supplier_product_id}`} 
                    className="btn btn-sm btn-warning me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item.supplier_product_id)}
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
                Tidak ada produk supplier.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Jika nama komponen diubah, sesuaikan juga export default
export default ProdukSupplier;