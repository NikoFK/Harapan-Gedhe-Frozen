import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from 'react-router-dom'

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/orders/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Gagal fetch orders:", err);
    }
  };

  const confirmReceived = async (orderId) => {
    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/complete`);
      alert("Pesanan dikonfirmasi sudah diterima.");
      fetchOrders();
    } catch (err) {
      console.error("Gagal konfirmasi pesanan:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="badge bg-success">Selesai</span>;
      case 'packaging': return <span className="badge bg-primary">Sedang Disiapkan</span>;
      case 'shipped': return <span className="badge bg-warning text-dark">Sedang Dikirim</span>;
      case 'cancelled': return <span className="badge bg-danger">Dibatalkan</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };  

  const cancelOrder = async (orderId) => {
    if (confirm("Yakin ingin membatalkan pesanan ini?")) {
      try {
        await axios.put(`http://localhost:3001/api/orders/${orderId}/cancel`);
        alert("Pesanan dibatalkan.");
        fetchOrders();
      } catch (err) {
        console.error("Gagal membatalkan pesanan:", err);
      }
    }
  };

  const printPDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Invoice Order", 14, 15);
    doc.setFontSize(12);
    doc.text(`Order ID: ${formatOrderId(order.order_id)}`, 14, 25);
    doc.text(`Status: ${order.status}`, 14, 32);
    doc.text(`Total Harga: Rp${order.total_price}`, 14, 39);
    doc.text(`Metode Pembayaran: ${order.payment_method}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [["Produk", "Jumlah", "Harga"]],
      body: order.items.map(item => [item.name, item.quantity, `Rp${item.price}`]),
    });

    doc.save(`order-${formatOrderId(order.order_id)}.pdf`);
  };

  const formatOrderId = (id) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}${m}${id}`;
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Kembali
      </button>
  
      <h2 className="mb-4">Pesanan Saya</h2>
  
      <div className="mb-4">
        <label className="form-label me-2">Filter Status:</label>
        <select
          className="form-select w-auto d-inline"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Semua</option>
          <option value="packaging">Sedang Disiapkan</option>
          <option value="shipped">Sedang Dikirim</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>
  
      {filteredOrders.length === 0 ? (
        <p>Tidak ada pesanan.</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order.order_id} className="card mb-4 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Order ID #{formatOrderId(order.order_id)}</h5>
              {getStatusBadge(order.status)}
            </div>
  
            <p className="mb-1"><strong>Total:</strong> Rp{Number(order.total_price).toLocaleString()}</p>
            <p className="mb-1"><strong>Pembayaran:</strong> {order.payment_method}</p>
  
            <div className="row mt-2">
              {order.items.map((item) => (
                <div key={item.product_id} className="col-md-6 d-flex mb-2">
                  <img
                    src={"../src/assets/" + item.image_url}
                    alt={item.name}
                    className="me-3"
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <div>
                    <p className="mb-1"><strong>{item.name}</strong></p>
                    <p className="mb-0">Jumlah: {item.quantity}</p>
                    <p className="mb-0">Harga: Rp{Number(item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
  
            <div className="d-flex gap-2 flex-wrap mt-3">
              {order.status === 'shipped' && (
                <button onClick={() => confirmReceived(order.order_id)} className="btn btn-success">
                  Konfirmasi Pesanan Sampai
                </button>
              )}
              {order.status === 'packaging' && (
                <button onClick={() => cancelOrder(order.order_id)} className="btn btn-danger">
                  Batalkan Pesanan
                </button>
              )}
              <button className="btn btn-outline-secondary" onClick={() => printPDF(order)}>
                Cetak PDF
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );  
};

export default Orders;
