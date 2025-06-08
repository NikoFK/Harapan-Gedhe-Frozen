import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout, cartBadgeCount }) { // Ganti cartCount menjadi cartBadgeCount
  const navigate = useNavigate();

  const handleLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
    if (isConfirmed) {
      alert(`Sampai jumpa, ${user.username}!`);
      localStorage.removeItem('user');
      onLogout();
      navigate('/', { replace: true });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">Harapan Gedhe Frozen</Link>
      <div className="ms-auto d-flex align-items-center gap-2">
        {user ? (
           <>
           <span className="text-white">Hai {user.username}</span>
       
           {/* Tombol Admin hanya untuk admin */}
           {user.role === 'admin' && (
             <Link className="btn btn-warning btn-sm" to="/admin">Admin Panel</Link>
           )}
            {user.role === 'supplier' && (
             <Link className="btn btn-warning btn-sm" to="/supplier">Supplier Panel</Link>
           )}
           {/* Tombol Guest Book dan Cart untuk non-admin dan non-supplier*/}
           {user.role !== 'admin' && user.role !=='supplier' && (
             <>
               <Link className="btn btn-outline-light btn-sm" to="/guestbook">Guest Book</Link>
               <Link className="btn btn-outline-light btn-sm" to="/orders">Order</Link>
               <Link to="/cart" className="btn btn-outline-light btn-sm">
                 <i className="bi bi-cart"></i>
                 {cartBadgeCount > 0 && <span className="badge bg-danger ms-2">{cartBadgeCount}</span>} {/* Tampilkan jumlah cart */}
               </Link>
             </>
           )}
       
           <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="btn btn-outline-light mx-2" to="/login">Log in</Link>
            {/* <Link className="btn btn-outline-light" to="/register">Sign Up</Link> */}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
