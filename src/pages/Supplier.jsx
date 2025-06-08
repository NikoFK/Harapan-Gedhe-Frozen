import { Link } from 'react-router-dom';

function Supplier({ user }) {
    console.log(user);
    if (!user || user.role !== 'supplier') {
        return <div className="text-center mt-5">Akses ditolak. Anda bukan Supplier.</div>;
      }
  return (
    <>
      {/* Menu Admin */}
      <div className="container mt-4">
        <h3 className="mb-4">Dashboard Supplier</h3>
        <div className="row g-4">

            <div className="col-md-3">
                <Link to="/supplier/produksupplier" className="text-decoration-none">
                <div className="card text-center p-4 shadow-sm h-100">
                    <i className="bi bi-box-seam fs-1 text-primary"></i>
                    <h5 className="mt-3 text-dark">Persediaan Barang</h5>
                </div>
                </Link>
            </div>
            <div className="col-md-3">
                <Link to="/supplier/orderssupplier" className="text-decoration-none">
                <div className="card text-center p-4 shadow-sm h-100">
                    <i className="bi bi-person-check fs-1 text-primary"></i>
                    <h5 className="mt-3 text-dark">Order</h5>
                </div>
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}

export default Supplier;
