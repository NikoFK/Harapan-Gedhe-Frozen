import { useEffect, useState } from 'react';
import axios from 'axios';

function User() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    contact_no: '',
    role: 'admin', // Default role untuk user baru
  });
  const [editing, setEditing] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/users', newUser);
      setNewUser({ // Reset form
        username: '',
        email: '',
        password: '',
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        contact_no: '',
        role: 'admin', // Kembalikan ke default role
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(`Gagal menambahkan user: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id, username) => {
    if (username === 'admin') {
      alert('User "admin" tidak bisa dihapus!');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus user ${username}?`)) {
      try {
        await axios.delete(`http://localhost:3001/api/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (user) => {
    // Pastikan date_of_birth dalam format YYYY-MM-DD untuk input type="date"
    const formattedUser = {
      ...user,
      date_of_birth: user.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
    };
    setEditing(formattedUser);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    // Mencegah perubahan role untuk user 'admin' jika username-nya 'admin'
    // Meskipun inputnya disabled, ini sebagai pengaman tambahan jika ada modifikasi frontend
    const payload = editing.username === 'admin' ? { ...editing, role: 'admin' } : editing;

    try {
      await axios.put(`http://localhost:3001/api/users/${editing.id}`, payload);
      setEditing(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(`Gagal mengupdate user: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditing({ ...editing, [name]: value });
  };

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link p-0 me-3" onClick={() => window.location.href = '/admin'}>
          <i className="bi bi-arrow-left fs-4"></i>
        </button>
        <h2>Kelola User</h2>
      </div>

      <form onSubmit={handleAddUser} className="mb-4">
        <div className="row g-2">
          {['username', 'email', 'password', 'date_of_birth', 'address', 'city', 'contact_no'].map((field, i) => (
            <div key={i} className="col-md-3"> {/* Perhatikan penyesuaian layout jika perlu */}
              <input
                type={field === 'date_of_birth' ? 'date' : field === 'password' ? 'password' : 'text'}
                name={field}
                className="form-control"
                placeholder={field.replace(/_/g, ' ')}
                value={newUser[field]}
                onChange={handleInputChange}
                required={field !== 'contact_no' && field !== 'address' && field !== 'city'} // Sesuaikan required
              />
            </div>
          ))}
          <div className="col-md-2"> {/* Atau col-md-3 */}
            <select name="gender" className="form-select" value={newUser.gender} onChange={handleInputChange} required>
              <option value="">Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          {/* --- Tambahan Select untuk Role --- */}
          <div className="col-md-2"> {/* Atau col-md-3 */}
            <select name="role" className="form-select" value={newUser.role} onChange={handleInputChange} required>
              <option value="admin">Admin</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>
          <div className="col-md-2"> {/* Atau col-md-3 */}
            <button className="btn btn-success w-100" type="submit">Tambah</button>
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>No</th>
            <th>Username</th>
            <th>Email</th>
            <th>Tanggal Lahir</th>
            <th>Gender</th>
            <th>Alamat</th>
            <th>Kota</th>
            <th>Kontak</th>
            <th>Role</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={u.id}>
              <td>{index + 1}</td>
              {['username', 'email', 'date_of_birth', 'gender', 'address', 'city', 'contact_no', 'role'].map((field) => (
                <td key={field}>
                  {editing?.id === u.id ? (
                    // --- Logika Edit untuk Role ---
                    field === 'role' ? (
                      u.username === 'admin' ? ( // Jika user adalah 'admin'
                        <span>{editing[field]}</span> // Tampilkan sebagai teks, tidak bisa diedit
                      ) : (
                        <select
                          name={field}
                          className="form-select form-select-sm"
                          value={editing[field]}
                          onChange={handleEditInputChange}
                        >
                          <option value="admin">Admin</option>
                          <option value="supplier">Supplier</option>
                        </select>
                      )
                    ) : field === 'gender' ? (
                      <select
                        name={field}
                        className="form-select form-select-sm"
                        value={editing[field]}
                        onChange={handleEditInputChange}
                      >
                        <option value="">Pilih Gender</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    ) : field === 'date_of_birth' ? (
                      <input
                        className="form-control form-control-sm"
                        type="date"
                        name={field}
                        value={editing[field]} // Sudah diformat di handleEdit
                        onChange={handleEditInputChange}
                      />
                    ) : (
                      <input
                        className="form-control form-control-sm"
                        type={field === 'password' ? 'password' : 'text'}
                        name={field}
                        value={editing[field]}
                        onChange={handleEditInputChange}
                        readOnly={field === 'username' && u.username === 'admin'} // Username 'admin' tidak boleh diubah
                      />
                    )
                  ) : (
                    field === 'date_of_birth' ? (
                      <span>{u[field]?.slice(0, 10)}</span>
                    ) : (
                      <span>{u[field]}</span>
                    )
                  )}
                </td>
              ))}
              <td>
                {editing?.id === u.id ? (
                  <>
                    <button className="btn btn-sm btn-primary me-2" onClick={handleUpdate}>Simpan</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditing(null)}>Batal</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(u)}>Edit</button>
                    {u.username !== 'admin' && ( // User 'admin' tidak bisa dihapus (tombol hapus disembunyikan)
                       <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id, u.username)}>Hapus</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default User;