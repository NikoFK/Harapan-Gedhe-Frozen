import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddSupplierProduct = () => {
  const [form, setForm] = useState({
    product_name: '',
    supplier_id: '',
    product_description: '',
    supplier_stock: 0,
    unit_price_from_supplier: '',
    availability_status: 'ready',
    estimated_ready_date: '',
    notes: '',
    // 'image: null' dihapus
  });
  const [suppliersList, setSuppliersList] = useState([]);
  // 'imagePreview' dihapus
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/suppliers');
        setSuppliersList(res.data);
      } catch (err) {
        console.error("Gagal mengambil daftar supplier:", err);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target; // type dan files dihapus karena tidak ada input file
    // Blok 'if (type === 'file')' dihapus
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplier_id) {
        alert("Silakan pilih supplier terlebih dahulu.");
        return;
    }
    try {
      // Tidak perlu FormData jika tidak ada file
      // Kirim objek form langsung sebagai JSON
      const payload = {
        product_name: form.product_name,
        supplier_id: form.supplier_id,
        product_description: form.product_description || null,
        supplier_stock: form.supplier_stock,
        unit_price_from_supplier: form.unit_price_from_supplier || null,
        availability_status: form.availability_status,
        estimated_ready_date: (form.availability_status === 'pre_order' && form.estimated_ready_date) ? form.estimated_ready_date : null,
        notes: form.notes || null,
      };
      // 'image' dihapus dari payload

      await axios.post('http://localhost:3001/api/supplier-products', payload); // Header Content-Type akan otomatis application/json
      navigate('/supplier/produksupplier');
    } catch (err) {
      console.error("Gagal menambah produk supplier:", err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || 'Gagal menambah produk supplier'}`);
    }
  };

  return (
    <div className="container my-4">
      <h2>Tambah Produk dari Supplier</h2>
      <form onSubmit={handleSubmit}>
        {/* Nama Produk Supplier */}
        <div className="mb-3">
          <label className="form-label">Nama Produk (dari Supplier) <span className="text-danger">*</span></label>
          <input
            type="text"
            name="product_name"
            value={form.product_name}
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        {/* Supplier Dropdown */}
        <div className="mb-3">
          <label className="form-label">Supplier <span className="text-danger">*</span></label>
          <select
            name="supplier_id"
            value={form.supplier_id}
            className="form-select"
            onChange={handleChange}
            required
          >
            <option value="">-- Pilih Supplier --</option>
            {suppliersList.map((supplier) => (
              <option key={supplier.supplier_id} value={supplier.supplier_id}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Deskripsi Produk Supplier */}
        <div className="mb-3">
          <label className="form-label">Deskripsi Produk</label>
          <textarea
            name="product_description"
            value={form.product_description}
            className="form-control"
            rows="3"
            onChange={handleChange}
          />
        </div>

        <div className="row">
            {/* Stok Supplier */}
            <div className="col-md-6 mb-3">
                <label className="form-label">Stok di Supplier <span className="text-danger">*</span></label>
                <input
                    type="number"
                    name="supplier_stock"
                    value={form.supplier_stock}
                    className="form-control"
                    onChange={handleChange}
                    required
                    min="0"
                />
            </div>

            {/* Harga Satuan dari Supplier */}
            <div className="col-md-6 mb-3">
                <label className="form-label">Harga Satuan dari Supplier (Rp)</label>
                <input
                    type="number"
                    name="unit_price_from_supplier"
                    value={form.unit_price_from_supplier}
                    className="form-control"
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                />
            </div>
        </div>
        
        <div className="row">
            {/* Status Ketersediaan */}
            <div className="col-md-6 mb-3">
                <label className="form-label">Status Ketersediaan <span className="text-danger">*</span></label>
                <select
                    name="availability_status"
                    value={form.availability_status}
                    className="form-select"
                    onChange={handleChange}
                    required
                >
                    <option value="ready">Ready</option>
                    <option value="pre_order">Pre-Order</option>
                    <option value="out_of_stock">Out of Stock</option>
                </select>
            </div>

            {/* Estimasi Tanggal Siap (jika pre_order) */}
            <div className="col-md-6 mb-3">
                <label className="form-label">Estimasi Tanggal Siap (jika Pre-Order)</label>
                <input
                    type="date"
                    name="estimated_ready_date"
                    value={form.estimated_ready_date}
                    className="form-control"
                    onChange={handleChange}
                    disabled={form.availability_status !== 'pre_order'}
                />
            </div>
        </div>

        {/* Catatan */}
        <div className="mb-3">
          <label className="form-label">Catatan Tambahan</label>
          <textarea
            name="notes"
            value={form.notes}
            className="form-control"
            rows="2"
            onChange={handleChange}
          />
        </div>

        {/* Bagian Gambar Dihapus */}

        <button className="btn btn-success" type="submit">Simpan Produk Supplier</button>
         <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/supplier/produksupplier')}>
            Batal
        </button>
      </form>
    </div>
  );
};

export default AddSupplierProduct;