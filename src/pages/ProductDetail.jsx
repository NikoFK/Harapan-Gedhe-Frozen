// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";

function ProductDetail({user}) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`http://localhost:3001/api/products/${id}`);
      setProduct(res.data);
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="text-center mt-4">Memuat...</div>;

  const handleBuy = async (product) => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk membeli.');
      navigate('/login');
    } else if (user.role === 'admin') {
      alert('Anda bukan customer!');
    } else if (user.role === 'customer') {
      try {
        // const data = {
        //   user_id: user.id,
        //   product_id: product.id,
        //   quantity: 1,
        // };
        // console.log('Mengirim data ke server:', data);
        await axios.post('http://localhost:3001/api/cart', {
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        });
        alert(`Produk "${product.name}" berhasil masuk ke keranjang!`);
      } catch (error) {
        console.error('Gagal menambahkan ke cart:', error);
        alert('Gagal menambahkan produk ke keranjang.');
      }
    }
  };  

  return (
    <div className="container my-5">
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Kembali
      </button>
      <div className="row">
        <div className="col-md-6">
          <img
            src={`../src/assets/${product.image_url}`}
            className="img-fluid rounded shadow"
            alt={product.name}
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">Kategori: {product.category_name}</p>
          <h4>Rp {parseInt(product.price).toLocaleString()}</h4>
          <p>{product.description}</p>
          <button className="btn btn-primary mt-3" onClick={() => handleBuy(product)}>Tambahkan ke Keranjang</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
