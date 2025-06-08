import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const ResupplyAdmin = ({ user }) => {
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSupplierProducts();
  }, []);

  const fetchSupplierProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/supplier-products");
      const productsWithResupplyQty = res.data.map(product => ({
        ...product,
        resupply_quantity: 0, // MODIFIKASI: Default quantity untuk di-resupply sekarang 0
      }));
      setSupplierProducts(productsWithResupplyQty);
    } catch (error) {
      console.error("Gagal memuat produk supplier:", error);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    // MODIFIKASI: Pastikan newQuantity tidak negatif
    let validatedQuantity = parseInt(newQuantity, 10);
    if (isNaN(validatedQuantity) || validatedQuantity < 0) {
      validatedQuantity = 0; // Jika input tidak valid atau kurang dari 0, set ke 0
    }

    setSupplierProducts(prevProducts =>
      prevProducts.map(product =>
        product.supplier_product_id === productId
          ? { ...product, resupply_quantity: validatedQuantity }
          : product
      )
    );
  };

  const submitResupplyOrder = async () => {
    if (!user || !user.id) {
        alert('User tidak teridentifikasi. Mohon login ulang.');
        return;
    }
    

    const itemsToOrder = supplierProducts
    .filter(product => product.resupply_quantity > 0)
    .map(product => ({
      supplier_product_id: product.supplier_product_id,
      supplier_id: product.supplier_id, // PASTIKAN product.supplier_id ADA HASIL DARI FETCH AWAL
      product_name_at_order: product.product_name, // <<< TAMBAHKAN BARIS INI
      quantity_ordered: parseInt(product.resupply_quantity, 10),
      price_at_order: parseFloat(product.unit_price_from_supplier),
    }));

    if (itemsToOrder.length === 0) {
      alert('Tidak ada item yang dipilih untuk di-resupply (kuantitas harus > 0).');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/resupply-orders', {
        requested_by_user_id: user.id,
        items: itemsToOrder, // itemsToOrder sekarang sudah berisi product_name_at_order
        notes: notes,
      });
      alert('Pesanan resupply berhasil dikirim!');
      fetchSupplierProducts(); // Muat ulang data dengan quantity default (0)
      setNotes('');
    } catch (error) {
      alert(`Gagal mengirim pesanan resupply: ${error.response?.data?.message || error.message}`);
      console.error("Resupply order error:", error);
    }
  };

  const totalEstimatedCost = supplierProducts.reduce(
    (sum, item) => sum + (parseFloat(item.unit_price_from_supplier || 0) * item.resupply_quantity),
    0
  );

  return (
    <div className="container my-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Kembali
      </button>
      <h2 className="mb-4">Formulir Resupply Barang</h2>

      {supplierProducts.length === 0 ? (
        <p className="text-center">Memuat produk supplier atau tidak ada produk supplier yang tersedia.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>No</th>
              <th style={{ width: '25%' }}>Nama Produk (Supplier)</th>
              <th style={{ width: '20%' }}>Supplier</th>
              <th style={{ width: '15%' }}>Harga Satuan</th>
              <th style={{ width: '20%' }}>Jumlah Resupply</th>
              <th style={{ width: '15%' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {supplierProducts.map((product, index) => (
              <tr key={product.supplier_product_id}>
                <td>{index + 1}</td>
                <td>{product.product_name}</td>
                <td>{product.supplier_name}</td>
                <td>Rp{parseFloat(product.unit_price_from_supplier || 0).toLocaleString()}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleQuantityChange(product.supplier_product_id, product.resupply_quantity - 1)}
                      disabled={product.resupply_quantity <= 0} // Nonaktifkan jika sudah 0
                    >
                      -
                    </button>
                    <input
                        type="number"
                        className="form-control form-control-sm mx-2 text-center"
                        style={{ width: '70px' }} // Sedikit lebih lebar untuk angka
                        value={product.resupply_quantity}
                        onChange={(e) => handleQuantityChange(product.supplier_product_id, e.target.value)} // Biarkan validasi di handleQuantityChange
                        min="0" // MODIFIKASI: Input minimal 0
                    />
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleQuantityChange(product.supplier_product_id, product.resupply_quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>Rp{(parseFloat(product.unit_price_from_supplier || 0) * product.resupply_quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {supplierProducts.length > 0 && (
        <>
          <hr />
          <div className="mb-3">
            <label htmlFor="resupplyNotes" className="form-label">Catatan untuk Pesanan Resupply:</label>
            <textarea
              className="form-control"
              id="resupplyNotes"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Prioritaskan item ini, hubungi jika ada item alternatif, dll."
            ></textarea>
          </div>
          <div className="d-flex justify-content-end align-items-center">
            <h4 className="me-4">Total Estimasi Biaya: Rp{totalEstimatedCost.toLocaleString()}</h4>
            <button
                className="btn btn-primary"
                onClick={submitResupplyOrder}
                disabled={itemsToOrderForButtonDisabled().length === 0} // Nonaktifkan jika tidak ada item yang diorder
            >
                Kirim Permintaan Resupply
            </button>
          </div>
        </>
      )}
    </div>
  );
  // Helper function untuk disabled button
  function itemsToOrderForButtonDisabled() {
    return supplierProducts.filter(product => product.resupply_quantity > 0);
  }
};

export default ResupplyAdmin;