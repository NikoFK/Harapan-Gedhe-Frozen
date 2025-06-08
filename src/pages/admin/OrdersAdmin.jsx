import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';

// Ganti nama komponen ini jika Anda menggunakan nama file yang berbeda, misal AdminResupplyManagement
const OrdersAdmin = () => {
  const [resupplyOrders, setResupplyOrders] = useState([]);
  const [loadingResupplyOrders, setLoadingResupplyOrders] = useState(true);
  // State receivingOrder dan itemQuantitiesReceived dihapus karena tidak ada input parsial lagi
  const navigate = useNavigate();

  const fetchResupplyOrders = async () => {
    setLoadingResupplyOrders(true);
    try {
      const res = await axios.get("http://localhost:3001/api/resupply-orders");
      if (Array.isArray(res.data)) {
        setResupplyOrders(res.data);
      } else {
        console.error("Data dari API bukan array:", res.data);
        setResupplyOrders([]);
      }
    } catch (err) {
      console.error("Gagal fetch semua pesanan resupply:", err);
      setResupplyOrders([]);
    } finally {
      setLoadingResupplyOrders(false);
    }
  };

  useEffect(() => {
    fetchResupplyOrders();
  }, []);

  // Fungsi handleUpdateStatus tetap sama, ia akan menerima newStatus dan itemsToUpdate
  const handleUpdateStatus = async (orderId, newStatus, itemsToUpdate = null) => {
    try {
      await axios.put(`http://localhost:3001/api/resupply-orders/${orderId}/status`, { 
        newStatus: newStatus,
        receivedItems: itemsToUpdate // Backend akan menggunakan ini untuk set item jadi full
      });
      fetchResupplyOrders();
      alert(`Status pesanan resupply berhasil diubah menjadi ${newStatus.replace(/_/g, ' ')}`);
    } catch (err) {
      console.error("Gagal update status resupply:", err.response?.data?.message || err.message);
      alert(`Gagal update status resupply: ${err.response?.data?.message || err.message}`);
    }
  };
  
  // Fungsi ini sekarang akan menandai seluruh order sebagai fully_received
  const markOrderAsFullyReceived = (order) => {
    if (!order || !Array.isArray(order.items)) {
      alert("Detail order tidak lengkap atau item tidak valid.");
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menandai semua item untuk pesanan ${formatResupplyOrderNumber(order)} sebagai telah diterima penuh? Ini akan mengupdate stok yang diterima sesuai jumlah pesanan.`)) {
      return;
    }

    // Buat payload receivedItems yang mengindikasikan semua item diterima penuh.
    // Backend akan menggunakan ini untuk mengupdate quantity_received menjadi quantity_ordered
    // dan item_status menjadi 'fully_received'.
    const itemsToUpdate = order.items.map(item => ({
      resupply_order_item_id: item.resupply_order_item_id,
      // Jumlah yang PERLU DITAMBAHKAN agar quantity_received menjadi quantity_ordered
      quantity_newly_received: Math.max(0, item.quantity_ordered - item.quantity_received) 
    }));
    
    handleUpdateStatus(order.resupply_order_id, 'fully_received', itemsToUpdate);
  };

  const formatResupplyOrderNumber = (order) => {
    if (!order || !order.resupply_order_id) return 'N/A';
    const date = new Date(order.order_date || order.created_at);
    if (isNaN(date.getTime())) return 'Tanggal Tidak Valid';

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
    return <div className="container mt-4"><p>Memuat pesanan ke supplier...</p></div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
            <button 
            className="btn btn-link p-0 me-3" 
            onClick={() => navigate('/admin')}>
            <i className="bi bi-arrow-left fs-4"></i>
            </button>
            <h3>Admin: Manajemen Pesanan Resupply</h3> 
        </div>
        <div>
            <Link to="/admin/resupplyadmin" className="btn btn-info btn-sm">
                <i className="bi bi-box-arrow-in-down"></i> Buat Permintaan Resupply Baru
            </Link>
        </div>
      </div>

      {resupplyOrders.length === 0 ? (
        <p>Tidak ada pesanan resupply saat ini.</p>
      ) : (
        resupplyOrders.map(order => (
          <div key={`resupply-admin-${order.resupply_order_id}`} className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center p-3 bg-light">
              <h5 className="mb-0">ID Pesanan: {formatResupplyOrderNumber(order)}</h5>
              {order.status && (
                <span className={`btn ${getResupplyOrderStatusClass(order.status)} btn-sm text-capitalize`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <div className="card-body p-3">
              <div className="row mb-2">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Tgl Pesan:</strong> {order.order_date || order.created_at ? new Date(order.order_date || order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                    <p className="mb-1"><strong>Diminta oleh:</strong> {order.requested_by_username || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Total Estimasi:</strong> Rp {parseFloat(order.total_estimated_cost || 0).toLocaleString('id-ID')}</p>
                    {order.order_notes && <p className="mb-1"><strong>Catatan:</strong> {order.order_notes}</p>}
                  </div>
              </div>
              
              <h6>Item Pesanan:</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                      <tr>
                        <th>Produk (Supplier)</th>
                        <th>Supplier</th>
                        <th>Qty Dipesan</th>
                        <th>Harga Satuan</th>
                        <th>Subtotal</th>
                        <th>Qty Diterima</th>
                        <th>Status Item</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(order.items) && order.items.map(item => (
                        <tr key={`resupply-item-admin-${item.resupply_order_item_id}`}>
                          <td>{item.product_name_at_order || 'N/A'}</td>
                          <td>{item.supplier_name || 'N/A'}</td>
                          <td>{item.quantity_ordered || 0}</td>
                          <td>Rp {parseFloat(item.price_at_order || 0).toLocaleString('id-ID')}</td>
                          <td>Rp {(parseFloat(item.price_at_order || 0) * (item.quantity_ordered || 0)).toLocaleString('id-ID')}</td>
                          <td>{item.quantity_received || 0}</td>
                          <td className="text-capitalize">{item.item_status ? item.item_status.replace(/_/g, ' ') : 'N/A'}</td>
                        </tr>
                      ))}
                      {(!Array.isArray(order.items) || order.items.length === 0 ) && (
                        <tr><td colSpan="7" className="text-center">Tidak ada item.</td></tr>
                      )}
                    </tbody>
                </table>
              </div>

              <div className="mt-3">
                {order.status === 'pending_approval' && (
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleUpdateStatus(order.resupply_order_id, 'approved')}
                  >
                    Setujui Pesanan
                  </button>
                )}
                {order.status === 'approved' && (
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => handleUpdateStatus(order.resupply_order_id, 'ordered_to_supplier')}
                  >
                    Tandai Dipesan ke Supplier
                  </button>
                )}

                {/* MODIFIKASI: Tombol "Catat Penerimaan Barang" menjadi "Tandai Semua Diterima Penuh" */}
                {(['ordered_to_supplier', 'partially_shipped_by_supplier', 'fully_shipped_by_supplier', 'partially_received'].includes(order.status)) && order.status !== 'fully_received' && (
                  <button
                    className="btn btn-success btn-sm me-2" // Ubah warna menjadi success atau warning sesuai preferensi
                    onClick={() => markOrderAsFullyReceived(order)}
                  >
                    Tandai Semua Diterima Penuh
                  </button>
                )}
                {order.status !== 'cancelled' && order.status !== 'fully_received' && (
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                        if (window.confirm(`Yakin ingin membatalkan pesanan resupply ${formatResupplyOrderNumber(order)}?`)) {
                            handleUpdateStatus(order.resupply_order_id, 'cancelled');
                        }
                        }}
                    >
                        Batalkan Pesanan
                    </button>
                )}
              </div>
            </div>

            {/* Form input parsial (receivingOrder) dihapus dari sini */}
          </div>
        ))
      )}
    </div>
  );
};

export default OrdersAdmin;