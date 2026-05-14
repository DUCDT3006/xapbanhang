import './style.css';
import './tabs_tables.css';
import './pos.css';
import './modal.css';
import { createIcons, Moon, Sun, LayoutDashboard, ShoppingCart, Package, Users, BarChart2, Search, Plus, Bell, TrendingUp, TrendingDown, DollarSign, PackageOpen, Trash2, QrCode, CreditCard, User, UserPlus, X, ClipboardList, Image as ImageIcon } from 'lucide';
import { renderPOS } from './modules/pos.js';
import { initStore, getStore, saveStore, formatCurrency } from './core/store.js';

// Global Cart State
window.cart = [];

window.addToCart = (productId) => {
  const store = getStore();
  const product = store.products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = window.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    window.cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
};

window.removeFromCart = (productId) => {
  window.cart = window.cart.filter(item => item.id !== productId);
  updateCartUI();
};

window.updateQty = (productId, delta) => {
  const item = window.cart.find(item => item.id === productId);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) window.removeFromCart(productId);
    else updateCartUI();
  }
};

window.clearCart = () => {
  window.cart = [];
  updateCartUI();
};

window.openCustomerModal = () => {
  const modal = document.getElementById('customer-modal');
  if (modal) modal.style.display = 'flex';
};

window.closeCustomerModal = () => {
  const modal = document.getElementById('customer-modal');
  if (modal) {
    modal.style.display = 'none';
    // Clear inputs
    ['name', 'phone', 'address', 'age', 'fb', 'zalo'].forEach(id => {
      document.getElementById('new-cust-' + id).value = '';
    });
  }
};

window.saveNewCustomer = () => {
  const name = document.getElementById('new-cust-name').value;
  const phone = document.getElementById('new-cust-phone').value;
  
  if (!name || !phone) {
    alert("Vui lòng nhập đầy đủ Họ Tên và Số điện thoại!");
    return;
  }
  
  const store = getStore();
  const newCustomer = {
    id: 'KH' + Date.now(),
    name,
    phone,
    address: document.getElementById('new-cust-address').value,
    gender: document.getElementById('new-cust-gender').value,
    age: document.getElementById('new-cust-age').value,
    fb: document.getElementById('new-cust-fb').value,
    zalo: document.getElementById('new-cust-zalo').value,
    totalSpent: 0,
    debt: 0
  };
  
  store.customers.push(newCustomer);
  saveStore(store);
  
  // Update select dropdown
  const select = document.getElementById('pos-customer');
  if (select) {
    const option = document.createElement('option');
    option.value = newCustomer.id;
    option.textContent = `${newCustomer.name} - ${newCustomer.phone}`;
    select.appendChild(option);
    select.value = newCustomer.id; // Auto select new customer
  }
  
  window.closeCustomerModal();
  setTimeout(() => {
    alert("Thêm khách hàng thành công!");
  }, 10);
};

window.openOrderDetail = (orderId) => {
  const store = getStore();
  const order = store.orders.find(o => o.id === orderId);
  if (!order) return;
  
  let customerInfoHtml = '<p class="text-muted">Khách lẻ (Không lưu thông tin)</p>';
  if (order.customerId !== 'GUEST') {
    const customer = store.customers.find(c => c.id === order.customerId);
    if (customer) {
      const orderCount = store.orders.filter(o => o.customerId === customer.id).length;
      customerInfoHtml = `
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label>Họ tên:</label>
          <input type="text" id="od-cust-name" class="form-control" value="${customer.name}">
        </div>
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label>SĐT:</label>
          <input type="text" id="od-cust-phone" class="form-control" value="${customer.phone}">
        </div>
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label>Địa chỉ:</label>
          <input type="text" id="od-cust-address" class="form-control" value="${customer.address || ''}">
        </div>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div class="form-group" style="flex: 1;">
            <label>Giới tính:</label>
            <select id="od-cust-gender" class="form-control">
              <option value="Nam" ${customer.gender === 'Nam' ? 'selected' : ''}>Nam</option>
              <option value="Nữ" ${customer.gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
              <option value="Khác" ${customer.gender === 'Khác' ? 'selected' : ''}>Khác</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1;">
            <label>Tuổi:</label>
            <input type="number" id="od-cust-age" class="form-control" value="${customer.age || ''}">
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label>Facebook:</label>
          <input type="text" id="od-cust-fb" class="form-control" value="${customer.fb || ''}">
        </div>
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label>Zalo:</label>
          <input type="text" id="od-cust-zalo" class="form-control" value="${customer.zalo || ''}">
        </div>
        <hr style="margin: 0.75rem 0; border: 0; border-top: 1px dashed var(--border-color);">
        <p><strong>Số lần mua hàng:</strong> <span class="badge success">${orderCount}</span></p>
        <p><strong>Tổng mua (tích lũy):</strong> <span class="text-primary font-bold">${formatCurrency(customer.totalSpent)}</span></p>
        <p><strong>Tổng nợ hiện tại:</strong> <span class="${customer.debt > 0 ? 'text-danger font-bold' : 'text-success'}">${formatCurrency(customer.debt)}</span></p>
      `;
    }
  }

  document.getElementById('od-customer-info').innerHTML = customerInfoHtml;
  document.getElementById('od-order-id').textContent = `${order.id} (Tổng: ${formatCurrency(order.total)})`;
  document.getElementById('od-hidden-order-id').value = order.id;
  document.getElementById('od-paid').value = order.paid;
  document.getElementById('od-shipping').value = order.shippingStatus;
  document.getElementById('od-note').value = order.note || '';
  
  const modal = document.getElementById('order-detail-modal');
  if (modal) modal.style.display = 'flex';
};

window.closeOrderDetail = () => {
  const modal = document.getElementById('order-detail-modal');
  if (modal) modal.style.display = 'none';
};

window.saveOrderDetail = () => {
  const orderId = document.getElementById('od-hidden-order-id').value;
  const store = getStore();
  const order = store.orders.find(o => o.id === orderId);
  if (!order) return;
  
  const oldPaid = order.paid;
  const newPaid = parseInt(document.getElementById('od-paid').value) || 0;
  
  if (newPaid > order.total) {
    alert("Số tiền đã thanh toán không được lớn hơn tổng tiền đơn hàng!");
    return;
  }
  
  const newDebt = order.total - newPaid;
  const debtDiff = newDebt - order.debt; // If newDebt is smaller, debtDiff is negative (debt decreased)
  
  if (order.customerId === 'GUEST' && newDebt > 0) {
    alert("Khách lẻ không được nợ. Vui lòng điền đủ số tiền!");
    return;
  }
  
  // Update customer info and debt if applicable
  if (order.customerId !== 'GUEST') {
    const customer = store.customers.find(c => c.id === order.customerId);
    if (customer) {
      // Update Debt
      customer.debt += debtDiff;
      if (customer.debt < 0) customer.debt = 0; // Safeguard
      
      // Update Info
      customer.name = document.getElementById('od-cust-name')?.value || customer.name;
      customer.phone = document.getElementById('od-cust-phone')?.value || customer.phone;
      customer.address = document.getElementById('od-cust-address')?.value || '';
      customer.gender = document.getElementById('od-cust-gender')?.value || '';
      customer.age = document.getElementById('od-cust-age')?.value || '';
      customer.fb = document.getElementById('od-cust-fb')?.value || '';
      customer.zalo = document.getElementById('od-cust-zalo')?.value || '';
    }
  }
  
  order.paid = newPaid;
  order.debt = newDebt;
  order.shippingStatus = document.getElementById('od-shipping').value;
  order.note = document.getElementById('od-note').value;
  
  saveStore(store);
  window.closeOrderDetail();
  
  // Re-render current view
  if (views[currentView]) {
    document.getElementById('view-container').innerHTML = views[currentView]();
    renderIcons();
  }
  
  setTimeout(() => {
    alert("Cập nhật đơn hàng thành công!");
  }, 10);
};

window.openProductModal = (productId = null) => {
  const store = getStore();
  let product = null;
  
  if (productId) {
    product = store.products.find(p => p.id === productId);
  }
  
  document.getElementById('prod-id').value = product ? product.id : '';
  document.getElementById('prod-id').readOnly = !!product; // Cannot change ID of existing product
  document.getElementById('prod-name').value = product ? product.name : '';
  document.getElementById('prod-cost').value = product ? product.cost : '';
  document.getElementById('prod-price').value = product ? product.price : '';
  document.getElementById('prod-stock').value = ''; // Always empty for importing, or show current? User wants to import. If we show current, they edit it. Let's make it "Số lượng nhập thêm".
  document.getElementById('prod-img').value = product ? (product.image || '') : '';
  
  // Handle image preview
  const previewContainer = document.getElementById('prod-img-preview');
  const previewImg = previewContainer.querySelector('img');
  if (product && product.image) {
    previewImg.src = product.image;
    previewContainer.style.display = 'block';
  } else {
    previewImg.src = '';
    previewContainer.style.display = 'none';
  }
  
  // Update label
  const label = document.querySelector('#product-modal label[for="prod-stock"]') || document.querySelector('#product-modal label:nth-of-type(4)');
  if (label) {
    // Hacky way to find the stock label, but let's just rely on HTML structure
    const stockLabel = document.getElementById('prod-stock').previousElementSibling;
    if (stockLabel) stockLabel.textContent = product ? `Số lượng NHẬP THÊM (Tồn hiện tại: ${product.stock})` : 'Số lượng nhập kho ban đầu *';
  }
  
  const modal = document.getElementById('product-modal');
  if (modal) modal.style.display = 'flex';
};

window.closeProductModal = () => {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.style.display = 'none';
    ['prod-id', 'prod-name', 'prod-cost', 'prod-price', 'prod-stock', 'prod-img', 'prod-img-file'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.value = '';
    });
    const previewContainer = document.getElementById('prod-img-preview');
    if (previewContainer) {
      previewContainer.style.display = 'none';
      previewContainer.querySelector('img').src = '';
    }
  }
};

window.handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file size (limit to 1MB to save localStorage space)
  if (file.size > 1024 * 1024) {
    alert("Dung lượng ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 1MB để tiết kiệm bộ nhớ máy.");
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Str = e.target.result;
    document.getElementById('prod-img').value = base64Str;
    
    const previewContainer = document.getElementById('prod-img-preview');
    previewContainer.style.display = 'block';
    previewContainer.querySelector('img').src = base64Str;
    renderIcons();
  };
  reader.readAsDataURL(file);
};

window.saveProduct = () => {
  const store = getStore();
  const idInput = document.getElementById('prod-id').value.trim();
  const name = document.getElementById('prod-name').value.trim();
  const cost = parseInt(document.getElementById('prod-cost').value) || 0;
  const price = parseInt(document.getElementById('prod-price').value) || 0;
  const stockInput = parseInt(document.getElementById('prod-stock').value) || 0;
  const image = document.getElementById('prod-img').value.trim();
  
  if (!name || cost <= 0 || price <= 0) {
    alert("Vui lòng nhập đầy đủ Tên, Giá vốn và Giá bán (lớn hơn 0)!");
    return;
  }
  
  let existingProduct = store.products.find(p => p.id === idInput);
  
  // If no ID provided, it's a new product, generate ID
  const newId = idInput || 'SP' + Date.now();
  
  if (!idInput) {
     existingProduct = store.products.find(p => p.name.toLowerCase() === name.toLowerCase());
  }

  if (existingProduct) {
    // Update existing
    existingProduct.name = name;
    existingProduct.cost = cost;
    existingProduct.price = price;
    existingProduct.stock += stockInput; // Add to existing stock
    if (image) existingProduct.image = image;
  } else {
    // Create new
    store.products.push({
      id: newId,
      name,
      cost,
      price,
      stock: stockInput,
      image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
    });
  }
  
  saveStore(store);
  window.closeProductModal();
  
  if (views[currentView]) {
    document.getElementById('view-container').innerHTML = views[currentView]();
    renderIcons();
  }
  
  setTimeout(() => {
    alert("Lưu/Nhập hàng hóa thành công!");
  }, 10);
};

window.deleteProduct = (productId) => {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.")) {
    const store = getStore();
    store.products = store.products.filter(p => p.id !== productId);
    saveStore(store);
    
    if (views[currentView]) {
      document.getElementById('view-container').innerHTML = views[currentView]();
      renderIcons();
    }
  }
};

window.checkout = () => {
  if (window.cart.length === 0) {
    alert("Giỏ hàng đang trống!");
    return;
  }
  const store = getStore();
  const customerId = document.getElementById('pos-customer').value;
  
  // Calculate totals
  let subtotal = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountInput = document.getElementById('cart-discount');
  const paidInput = document.getElementById('cart-paid');
  const discount = parseInt(discountInput?.value) || 0;
  const total = Math.max(0, subtotal - discount);
  const paid = parseInt(paidInput?.value) || 0;
  const debt = Math.max(0, total - paid);
  const shippingStatus = document.getElementById('cart-shipping')?.value || 'Chưa ship';
  const note = document.getElementById('cart-note')?.value || '';
  
  if (customerId === '' && debt > 0) {
    alert("Khách lẻ không được nợ. Vui lòng thanh toán đủ hoặc tạo thông tin khách hàng!");
    return;
  }

  // Update stock
  window.cart.forEach(item => {
    const product = store.products.find(p => p.id === item.id);
    if (product) product.stock -= item.qty;
  });
  
  // Record order
  store.orders.push({
    id: 'HD' + Date.now(),
    date: new Date().toISOString(),
    subtotal: subtotal,
    discount: discount,
    total: total,
    paid: paid,
    debt: debt,
    shippingStatus: shippingStatus,
    note: note,
    customerId: customerId || 'GUEST',
    items: [...window.cart]
  });
  
  // If customer is selected, update their totalSpent and debt
  if (customerId) {
    const customer = store.customers.find(c => c.id === customerId);
    if (customer) {
      customer.totalSpent += total;
      customer.debt += debt;
    }
  }
  
  saveStore(store);
  alert("Thanh toán thành công! Đã lưu hóa đơn và cập nhật tồn kho, công nợ.");
  
  // Clear inputs and cart
  if(discountInput) discountInput.value = '';
  if(paidInput) paidInput.value = '';
  const noteInput = document.getElementById('cart-note');
  if(noteInput) noteInput.value = '';
  document.getElementById('pos-customer').value = '';
  window.clearCart();
  
  window.updateCartUI();
};

window.updateCartUI = () => {
  if (currentView !== 'pos') return;
  
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const debtEl = document.getElementById('cart-debt');
  const discountInput = document.getElementById('cart-discount');
  const paidInput = document.getElementById('cart-paid');
  
  if (!container) return;

  let subtotal = 0;
  countBadge.textContent = window.cart.length;

  if (window.cart.length === 0) {
    container.innerHTML = '<div class="empty-cart-msg text-muted">Chưa có sản phẩm nào</div>';
  } else {
    container.innerHTML = window.cart.map(item => {
      subtotal += item.price * item.qty;
      return `
        <div class="cart-item glass-panel" style="padding: 0.75rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color);">
          <div style="flex: 1;">
            <div style="font-weight: 500; font-size: 1.1rem; margin-bottom: 0.2rem;">${item.name}</div>
            <div class="text-primary font-bold" style="font-size: 1rem;">${formatCurrency(item.price)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="btn-icon" style="width: 28px; height: 28px; font-size: 1.2rem;" onclick="window.updateQty('${item.id}', -1)">-</button>
            <span style="font-weight: 600; width: 20px; text-align: center; font-size: 1.1rem;">${item.qty}</span>
            <button class="btn-icon" style="width: 28px; height: 28px; font-size: 1.2rem;" onclick="window.updateQty('${item.id}', 1)">+</button>
            <button class="btn-icon text-danger" style="width: 28px; height: 28px; margin-left: 0.5rem;" onclick="window.removeFromCart('${item.id}')">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  const discount = parseInt(discountInput?.value) || 0;
  const total = Math.max(0, subtotal - discount);
  const paid = parseInt(paidInput?.value) || 0;
  const debt = Math.max(0, total - paid);

  subtotalEl.textContent = formatCurrency(subtotal);
  totalEl.textContent = formatCurrency(total);
  if (debtEl) debtEl.textContent = formatCurrency(debt);
  
  renderIcons();
};


// View Components (Placeholders for now)
const views = {
  dashboard: () => `
    <div class="fade-in">
      <div class="dashboard-grid">
        <div class="stat-card glass-panel">
          <div class="stat-card-title">
            <span>Doanh thu hôm nay</span>
            <i data-lucide="dollar-sign" class="text-primary"></i>
          </div>
          <div class="stat-card-value">12,500,000₫</div>
          <div class="stat-card-trend up">
            <i data-lucide="trending-up"></i> +15% so với hôm qua
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-card-title">
            <span>Đơn hàng</span>
            <i data-lucide="shopping-cart" class="text-success"></i>
          </div>
          <div class="stat-card-value">45</div>
          <div class="stat-card-trend up">
            <i data-lucide="trending-up"></i> +5% so với hôm qua
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-card-title">
            <span>Khách hàng mới</span>
            <i data-lucide="users" class="text-info"></i>
          </div>
          <div class="stat-card-value">12</div>
          <div class="stat-card-trend down">
            <i data-lucide="trending-down"></i> -2% so với hôm qua
          </div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-card-title">
            <span>Cảnh báo tồn kho</span>
            <i data-lucide="package-open" class="text-danger"></i>
          </div>
          <div class="stat-card-value text-danger">8</div>
          <div class="stat-card-trend">Sản phẩm sắp hết</div>
        </div>
      </div>
      <div class="glass-panel" style="height: 400px; border-radius: 1rem; padding: 1.5rem; display: flex; align-items: center; justify-content: center;">
        <p class="text-muted">Biểu đồ doanh thu (Chart.js sẽ được tích hợp tại đây)</p>
      </div>
    </div>
  `,
  pos: () => {
    setTimeout(updateCartUI, 50); // Delay UI update to ensure DOM is ready
    return renderPOS();
  },
  
  orders: () => {
    const store = getStore();
    // Filter orders: Include if debt > 0 OR shippingStatus === 'Chưa ship' OR shippingStatus === 'Đổi trả'.
    // Exclude if debt === 0 AND shippingStatus === 'Đã ship' (even if note exists).
    const activeOrders = store.orders.filter(o => {
      const isCompleted = o.debt === 0 && o.shippingStatus === 'Đã ship';
      return !isCompleted;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const rows = activeOrders.map(order => {
      const customer = order.customerId === 'GUEST' ? 'Khách lẻ' : (store.customers.find(c => c.id === order.customerId)?.name || 'Khách lẻ');
      const dateStr = new Date(order.date).toLocaleString('vi-VN');
      
      let shipBadge = '<span class="badge warning">Chưa ship</span>';
      if (order.shippingStatus === 'Đã ship') shipBadge = '<span class="badge success">Đã ship</span>';
      else if (order.shippingStatus === 'Đổi trả') shipBadge = '<span class="badge danger">Đổi trả</span>';
      
      return `
        <tr style="cursor: pointer;" onclick="window.openOrderDetail('${order.id}')">
          <td>${order.id}</td>
          <td>${dateStr}</td>
          <td>${customer}</td>
          <td class="font-bold text-primary">${formatCurrency(order.total)}</td>
          <td class="${(order.debt || 0) > 0 ? 'text-danger font-bold' : ''}">${formatCurrency(order.debt || 0)}</td>
          <td>${shipBadge}</td>
          <td style="max-width: 200px; white-space: pre-wrap; font-size: 0.85rem;" class="text-muted">${order.note || 'Không có'}</td>
          <td>
            <button class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.75rem;" onclick="event.stopPropagation(); window.openOrderDetail('${order.id}')">Cập nhật</button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="fade-in glass-panel" style="border-radius: 1rem; padding: 1.5rem; min-height: 100%;">
        <div class="tabs-nav">
          <button class="tab-btn active">Tình trạng đơn hàng (Cần xử lý)</button>
          <button class="tab-btn">Đơn đã hoàn tất</button>
        </div>
        
        <div class="data-table-wrapper" style="overflow-x: auto;">
          <table class="data-table" style="min-width: 900px;">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Thời gian</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Còn nợ</th>
                <th>Giao hàng</th>
                <th>Ghi chú / Yêu cầu (Thiếu hàng...)</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="8" class="text-center text-muted" style="padding: 2rem;">Không có đơn hàng nào đang chờ xử lý</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  inventory: () => {
    const store = getStore();
    const rows = store.products.map(p => `
      <tr style="cursor: pointer;" onclick="window.openProductModal('${p.id}')">
        <td>${p.id}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${p.image ? `<img src="${p.image}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover;">` : ''}
            <span>${p.name}</span>
          </div>
        </td>
        <td>${formatCurrency(p.price)}</td>
        <td>${formatCurrency(p.cost)}</td>
        <td><strong class="${p.stock < 10 ? 'text-danger' : ''}">${p.stock}</strong></td>
        <td><span class="badge ${p.stock > 0 ? 'success' : 'danger'}">${p.stock > 0 ? 'Đang bán' : 'Hết hàng'}</span></td>
        <td>
           <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="event.stopPropagation(); window.openProductModal('${p.id}')">Sửa / Nhập thêm</button>
           <button class="btn-icon text-danger" style="padding: 0.3rem; font-size: 0.75rem; margin-left: 0.5rem;" onclick="event.stopPropagation(); window.deleteProduct('${p.id}')" title="Xóa sản phẩm">
             <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
           </button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="fade-in glass-panel" style="border-radius: 1rem; padding: 1.5rem; min-height: 100%;">
        <div class="tabs-nav">
          <button class="tab-btn active">Tồn kho</button>
          <button class="tab-btn">Nhập kho</button>
          <button class="tab-btn">Xuất kho / Huỷ hàng</button>
          <button class="tab-btn">Kiểm kho</button>
        </div>
        <div class="topbar-actions" style="margin-bottom: 1rem; justify-content: flex-end;">
           <button class="btn btn-primary" onclick="window.openProductModal()"><i data-lucide="plus"></i> Thêm hàng hóa</button>
        </div>
        <div class="data-table-wrapper" style="overflow-x: auto;">
          <table class="data-table" style="min-width: 800px;">
            <thead>
              <tr>
                <th>Mã hàng</th>
                <th>Tên hàng</th>
                <th>Giá bán</th>
                <th>Giá vốn</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7" class="text-center text-muted">Chưa có sản phẩm nào</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  crm: () => {
    const store = getStore();
    const rows = store.customers.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${formatCurrency(c.totalSpent)}</td>
        <td>${formatCurrency(c.totalSpent - c.debt)}</td>
        <td class="${c.debt > 0 ? 'text-danger font-bold' : ''}">${formatCurrency(c.debt)}</td>
        <td>
          ${c.debt > 0 ? '<button class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.75rem;">Thu nợ</button>' : '<span class="text-muted">Hoàn tất</span>'}
        </td>
      </tr>
    `).join('');

    return `
      <div class="fade-in glass-panel" style="border-radius: 1rem; padding: 1.5rem; min-height: 100%;">
        <div class="tabs-nav">
          <button class="tab-btn">Khách hàng</button>
          <button class="tab-btn">Nhà cung cấp</button>
          <button class="tab-btn active">Công nợ phải thu (KH)</button>
          <button class="tab-btn">Công nợ phải trả (NCC)</button>
        </div>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tên khách hàng</th>
                <th>Điện thoại</th>
                <th>Tổng mua</th>
                <th>Đã thanh toán</th>
                <th>Nợ hiện tại</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  reports: () => {
    const store = getStore();
    const orderRows = store.orders.sort((a, b) => new Date(b.date) - new Date(a.date)).map(order => {
      const customer = order.customerId === 'GUEST' ? 'Khách lẻ' : (store.customers.find(c => c.id === order.customerId)?.name || 'Khách lẻ');
      const dateStr = new Date(order.date).toLocaleString('vi-VN');
      
      let paymentBadge = '';
      if (order.debt === 0) paymentBadge = '<span class="badge success">Đã thanh toán</span>';
      else if (order.paid === 0) paymentBadge = '<span class="badge danger">Chưa thanh toán</span>';
      else paymentBadge = '<span class="badge warning">Thanh toán 1 phần</span>';

      let shipBadge = '<span class="badge warning">Chưa ship</span>';
      if (order.shippingStatus === 'Đã ship') shipBadge = '<span class="badge success">Đã ship</span>';
      else if (order.shippingStatus === 'Đổi trả') shipBadge = '<span class="badge danger">Đổi trả</span>';

      return `
        <tr style="cursor: pointer;" onclick="window.openOrderDetail('${order.id}')">
          <td>${order.id}</td>
          <td>${dateStr}</td>
          <td>${customer}</td>
          <td class="font-bold text-primary">${formatCurrency(order.total)}</td>
          <td>${formatCurrency(order.paid || 0)}</td>
          <td class="${(order.debt || 0) > 0 ? 'text-danger font-bold' : ''}">${formatCurrency(order.debt || 0)}</td>
          <td>${paymentBadge}</td>
          <td>${shipBadge}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="fade-in glass-panel" style="border-radius: 1rem; padding: 1.5rem; min-height: 100%;">
        <div class="tabs-nav">
          <button class="tab-btn active">Lịch sử đơn hàng</button>
          <button class="tab-btn">Báo cáo doanh thu</button>
          <button class="tab-btn">Hàng bán chạy</button>
        </div>
        
        <h3 style="margin-bottom: 1rem;">Đơn hàng gần đây</h3>
        <div class="data-table-wrapper" style="overflow-x: auto;">
          <table class="data-table" style="min-width: 900px;">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Thời gian</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Đã thanh toán</th>
                <th>Còn nợ</th>
                <th>TT Thanh toán</th>
                <th>TT Giao hàng</th>
              </tr>
            </thead>
            <tbody>
              ${orderRows || '<tr><td colspan="8" class="text-center text-muted" style="padding: 2rem;">Chưa có đơn hàng nào</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }


};

// State
let currentView = 'dashboard';
let isDarkMode = false;

// DOM Elements
const viewContainer = document.getElementById('view-container');
const pageTitle = document.getElementById('page-title');
const navItems = document.querySelectorAll('.nav-item');
const themeToggle = document.getElementById('theme-toggle');

// Initialize Icons
const renderIcons = () => {
  createIcons({
    icons: {
      Moon, Sun, LayoutDashboard, ShoppingCart, Package, Users, BarChart2, Search, Plus, Bell, TrendingUp, TrendingDown, DollarSign, PackageOpen, Trash2, QrCode, CreditCard, User, UserPlus, X, ClipboardList, Image: ImageIcon
    }
  });
};


// Router function
const navigateTo = (viewName, title) => {
  if (views[viewName]) {
    currentView = viewName;
    pageTitle.textContent = title;
    
    // Update active nav
    navItems.forEach(nav => {
      if (nav.dataset.view === viewName) {
        nav.classList.add('active');
      } else {
        nav.classList.remove('active');
      }
    });

    // Render View
    viewContainer.innerHTML = views[viewName]();
    renderIcons(); // Re-render icons for new content
  }
};

// Event Listeners
navItems.forEach(nav => {
  nav.addEventListener('click', (e) => {
    e.preventDefault();
    const viewName = nav.dataset.view;
    const title = nav.querySelector('span').textContent;
    navigateTo(viewName, title);
  });
});

themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  themeToggle.innerHTML = isDarkMode ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
  renderIcons();
});

// App Initialization
const initApp = async () => {
  await initStore();
  renderIcons();
  navigateTo('dashboard', 'Tổng quan');
};

document.addEventListener('DOMContentLoaded', initApp);
