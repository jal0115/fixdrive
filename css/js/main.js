// ── Нэвтрэх логик ──
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'fixdrive2025';

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('fixdrive_auth', 'true');
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.textContent = 'Нэвтрэх нэр эсвэл нууц үг буруу байна.';
    }
  });
}

// ── Dashboard хамгаалалт ──
const isDashboard = document.getElementById('dashboardPage');

if (isDashboard) {
  const auth = sessionStorage.getItem('fixdrive_auth');
  if (!auth) {
    window.location.href = 'index.html';
  }
}

// ── Гарах ──
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', function () {
    sessionStorage.removeItem('fixdrive_auth');
    window.location.href = 'index.html';
  });
}

// ── Захиалгын форм ──
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Илгээж байна...';
    submitBtn.disabled = true;

    const bookingData = {
      customer_name: document.getElementById('customerName').value.trim(),
      phone_number: document.getElementById('phoneNumber').value.trim(),
      car_brand: document.getElementById('carBrand').value.trim(),
      car_plate: document.getElementById('carPlate').value.trim(),
      service_type: document.getElementById('serviceType').value,
      booking_date: document.getElementById('bookingDate').value,
      booking_time: document.getElementById('bookingTime').value,
    };

    const { error } = await supabase
      .from('bookings')
      .insert([bookingData]);

    if (error) {
      alert('Алдаа гарлаа: ' + error.message);
      submitBtn.textContent = 'Захиалга илгээх';
      submitBtn.disabled = false;
      return;
    }

    // ── Амжилттай ──
    document.getElementById('successModal').classList.remove('hidden');
    bookingForm.reset();
    submitBtn.textContent = 'Захиалга илгээх';
    submitBtn.disabled = false;
  });
}

// ── Modal хаах ──
const modalCloseBtn = document.getElementById('modalCloseBtn');

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', function () {
    document.getElementById('successModal').classList.add('hidden');
  });
}

// ════════════════════════════
// DRAWER
// ════════════════════════════
const openBookingBtn = document.getElementById('openBookingBtn');
const bookingDrawer  = document.getElementById('bookingDrawer');
const drawerOverlay  = document.getElementById('drawerOverlay');
const drawerClose    = document.getElementById('drawerClose');

function openDrawer() {
  bookingDrawer.classList.remove('hidden');
  drawerOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  bookingDrawer.classList.add('hidden');
  drawerOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

if (openBookingBtn) openBookingBtn.addEventListener('click', openDrawer);
if (drawerClose)    drawerClose.addEventListener('click', closeDrawer);
if (drawerOverlay)  drawerOverlay.addEventListener('click', closeDrawer);

// Ажлын цаг шалгах
const timeVal  = bookingTime;
const [h, m]   = timeVal.split(':').map(Number);
const totalMin = h * 60 + m;

if (totalMin < 9 * 60 || totalMin > 18 * 60 + 30) {
  errorMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Ажлын цаг 09:00–18:30 байна. Өөр цаг сонгоно уу.';
  return;
}

// ════════════════════════════
// ҮЙЛЧИЛГЭЭНИЙ ҮНЭ ТООЦООЛОЛ
// ════════════════════════════
function calcPrice(services) {
  const prices = {
    'Тос солиулах': 0,
    'Тэнхлэгийн тохиргоо': 50000,
    'Явах эд ангийн оношилгоо': 30000,
    'Цэгэн тосолгоо': 30000,
    'Хөргөлтийн шингэн солих': 40000,
    'Ерөнхий үзлэг': 0,
    'Эд анги солих': 40000,
  };
  const list = services.split(',').map(s => s.trim());
  return list.reduce((sum, s) => sum + (prices[s] || 0), 0);
}

function formatPrice(num) {
  return num.toLocaleString('mn-MN') + '₮';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}

// ════════════════════════════
// ТҮҮХИЙН DRAWER
// ════════════════════════════
const openHistoryBtn = document.getElementById('openHistoryBtn');
const historyDrawer  = document.getElementById('historyDrawer');
const historyOverlay = document.getElementById('historyOverlay');
const historyClose   = document.getElementById('historyClose');
const historyBody    = document.getElementById('historyBody');

function openHistoryDrawer() {
  historyDrawer.classList.remove('hidden');
  historyOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  loadHistory();
}

function closeHistoryDrawer() {
  historyDrawer.classList.add('hidden');
  historyOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

if (openHistoryBtn) openHistoryBtn.addEventListener('click', openHistoryDrawer);
if (historyClose)   historyClose.addEventListener('click', closeHistoryDrawer);
if (historyOverlay) historyOverlay.addEventListener('click', closeHistoryDrawer);

async function loadHistory() {
  historyBody.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Ачааллаж байна...</div>';

  const user = JSON.parse(sessionStorage.getItem('fixdrive_user') || '{}');

  const { data, error } = await supabase
    .from('service_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    historyBody.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <p>Үйлчилгээний түүх байхгүй байна.</p>
      </div>`;
    return;
  }

  const total = data.reduce((sum, h) => sum + (h.total_price || 0), 0);

  let html = `
    <div class="history-total-bar">
      <span class="total-label">
        <i class="fa-solid fa-receipt"></i> Нийт зарцуулсан
      </span>
      <span class="total-value">${formatPrice(total)}</span>
    </div>`;

  data.forEach(h => {
    const isPending = !h.completed;
    html += `
      <div class="history-card">
        <div class="history-card-header">
          <span class="date">
            <i class="fa-regular fa-calendar"></i>
            ${formatDate(h.booking_date)} ${h.booking_time ? h.booking_time.slice(0,5) : ''}
          </span>
          <span class="history-status ${isPending ? 'pending' : 'done'}">
            <i class="fa-solid fa-${isPending ? 'hourglass-half' : 'circle-check'}"></i>
            ${isPending ? 'Хүлээгдэж байна' : 'Дууссан'}
          </span>
        </div>
        <div class="history-card-body">
          <div class="history-meta">
            <span class="label">Нэр</span>
            <span class="value">${h.customer_name}</span>
          </div>
          <div class="history-meta">
            <span class="label">Машин</span>
            <span class="value">${h.car_brand} · ${h.car_plate}</span>
          </div>
          <div class="history-services">
            <i class="fa-solid fa-list-check" style="color:var(--blue);margin-right:6px"></i>
            ${h.service_type}
          </div>
          <div class="history-price">
            <span class="price-label">Үнийн дүн</span>
            <span class="price-value">${formatPrice(h.total_price || 0)}</span>
          </div>
        </div>
      </div>`;
  });

  historyBody.innerHTML = html;
}

// ════════════════════════════
// BADGE DRAWER
// ════════════════════════════
const openBadgeBtn = document.getElementById('openBadgeBtn');
const badgeDrawer  = document.getElementById('badgeDrawer');
const badgeOverlay = document.getElementById('badgeOverlay');
const badgeClose   = document.getElementById('badgeClose');
const badgeBody    = document.getElementById('badgeBody');

function openBadgeDrawer() {
  badgeDrawer.classList.remove('hidden');
  badgeOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  loadBadges();
}

function closeBadgeDrawer() {
  badgeDrawer.classList.add('hidden');
  badgeOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

if (openBadgeBtn) openBadgeBtn.addEventListener('click', openBadgeDrawer);
if (badgeClose)   badgeClose.addEventListener('click', closeBadgeDrawer);
if (badgeOverlay) badgeOverlay.addEventListener('click', closeBadgeDrawer);

async function loadBadges() {
  badgeBody.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Ачааллаж байна...</div>';

  const user = JSON.parse(sessionStorage.getItem('fixdrive_user') || '{}');

  // Нийт зарцуулсан мэдээлэл авах
  const { data: history } = await supabase
    .from('service_history')
    .select('total_price');

  const total = (history || []).reduce((sum, h) => sum + (h.total_price || 0), 0);

  // Badge-ын тодорхойлолт
  const badges = [
    {
      key: 'new',
      name: 'Шинэ Үйлчлүүлэгч',
      threshold: 100000,
      icon: '🥉',
      iconClass: 'bronze',
      rewards: ['Явах эд ангийн оношилгоо — 1 удаа үнэгүй'],
    },
    {
      key: 'regular',
      name: 'Байнгын Үйлчлүүлэгч',
      threshold: 200000,
      icon: '🥈',
      iconClass: 'silver',
      rewards: ['Хөргөлтийн шингэн солиулах — 1 удаа үнэгүй'],
    },
    {
      key: 'vip',
      name: 'Эрхэм Үйлчлүүлэгч',
      threshold: 300000,
      icon: '🥇',
      iconClass: 'gold',
      rewards: ['Тэнхлэгийн тохиргоо — 1 удаа үнэгүй'],
    },
  ];

  // Одоогийн badge тодорхойлох
  let currentBadge = null;
  if (total >= 300000) currentBadge = 'vip';
  else if (total >= 200000) currentBadge = 'regular';
  else if (total >= 100000) currentBadge = 'new';

  // Дараагийн badge
  let nextThreshold = 100000;
  if (total >= 100000) nextThreshold = 200000;
  if (total >= 200000) nextThreshold = 300000;
  if (total >= 300000) nextThreshold = 300000;

  const progress = Math.min((total / nextThreshold) * 100, 100);

  // Badge мэдээлэл DB-с авах
  const { data: earnedBadges } = await supabase
    .from('user_badges')
    .select('*')
    .order('earned_at', { ascending: false });

  const earnedKeys = (earnedBadges || []).map(b => b.badge_type);

  const user2 = JSON.parse(sessionStorage.getItem('fixdrive_user') || '{}');

  let html = `
    <div class="badge-user-info">
      <div class="badge-user-avatar">
        <i class="fa-solid fa-user"></i>
      </div>
      <div>
        <div class="badge-user-name">${user2.name || 'Хэрэглэгч'}</div>
        <div class="badge-user-total">
          Нийт зарцуулсан: <span>${formatPrice(total)}</span>
        </div>
      </div>
    </div>

    <div class="badge-progress-wrap">
      <div class="badge-progress-label">
        <span>Явц</span>
        <span>${formatPrice(total)} / ${formatPrice(nextThreshold)}</span>
      </div>
      <div class="badge-progress-bar">
        <div class="badge-progress-fill" style="width:${progress}%"></div>
      </div>
    </div>

    <div class="drawer-section-title">
      <i class="fa-solid fa-trophy"></i> Badge-ууд
    </div>`;

  badges.forEach(b => {
    const isEarned = total >= b.threshold;
    const earnedData = (earnedBadges || []).find(e => e.badge_type === b.key);
    const expiresAt = earnedData ? new Date(earnedData.expires_at) : null;
    const rewardUsed = earnedData ? earnedData.reward_used : false;

    html += `
      <div class="badge-card ${isEarned ? 'earned' : 'locked'}">
        ${isEarned
          ? `<span class="badge-earned-tag"><i class="fa-solid fa-check"></i> Олгогдсон</span>`
          : `<span class="badge-locked-tag"><i class="fa-solid fa-lock"></i> Түгжигдсэн</span>`
        }
        <div class="badge-card-header">
          <div class="badge-icon-big ${b.iconClass}">${b.icon}</div>
          <div>
            <div class="badge-card-name">${b.name}</div>
            <div class="badge-card-threshold">${formatPrice(b.threshold)}-с дээш зарцуулсан</div>
          </div>
        </div>
        <div class="badge-rewards">
          <div class="badge-rewards-title">
            <i class="fa-solid fa-gift"></i> Олгох эрхүүд
          </div>
          ${b.rewards.map(r => `
            <div class="reward-item ${rewardUsed ? 'used' : ''}">
              <i class="fa-solid fa-${rewardUsed ? 'circle-xmark' : 'circle-check'}"></i>
              ${r}
            </div>`).join('')}
        </div>
        ${isEarned && expiresAt ? `
          <div class="badge-expires">
            <i class="fa-solid fa-hourglass-half"></i>
            Хүчинтэй: ${formatDate(expiresAt.toISOString().split('T')[0])} хүртэл
          </div>` : ''}
      </div>`;
  });

  badgeBody.innerHTML = html;
}

// ════════════════════════════
// ЗАХИАЛГА → ТҮҮХЭНД НЭМЭХ
// ════════════════════════════
async function addToHistory(bookingData) {
  const price = calcPrice(bookingData.service_type);
  const user  = JSON.parse(sessionStorage.getItem('fixdrive_user') || '{}');

  await supabase
    .from('service_history')
    .insert([{
      customer_name: bookingData.customer_name,
      phone_number:  bookingData.phone_number,
      car_brand:     bookingData.car_brand,
      car_plate:     bookingData.car_plate,
      service_type:  bookingData.service_type,
      booking_date:  bookingData.booking_date,
      booking_time:  bookingData.booking_time,
      total_price:   price,
    }]);

  // Badge шалгах
  await checkAndAwardBadge(price);
}

async function checkAndAwardBadge(newPrice) {
  const { data: history } = await supabase
    .from('service_history')
    .select('total_price');

  const total = (history || []).reduce((sum, h) => sum + (h.total_price || 0), 0);

  const { data: existing } = await supabase
    .from('user_badges')
    .select('badge_type');

  const earned = (existing || []).map(b => b.badge_type);

  const now     = new Date();
  const expires = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  if (total >= 100000 && !earned.includes('new')) {
    await supabase.from('user_badges').insert([{
      badge_type: 'new',
      expires_at: expires.toISOString(),
    }]);
    showBadgeToast('🥉', 'Шинэ Үйлчлүүлэгч badge олгогдлоо!');
  }

  if (total >= 200000 && !earned.includes('regular')) {
    await supabase.from('user_badges').insert([{
      badge_type: 'regular',
      expires_at: expires.toISOString(),
    }]);
    showBadgeToast('🥈', 'Байнгын Үйлчлүүлэгч badge олгогдлоо!');
  }

  if (total >= 300000 && !earned.includes('vip')) {
    await supabase.from('user_badges').insert([{
      badge_type: 'vip',
      expires_at: expires.toISOString(),
    }]);
    showBadgeToast('🥇', 'Эрхэм Үйлчлүүлэгч badge олгогдлоо!');
  }
}

// ════════════════════════════
// BADGE TOAST
// ════════════════════════════
function showBadgeToast(icon, message) {
  const toast = document.createElement('div');
  toast.className = 'badge-toast';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div>
      <div class="toast-label">Шинэ badge!</div>
      <div>${message}</div>
    </div>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}
