// App State & LocalStorage Management
const defaultData = {
  products: [
    { id: 'SP001', name: 'Áo thun nam Basic', price: 150000, cost: 80000, stock: 45, category: 'Áo', barcode: '8931234567890' },
    { id: 'SP002', name: 'Quần Jean rách gối', price: 350000, cost: 200000, stock: 2, category: 'Quần', barcode: '8931234567891' },
    { id: 'SP003', name: 'Giày Sneaker trắng', price: 450000, cost: 250000, stock: 15, category: 'Giày', barcode: '8931234567892' },
  ],
  customers: [
    { id: 'KH001', name: 'Nguyễn Văn A', phone: '0987654321', totalSpent: 1500000, debt: 500000 },
    { id: 'KH002', name: 'Trần Thị B', phone: '0912345678', totalSpent: 2000000, debt: 0 },
  ],
  orders: []
};

// Initialize or get data from LocalStorage
export const getStore = () => {
  const data = localStorage.getItem('kiot_data');
  return data ? JSON.parse(data) : defaultData;
};

export const saveStore = (data) => {
  localStorage.setItem('kiot_data', JSON.stringify(data));
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
