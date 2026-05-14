import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";

// Local cache to maintain synchronous access for the UI
let cachedStore = {
  products: [],
  customers: [],
  orders: []
};

// Initialize store from Firebase
export const initStore = async () => {
  try {
    const docRef = doc(db, "data", "global_store");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      cachedStore = docSnap.data();
      console.log("Dữ liệu đã được tải từ Firebase:", cachedStore);
    } else {
      console.log("Chưa có dữ liệu trên Firebase, khởi tạo mặc định.");
      // Initial data if cloud is empty
      cachedStore = {
        products: [
          { id: 'SP001', name: 'Áo thun nam Basic', price: 150000, cost: 80000, stock: 45 },
          { id: 'SP002', name: 'Quần Jean rách gối', price: 350000, cost: 200000, stock: 2 },
          { id: 'SP003', name: 'Giày Sneaker trắng', price: 450000, cost: 250000, stock: 15 }
        ],
        customers: [
          { id: 'KH001', name: 'Nguyễn Văn A', phone: '0987654321', totalSpent: 1500000, debt: 500000 },
          { id: 'KH002', name: 'Trần Thị B', phone: '0912345678', totalSpent: 2000000, debt: 0 }
        ],
        orders: []
      };
      await saveStore(cachedStore);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu từ Firebase:", error);
    // Fallback to localStorage if Firebase fails
    const local = localStorage.getItem('kiot_data');
    if (local) cachedStore = JSON.parse(local);
  }
  return cachedStore;
};

export const getStore = () => {
  return cachedStore;
};

export const saveStore = async (data) => {
  cachedStore = data;
  try {
    const docRef = doc(db, "data", "global_store");
    await setDoc(docRef, data);
    // Also save to local as backup
    localStorage.setItem('kiot_data', JSON.stringify(data));
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu lên Firebase:", error);
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
