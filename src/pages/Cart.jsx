import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Cart = ({ user, updateCartCount }) => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/cart/${user.id}`);
      setCartItems(res.data);
    //   const totalQty = res.data.reduce((sum, item) => sum + item.quantity, 0);
      updateCartCount(res.data.length);
    } catch (error) {
      console.error("Gagal memuat cart:", error);
    }
  };
  

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    await axios.put(`http://localhost:3001/api/cart/${id}`, { quantity });
    fetchCart();
  };

  const deleteItem = async (id) => {
    await axios.delete(`http://localhost:3001/api/cart/${id}`);
    fetchCart();
  };

  const checkout = async () => {
    try {
      await axios.post('http://localhost:3001/api/checkout', {
        user_id: user.id,
        payment_method: paymentMethod
      });
      fetchCart(); // akan memperbarui tampilan cart
      alert('Checkout berhasil!');
    } catch (error) {
      alert('Checkout gagal!');
      console.error("Checkout error:", error);
    }
  };  

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!user) return <p className="text-center">Mohon login untuk melihat cart Anda.</p>;
console.log(cartItems);
  return (
    <div className="container my-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Kembali
      </button>
      <h2 className="mb-4">Keranjang Belanja</h2>

      {cartItems.length === 0 ? (
        <p className="text-center">Keranjang Anda kosong</p>
      ) : (
        <table className="table table-striped">
            <thead>
                <tr>
                <th style={{ width: '5%' }}>No</th>
                <th>Gambar</th>
                <th style={{ width: '15%' }}>Kategori</th>
                <th style={{ width: '15%' }}>Nama Produk</th>
                <th style={{ width: '20%' }}>Jumlah</th>
                <th>Harga</th>
                <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                {cartItems.map((item, index) => (
                <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                    <img
                        src={`../src/assets/${item.image_url}`}
                        alt={item.product_name}
                        className="img-fluid"
                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                    />
                    </td>
                    <td>{item.category_name}</td>
                    <td>{item.name}</td>
                    <td>
                    <div className="d-flex align-items-center">
                        <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                        -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                        +
                        </button>
                    </div>
                    </td>
                    <td>Rp{(item.price * item.quantity).toLocaleString()}</td>
                    <td>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteItem(item.id)}
                    >
                        Hapus
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
      )}

      {cartItems.length > 0 && (
        <>
          <hr />
          <div className="d-flex justify-content-between">
            <h4>Total: Rp{totalPrice.toLocaleString()}</h4>
            <div>
              <label className="me-2">Metode Pembayaran:</label>
              <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="COD">COD</option>
                <option value="debit">Debit</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary mt-3" onClick={checkout} disabled={cartItems.length === 0}>Checkout</button>
        </>
      )}
    </div>
  );
};

export default Cart;
