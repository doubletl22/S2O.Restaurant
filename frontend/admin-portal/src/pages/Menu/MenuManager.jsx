import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { jwtDecode } from "jwt-decode";

const MenuManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form tạo món mới
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', description: '', categoryId: ''
  });

  // Lấy TenantId từ Token để load món ăn của quán mình
  const getTenantId = () => {
    try {
      const token = localStorage.getItem('ownerToken');
      return jwtDecode(token).tenant_id;
    } catch { return null; }
  };

  useEffect(() => {
    const tenantId = getTenantId();
    if (tenantId) {
      // Load song song Danh mục và Món ăn
      Promise.all([
        adminApi.getCategories(),
        adminApi.getProducts(tenantId)
      ]).then(([catRes, prodRes]) => {
        setCategories(catRes.data);
        setProducts(prodRes.data);
      });
    }
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price)
      });
      alert("Thêm món thành công!");
      setIsModalOpen(false);
      // Reload lại data...
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Thực đơn</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={20} /> Thêm món
        </button>
      </div>

      {/* Grid hiển thị món ăn */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded shadow p-4">
            <div className="h-32 bg-gray-100 mb-4 flex items-center justify-center rounded">
               <ImageIcon className="text-gray-400"/>
            </div>
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-blue-600 font-semibold">{p.price.toLocaleString()} đ</p>
          </div>
        ))}
      </div>

      {/* Modal Thêm Món */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg w-96 space-y-4">
            <h2 className="text-xl font-bold">Món mới</h2>
            <input placeholder="Tên món" className="w-full border p-2 rounded" 
              onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            <input type="number" placeholder="Giá bán" className="w-full border p-2 rounded" 
              onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
            
            <select className="w-full border p-2 rounded" 
              onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}>
              <option value="">Chọn danh mục...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Lưu lại</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 py-2">Hủy</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MenuManager;