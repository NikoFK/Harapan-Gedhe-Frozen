// src/pages/admin/Guestbook.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminGuestbook() {
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/guestbook');
      setEntries(res.data);
    } catch (err) {
      console.error('Gagal memuat entri:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus entri ini?')) {
      try {
        await axios.delete(`http://localhost:3001/api/guestbook/${id}`);
        fetchEntries();
      } catch (err) {
        console.error('Gagal menghapus entri:', err);
      }
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-link p-0 me-3" 
          onClick={() => window.location.href = '/admin'}
        >
          <i className="bi bi-arrow-left fs-4"></i>
        </button>
        <h2>Entri Guest Book</h2>
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Pesan</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.id}</td>
              <td>{entry.name}</td>
              <td>{entry.message}</td>
              <td>{new Date(entry.created_at).toLocaleString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(entry.id)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">Belum ada entri.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminGuestbook;
