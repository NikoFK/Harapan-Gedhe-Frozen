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
          className="hero-section position-relative"
          style={{
            backgroundImage: `url(${ImgBebek})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            className="overlay position-absolute top-0 start-0 w-100 h-100"
            style={{
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0,0,0,0.4))',
              zIndex: 1
            }}
          ></div>
          <div
            className="hero-content position-relative text-center text-white"
            style={{ zIndex: 2 }}
          >
            <h1 className="display-4 fw-bold animated-title">
              Selamat Datang di Harapan Gedhe Frozen <span role="img" aria-label="bebek">🦆</span><span role="img" aria-label="es">🧊</span>
            </h1>
            <p className="lead animated-subtitle">
              Frozen Bebek dan Ayam berkualitas dan bergizi!
            </p>
          </div>
          <style>
            {`
              .animated-title {
                animation: bounce 1.5s infinite alternate;
                letter-spacing: 1px;
                text-shadow: 0 4px 24px rgba(0,0,0,0.5);
              }
              .animated-subtitle {
                animation: fadeIn 2s;
                font-size: 1.5rem;
                color: #e0f7fa;
                text-shadow: 0 2px 8px rgba(0,0,0,0.3);
              }
              @keyframes bounce {
                0% { transform: translateY(0);}
                100% { transform: translateY(-18px);}
              }
              @keyframes fadeIn {
                from { opacity: 0;}
                to { opacity: 1;}
              }
              @media (max-width: 600px) {
                .display-4 { font-size: 2rem; }
                .animated-subtitle { font-size: 1.1rem; }
              }
            `}
          </style>
        </div>


      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 py-5">
        <small>&copy; 2025 Harapan Gedhe Frozen. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default Home;




   