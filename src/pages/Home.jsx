import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const ImgBebek = '/assets/bebek.jpeg'; // tanpa import

function Home({user, updateCartCount}) {
  const navigate = useNavigate();
  // console.log(user);
  const handleBuy = async (product) => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk membeli.');
      navigate('/login');
    } else if (user.role === 'admin') {
      alert('Anda bukan customer!');
    } else if (user.role === 'customer') {
      try {
        await axios.post('http://localhost:3001/api/cart', {
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        });
  
        alert(`Produk "${product.name}" berhasil masuk ke keranjang!`);
  
        // Ambil ulang data cart untuk update badge
        if (updateCartCount) {
          const res = await axios.get(`http://localhost:3001/api/cart/${user.id}`);
          updateCartCount(res.data.length);
        }
  
      } catch (error) {
        console.error('Gagal menambahkan ke cart:', error);
        alert('Gagal menambahkan produk ke keranjang.');
      }
    }
  };  

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const url = "http://localhost:3001/api";

    //pagination    
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
    
  useEffect(() => {
    // Fetch products
    axios.get(url+'/products')
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch(err => console.error(err));

    // Fetch categories
    axios.get(url+'/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  // Handle category filter
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    if (value === "Semua") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => p.category_name === value);
      setFilteredProducts(filtered);
    }
  };

  return (
    <div>
      {/* Hero */}
      <div
        className="text-white text-center py-5 position-relative"
        style={{
          // backgroundImage: 'url("https://media.istockphoto.com/id/172396921/id/foto/gitar-tergantung-di-toko.jpg?s=1024x1024&w=is&k=20&c=couEgbMpSR2llNA8B2oy8IryLbos4tWKCh07JM2_u7o=")',
          backgroundImage: `url(${ImgBebek})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '600px'
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0,0,0,0.5))',
            zIndex: 1
          }}
        ></div>
        <div className="position-relative" style={{ zIndex: 2 }}>
          <h1 className="display-4 fw-bold">Selamat Datang di Harapan Gedhe Frozen 🦆🧊</h1>
          <p className="lead">Frozen Bebek dan Ayam berkualitas dan bergizi!</p>
        </div>
      </div>

      {/* <div className="container my-4">
        <div className="row"> */}
            {/* Produk di kiri */}
            {/* <div className="col-md-9">
            <div className="row">
                {currentItems.length > 0 ? (
                currentItems.map(product => (
                    <div className="col-md-4 mb-4" key={product.id}>
                      <div className="card h-100 shadow-sm">
                          <img
                          src={new URL(`../assets/${product.image_url}`, import.meta.url).href}
                          className="card-img-top"
                          alt={product.name}
                          />
                          <div className="card-body d-flex flex-column">
                            <h5 className="card-title">{product.name}</h5>
                            <p className="card-text">Rp {parseInt(product.price).toLocaleString()}</p>
                            <div className="mt-auto">
                              <button
                                className="btn btn-primary btn-sm me-2"
                                onClick={() => handleBuy(product)}
                              >
                                Buy
                              </button>
                              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(`/product/${product.id}`)}>Detail</button>
                            </div>
                          </div>
                      </div>
                    </div>
                ))
                ) : (
                <div className="text-center text-muted py-5">
                    <em>Tidak ada produk dalam kategori ini.</em>
                </div>
                )}
            </div> */}

            {/* Pagination */}
            {/* {totalPages > 1 && (
                <nav className="mt-4">
                <ul className="pagination justify-content-center">
                    {Array.from({ length: totalPages }, (_, i) => (
                    <li
                        key={i}
                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => handlePageChange(i + 1)}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="page-link">{i + 1}</span>
                    </li>
                    ))}
                </ul>
                </nav>
            )} */}
            {/* </div> */}
            {/* Kategori di kanan */}
            {/* <div className="col-md-3">
            <div className="card shadow-sm p-3">
                <h5 className="fw-bold mb-3">Kategori</h5>
                <ul className="list-group">
                <li
                    className={`list-group-item ${filter === "Semua" ? "active" : ""}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleFilterChange({ target: { value: "Semua" } })}
                >
                    Semua
                </li>
                {categories.map(cat => (
                    <li
                    key={cat.id}
                    className={`list-group-item ${filter === cat.name ? "active" : ""}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleFilterChange({ target: { value: cat.name } })}
                    >
                    {cat.name}
                    </li>
                ))}
                </ul>
            </div>
            </div> */}
        {/* </div> */}
        {/* </div> */}



      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 py-5">
        <small>&copy; 2025 Harapan Gedhe Frozen. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default Home;
