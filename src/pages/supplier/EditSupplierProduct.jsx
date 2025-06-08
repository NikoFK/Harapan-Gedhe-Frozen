import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditSupplierProduct = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    supplier_id: '',
    product_name: '',
    product_description: '',
    supplier_stock: '', // Diubah jadi string kosong agar konsisten dengan input number
    unit_price_from_supplier: '',
    availability_status: 'ready',
    estimated_ready_date: '',
    notes: '',
    // 'image: null' dihapus
  });
  const [suppliersList, setSuppliersList] = useState([]);
  // 'existingImage' dan 'imagePreview' dihapus
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supplierProductRes, suppliersRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/supplier-products/${id}`),
          axios.get('http://localhost:3001/api/suppliers'),
        ]);

        const product = supplierProductRes.data;
        setForm({
          supplier_id: product.supplier_id || '',
          product_name: product.product_name || '',
          product_description: product.product_description || '',
          supplier_stock: product.supplier_stock === null ? '' : product.supplier_stock, // Handle null dari DB
          unit_price_from_supplier: product.unit_price_from_supplier === null ? '' : product.unit_price_from_supplier, // Handle null
          availability_status: product.availability_status || 'ready',
          estimated_ready_date: product.estimated_ready_date ? product.estimated_ready_date.split('T')[0] : '',
          notes: product.notes || '',
          // 'image: null' dihapus
        });

        // Logika 'existingImage' dan 'imagePreview' dihapus
        setSuppliersList(suppliersRes.data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target; // type dan files dihapus
    // Blok 'if (type === 'file')' dihapus
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Tidak perlu FormData jika tidak ada file
      const payload = {
        supplier_id: form.supplier_id,
        product_name: form.product_name,
        product_description: form.product_description || null,
        supplier_stock: form.supplier_stock, // Input number akan mengirim string, backend harus handle
        unit_price_from_supplier: form.unit_price_from_supplier || null,
        availability_status: form.availability_status,
        estimated_ready_date: (form.availability_status === 'pre_order' && form.estimated_ready_date) ? form.estimated_ready_date : null,
        notes: form.notes || null,
      };
      // 'image' dan 'existingImage' dihapus dari payload

      await axios.put(`http://localhost:3001/api/supplier-products/${id}`, payload); // Header Content-Type akan otomatis application/json
      navigate('/supplier/produksupplier');
    } catch (err) {
      console.error("Gagal mengupdate produk supplier:", err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || 'Gagal mengupdate produk supplier'}`);
    }
  };

  return (
    <div className="container my-4">
      <h2>Edit Produk Supplier</h2>
      <form onSubmit={handleSubmit}>
        {/* Nama Produk Supplier */}
        <div className="mb-3">
          <label className="form-label">Nama Produk (dari Supplier)</label>
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
          <label className="form-label">Supplier</label>
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
                <label className="form-label">Stok di Supplier</label>
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
                <label className="form-label">Status Ketersediaan</label>
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

        <button className="btn btn-primary" type="submit">Update Produk Supplier</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/supplier/produksupplier')}>
            Batal
        </button>
      </form>
    </div>
  );
};

export default EditSupplierProduct;