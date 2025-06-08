import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect,useState } from 'react';
import axios from "axios";

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Supplier from './pages/Supplier';
import ProdukSupplier from './pages/supplier/ProdukSupplier';
import AddSupplierProduct from './pages/supplier/AddSupplierProduct';
import EditSupplierProduct from './pages/supplier/EditSupplierProduct';
import OrdersSupplier from './pages/supplier/OrdersSupplier'; // Perhatikan 'orderssupplier' sekarang huruf kecil
import Navbar from './components/Navbar';
import Kategori from './pages/admin/Kategori';
import Produk from './pages/admin/Produk';
import User from './pages/admin/User';
import ResupplyAdmin from './pages/admin/ResupplyAdmin';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import Guestbook from './pages/Guestbook';
import AdminGuestbook from './pages/admin/AdminGuestbook';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import OrdersAdmin from './pages/admin/OrdersAdmin';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cartBadgeCount, setCartBadgeCount] = useState(0); // hanya satu deklarasi

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  useEffect(() => {
    const fetchCartCount = async () => {
      if (loggedInUser?.id) {
        try {
          const res = await axios.get(`http://localhost:3001/api/cart/${loggedInUser.id}`);
          setCartBadgeCount(res.data.length);
        } catch (err) {
          console.error("Gagal fetch cart:", err);
        }
      }
    };

    fetchCartCount();
  }, [loggedInUser]);
  
  return (
    <Router>
      <Navbar user={loggedInUser} onLogout={handleLogout} cartBadgeCount={cartBadgeCount} />

      <Routes>
        <Route path="/" element={<Home user={loggedInUser} updateCartCount={setCartBadgeCount} />} />
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="/login" element={<Login onLoginSuccess={setLoggedInUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin user={loggedInUser} onLogout={handleLogout} />} />
        <Route path="/supplier" element={<Supplier user={loggedInUser} onLogout={handleLogout} />} />
        <Route path="/supplier/produksupplier" element={<ProdukSupplier user={loggedInUser} onLogout={handleLogout} />} />
        <Route path="/supplier/addsupplierproduct" element={<AddSupplierProduct user={loggedInUser} onLogout={handleLogout} />} />
        <Route path="/supplier/editsupplierproduct/:id" element={<EditSupplierProduct user={loggedInUser} onLogout={handleLogout} />} />
        <Route path="/supplier/orderssupplier/" element={<OrdersSupplier user={loggedInUser} onLogout={handleLogout} />} />
        <Route path="/admin/kategori" element={<Kategori />} />
        <Route path="/admin/produk" element={<Produk />} />
        <Route path="/admin/produk/AddProduct" element={<AddProduct />} />
        <Route path="/admin/produk/EditProduct/:id" element={<EditProduct />} />
        <Route path="/admin/user" element={<User />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/admin/adminguestbook" element={<AdminGuestbook />} />
        <Route path="/admin/resupplyadmin/" element={<ResupplyAdmin user={loggedInUser} onLogout={handleLogout} />} />
        <Route path="/cart" element={<Cart user={loggedInUser} updateCartCount={setCartBadgeCount} />} />
        <Route path="/product/:id" element={<ProductDetail user={loggedInUser} />} />
        <Route path="/orders" element={<Orders user={loggedInUser} />} />
        <Route path="/admin/ordersadmin" element={<OrdersAdmin user={loggedInUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
