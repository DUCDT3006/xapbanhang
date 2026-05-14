import { getStore, formatCurrency } from '../core/store.js';

export const renderPOS = () => {
  const store = getStore();
  const productsHtml = store.products.map(p => `
    <div class="product-card glass-panel" onclick="window.addToCart('${p.id}')">
      <div class="product-info">
        <h4>${p.name}</h4>
        <span class="text-primary font-bold">${formatCurrency(p.price)}</span>
      </div>
      <div class="product-stock text-muted text-sm">Tồn: ${p.stock}</div>
    </div>
  `).join('');

  return `
    <div class="pos-container fade-in">
      <!-- Left side: Products -->
      <div class="pos-products glass-panel">
        <div class="pos-search">
          <i data-lucide="search"></i>
          <input type="text" placeholder="Tìm kiếm mặt hàng hoặc quét mã vạch..." id="pos-search-input">
        </div>
        <div class="products-grid">
          ${productsHtml}
        </div>
      </div>

      <!-- Right side: Cart & Checkout -->
      <div class="pos-cart glass-panel">
        <button class="btn-icon mobile-cart-close" onclick="window.toggleCart(false)" style="position: absolute; top: 1rem; right: 1rem; z-index: 10; display: none; background: var(--bg-panel-solid); box-shadow: var(--shadow-sm);"><i data-lucide="x"></i></button>
        <div class="cart-header" style="flex-direction: column; align-items: stretch; gap: 1rem; padding-top: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>Đơn hàng <span class="badge" id="cart-count">0</span></h3>
            <button class="btn-icon text-danger" title="Xóa toàn bộ" onclick="window.clearCart()"><i data-lucide="trash-2"></i></button>
          </div>
          <div class="customer-select" style="display: flex; gap: 0.5rem; align-items: center;">
            <i data-lucide="user" class="text-muted" style="width: 18px;"></i>
            <select id="pos-customer" style="flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border-color); background: var(--bg-panel-solid); color: var(--text-main); outline: none;">
              <option value="">Khách lẻ (Không lưu thông tin)</option>
              ${store.customers.map(c => `<option value="${c.id}">${c.name} - ${c.phone}</option>`).join('')}
            </select>
            <button class="btn-icon" title="Thêm khách mới" onclick="window.openCustomerModal()"><i data-lucide="user-plus" style="width: 18px;"></i></button>
          </div>
        </div>
        
        <div class="cart-items" id="cart-items-container">
          <div class="empty-cart-msg text-muted">Chưa có sản phẩm nào</div>
          <!-- Cart items will be injected here -->
        </div>

        <div class="cart-summary" style="overflow-y: auto; max-height: 40vh; padding-bottom: 0.5rem;">
          <div class="summary-row">
            <span>Tổng tiền hàng:</span>
            <span id="cart-subtotal" style="font-size: 1.1rem;">0₫</span>
          </div>
          <div class="summary-row">
            <span>Giảm giá (Voucher):</span>
            <input type="number" placeholder="0" class="discount-input" id="cart-discount" onchange="window.updateCartUI()" onkeyup="window.updateCartUI()" style="width: 150px; font-size: 1rem; padding: 0.4rem;">
          </div>
          <div class="summary-row total">
            <span>Khách cần trả:</span>
            <span id="cart-total" class="text-primary" style="font-size: 1.4rem;">0₫</span>
          </div>
          <div class="summary-row" style="margin-top: 1rem;">
            <span>Khách thanh toán:</span>
            <input type="number" placeholder="Nhập số tiền..." class="discount-input" style="width: 150px; font-size: 1rem; padding: 0.4rem;" id="cart-paid" onkeyup="window.updateCartUI()">
          </div>
          <div class="summary-row">
            <span class="text-danger" style="font-size: 1rem;">Còn nợ:</span>
            <span id="cart-debt" class="text-danger font-bold" style="font-size: 1.2rem;">0₫</span>
          </div>
          <div class="summary-row" style="margin-top: 0.5rem; border-top: 1px dashed var(--border-color); padding-top: 1rem;">
            <span>Giao hàng (Ship):</span>
            <select id="cart-shipping" class="discount-input" style="width: 150px; text-align: left; font-size: 1rem; padding: 0.4rem;">
              <option value="Chưa ship">Chưa ship</option>
              <option value="Đã ship">Đã ship</option>
              <option value="Đổi trả">Đổi trả</option>
            </select>
          </div>
          <div class="summary-row" style="margin-top: 1rem; flex-direction: column; align-items: flex-start; gap: 0.5rem;">
            <span>Ghi chú / Yêu cầu (Thiếu hàng...):</span>
            <textarea id="cart-note" class="discount-input" style="width: 100%; height: 60px; text-align: left; resize: none; font-size: 1rem; padding: 0.5rem;" placeholder="Khách hẹn T7 giao, nợ 1 áo thun..."></textarea>
          </div>
        </div>

        <div class="cart-actions" style="border-top: 1px solid var(--border-color); background: var(--bg-panel-solid); padding: 1rem 1.5rem;">
          <button class="btn btn-secondary flex-1" style="font-size: 1.1rem; padding: 1rem;" onclick="window.openVietQRModal()"><i data-lucide="qr-code"></i> VietQR</button>
          <button class="btn btn-primary flex-2" style="font-size: 1.1rem; padding: 1rem;" onclick="window.checkout()"><i data-lucide="credit-card"></i> THANH TOÁN</button>
        </div>
      </div>

      <!-- Mobile Floating Cart Toggle -->
      <button class="btn btn-primary mobile-cart-toggle" onclick="window.toggleCart(true)" style="display: none;">
        <i data-lucide="shopping-cart"></i>
        <span>Giỏ hàng (<span id="mobile-cart-count">0</span>)</span>
      </button>
    </div>

    <!-- Add Customer Modal -->
    <div id="customer-modal" class="modal-overlay" style="display: none;">
      <div class="modal-content glass-panel fade-in">
        <div class="modal-header">
          <h3>Thêm thông tin Khách hàng</h3>
          <button class="btn-icon" onclick="window.closeCustomerModal()"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Họ và Tên *</label>
              <input type="text" id="new-cust-name" class="form-control" placeholder="Nguyễn Văn A">
            </div>
            <div class="form-group">
              <label>Số điện thoại *</label>
              <input type="text" id="new-cust-phone" class="form-control" placeholder="09...">
            </div>
            <div class="form-group">
              <label>Địa chỉ</label>
              <input type="text" id="new-cust-address" class="form-control" placeholder="123 Đường...">
            </div>
            <div class="form-group">
              <label>Giới tính</label>
              <select id="new-cust-gender" class="form-control">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div class="form-group">
              <label>Độ tuổi</label>
              <input type="number" id="new-cust-age" class="form-control" placeholder="VD: 30">
            </div>
            <div class="form-group">
              <label>Facebook</label>
              <input type="text" id="new-cust-fb" class="form-control" placeholder="Tên hoặc Link FB">
            </div>
            <div class="form-group">
              <label>Zalo</label>
              <input type="text" id="new-cust-zalo" class="form-control" placeholder="Số hoặc Tên Zalo">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="window.closeCustomerModal()">Hủy</button>
          <button class="btn btn-primary" onclick="window.saveNewCustomer()">Lưu Khách Hàng</button>
        </div>
      </div>
    </div>
  `;
};

window.toggleCart = (show) => {
  const container = document.querySelector('.pos-container');
  if (container) {
    if (show) container.classList.add('show-cart');
    else container.classList.remove('show-cart');
  }
};
