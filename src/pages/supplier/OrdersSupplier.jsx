import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom'; // Link tidak terpakai, bisa dihapus jika tidak ada navigasi lain

const OrdersSupplier = () => {
  const [resupplyOrders, setResupplyOrders] = useState([]);
  const [loadingResupplyOrders, setLoadingResupplyOrders] = useState(true);
  const navigate = useNavigate();

  const fetchResupplyOrders = async () => {
    setLoadingResupplyOrders(true);
    try {
      const res = await axios.get("http://localhost:3001/api/resupply-orders");
      // MODIFIKASI: Tampilkan semua data dulu, filter bisa dilakukan di backend
      // atau logika tombol aksi akan menangani status yang relevan.
      if (Array.isArray(res.data)) {
        setResupplyOrders(res.data);
      } else {
        console.error("Data dari API bukan array:", res.data);
        setResupplyOrders([]); // Pastikan state adalah array
      }
    } catch (err) {
      console.error("Gagal fetch pesanan resupply untuk supplier:", err);
      setResupplyOrders([]); // Set ke array kosong jika ada error
    } finally {
      setLoadingResupplyOrders(false);
    }
  };

  useEffect(() => {
    fetchResupplyOrders();
  }, []);

  const handleSupplierAction = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:3001/api/resupply-orders/${orderId}/status`, { newStatus });
      fetchResupplyOrders(); // Muat ulang data
      alert(`Status pesanan berhasil diubah menjadi ${newStatus.replace(/_/g, ' ')}.`);
    } catch (err) {
      console.error("Gagal update status oleh supplier:", err.response?.data?.message || err.message);
      alert(`Gagal update status: ${err.response?.data?.message || err.message}`);
    }
  };

  const formatResupplyOrderNumber = (order) => {
    if (!order || !order.resupply_order_id) return 'N/A'; // Guard clause
    const date = new Date(order.order_date || order.created_at);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Guard clause untuk tanggal tidak valid

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `RESPLY-${y}${m}${d}-${order.resupply_order_id}`;
  };

  const getResupplyOrderStatusClass = (status) => {
    switch (status) {
      case 'fully_received': return 'btn-success';
      case 'approved': case 'ordered_to_supplier': return 'btn-info';
      case 'partially_received': case 'fully_shipped_by_supplier': case 'partially_shipped_by_supplier': return 'btn-warning';
      case 'pending_approval': return 'btn-primary';
      case 'cancelled': return 'btn-danger';
      default: return 'btn-secondary';
    }
  };
  
  if (loadingResupplyOrders) {
    return <div className="container mt-4"><p>Memuat pesanan untuk supplier...</p></div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
            <button 
            className="btn btn-link p-0 me-3" 
            onClick={() => navigate('/supplier')}> {/* Pastikan '/admin' adalah rute yang benar */}
            <i className="bi bi-arrow-left fs-4"></i>
            </button>
            <h3>Supplier: Proses Pengiriman Pesanan Resupply</h3> 
        </div>
      </div>

      {resupplyOrders.length === 0 ? (
        <p>Tidak ada pesanan resupply yang perlu diproses oleh supplier saat ini.</p>
      ) : (
        resupplyOrders.map(order => (
          <div key={`resupply-supplier-${order.resupply_order_id}`} className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center p-3 bg-light">
              <h5 className="mb-0">ID Pesanan: {formatResupplyOrderNumber(order)}</h5>
              {order.status && ( // Tambahkan pengecekan order.status ada
                 <span className={`btn ${getResupplyOrderStatusClass(order.status)} btn-sm text-capitalize`}>
                    {order.status.replace(/_/g, ' ')}
                 </span>
              )}
            </div>
            <div className="card-body p-3">
              <p className="mb-1">
                <strong>Tgl Pesan:</strong> 
                {order.order_date || order.created_at ? new Date(order.order_date || order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
              {order.order_notes && <p className="mb-1"><strong>Catatan dari Pemesan:</strong> {order.order_notes}</p>}
              
              <h6 className="mt-3">Item Pesanan:</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Produk Dipesan</th>
                      <th>Qty Dipesan</th>
                      <th>Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Pastikan order.items adalah array */}
                    {Array.isArray(order.items) && order.items.map(item => (
                      <tr key={`resupply-item-supp-${item.resupply_order_item_id}`}>
                        <td>{item.product_name_at_order || 'N/A'}</td>
                        <td>{item.quantity_ordered || 0}</td>
                        <td>{item.supplier_name || 'N/A'}</td>
                      </tr>
                    ))}
                    {!Array.isArray(order.items) || order.items.length === 0 && (
                        <tr><td colSpan="3" className="text-center">Tidak ada item.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                {/* Aksi untuk Supplier, hanya muncul jika statusnya relevan */}
                {(order.status === 'approved' || order.status === 'ordered_to_supplier') && (
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => {
                      if(window.confirm(`Konfirmasi bahwa semua item untuk pesanan ${formatResupplyOrderNumber(order)} akan dikirim?`)){
                        handleSupplierAction(order.resupply_order_id, 'fully_shipped_by_supplier');
                      }
                    }}
                  >
                    Tandai Semua Telah Dikirim
                  </button>
                )}
                {order.status === 'fully_shipped_by_supplier' && (
                   <p className="text-success mt-2"><i className="bi bi-check-circle-fill"></i> Pesanan ini telah ditandai sebagai sudah dikirim semua.</p>
                )}
                 {/* Tombol "Selesai" bisa ditambahkan jika ada status khusus untuk itu */}
                 {/* Contoh: Jika admin sudah konfirmasi fully_received, supplier bisa tandai selesai */}
                 {order.status === 'fully_received' && (
                     <button
                        className="btn btn-success btn-sm"
                        // onClick={() => handleSupplierAction(order.resupply_order_id, 'supplier_completed_fulfillment')} // Contoh status baru
                        disabled // Atau aksi lain
                     >
                        Order Selesai (Diterima Pembeli)
                     </button>
                 )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrdersSupplier;