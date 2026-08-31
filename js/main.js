document.addEventListener('DOMContentLoaded', function () {

  // Supabase Client-ийг нэгдмэл байдлаар тодорхойлох
  const supabase = window._supabaseClient;

  // ════════════════════════════
  // AUTH TAB ШИЛЖИЛТ (Зассан)
  // ════════════════════════════
  const tabLogin      = document.getElementById('tabLogin');
  const tabRegister   = document.getElementById('tabRegister');
  const loginFormEl   = document.getElementById('loginForm');
  const registerForm  = document.getElementById('registerForm');

  if (tabLogin && tabRegister && loginFormEl && registerForm) {
    // Анх ачаалахад нэвтрэх формыг харуулна
    loginFormEl.classList.remove('hidden');
    registerForm.classList.add('hidden');

    tabLogin.addEventListener('click', function () {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      loginFormEl.classList.remove('hidden');
      registerForm.classList.add('hidden');
    });

    tabRegister.addEventListener('click', function () {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      registerForm.classList.remove('hidden');
      loginFormEl.classList.add('hidden');
    });
  }

  // ════════════════════════════
  // БҮРТГҮҮЛЭХ ЛОГИК
  // ════════════════════════════
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const lastName        = document.getElementById('regLastName').value.trim();
      const firstName       = document.getElementById('regFirstName').value.trim();
      const phone           = document.getElementById('regPhone').value.trim();
      const username        = document.getElementById('regUsername').value.trim();
      const password        = document.getElementById('regPassword').value.trim();
      const passwordConfirm = document.getElementById('regPasswordConfirm').value.trim();
      const errorEl         = document.getElementById('registerError');
      const successEl       = document.getElementById('registerSuccess');
      const submitBtn       = registerForm.querySelector('button[type="submit"]');

      errorEl.textContent   = '';
      successEl.textContent = '';

      if (!lastName || !firstName || !phone || !username || !password || !passwordConfirm) {
        errorEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Бүх талбарыг бөглөнө үү.';
        return;
      }
      if (password !== passwordConfirm) {
        errorEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Нууц үг таарахгүй байна.';
        return;
      }
      if (password.length < 6) {
        errorEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.';
        return;
      }
      if (phone.length < 8) {
        errorEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Утасны дугаар буруу байна.';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Бүртгэж байна...';

      if (!supabase) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Supabase холболт олдсонгүй!';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Бүртгүүлэх';
        return;
      }

      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (checkError) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Алдаа гарлаа: ' + checkError.message;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Бүртгүүлэх';
        return;
      }
      if (existing) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Энэ нэвтрэх нэр аль хэдийн бүртгэлтэй байна.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Бүртгүүлэх';
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert([{ last_name: lastName, first_name: firstName, phone, username, password }]);

      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Бүртгүүлэх';

      if (insertError) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Алдаа гарлаа: ' + insertError.message;
        return;
      }

      successEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Бүртгэл амжилттай! Нэвтрэх таб дээр дарж нэвтэрнэ үү.';
      registerForm.reset();
    });
  }

  // ════════════════════════════
  // НЭВТРЭХ ЛОГИК
  // ════════════════════════════
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', async function (e) {
      e.preventDefault();

      const username  = document.getElementById('username').value.trim();
      const password  = document.getElementById('password').value.trim();
      const errorEl   = document.getElementById('loginError');
      const submitBtn = loginFormEl.querySelector('button[type="submit"]');

      errorEl.textContent = '';
      submitBtn.disabled  = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Нэвтэрж байна...';

      if (username === 'admin' && password === 'fixdrive2025') {
        sessionStorage.setItem('fixdrive_auth', 'true');
        sessionStorage.setItem('fixdrive_user', JSON.stringify({ username: 'admin', name: 'Админ' }));
        window.location.href = 'dashboard.html';
        return;
      }

      if (!supabase) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Supabase холболт олдсонгүй!';
        submitBtn.disabled  = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Нэвтрэх';
        return;
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      submitBtn.disabled  = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Нэвтрэх';

      if (error || !user) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Нэвтрэх нэр эсвэл нууц үг буруу байна.';
        return;
      }

      sessionStorage.setItem('fixdrive_auth', 'true');
      sessionStorage.setItem('fixdrive_user', JSON.stringify({
        username: user.username,
        name: user.last_name + ' ' + user.first_name,
      }));
      window.location.href = 'dashboard.html';
    });
  }

  // ════════════════════════════
  // DASHBOARD ХАМГААЛАЛТ
  // ════════════════════════════
  const isDashboard = document.getElementById('dashboardPage');
  if (isDashboard) {
    if (!sessionStorage.getItem('fixdrive_auth')) {
      window.location.href = 'index.html';
    }
  }

  // ════════════════════════════
  // ГАРАХ
  // ════════════════════════════
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      sessionStorage.removeItem('fixdrive_auth');
      sessionStorage.removeItem('fixdrive_user');
      sessionStorage.removeItem('fixdrive_booking');
      window.location.href = 'index.html';
    });
  }

  // ════════════════════════════
  // NAVBAR PREVIEW
  // ════════════════════════════
  function loadBookingPreview() {
    const saved = sessionStorage.getItem('fixdrive_booking');
    if (!saved) return;
    const booking     = JSON.parse(saved);
    const preview     = document.getElementById('bookedPreview');
    const previewText = document.getElementById('previewText');
    if (preview && previewText) {
      previewText.textContent = `${booking.services} · ${booking.date} ${booking.time}`;
      preview.classList.remove('hidden');
    }
  }

  // ════════════════════════════
  // ЗАХИАЛГЫН DRAWER
  // ════════════════════════════
  const openBookingBtn  = document.getElementById('openBookingBtn');
  const openBookingBtn2 = document.getElementById('openBookingBtn2');
  const bookingDrawer   = document.getElementById('bookingDrawer');
  const bookingOverlay  = document.getElementById('bookingOverlay');
  const drawerClose     = document.getElementById('drawerClose');

  function openDrawer() {
    if (bookingDrawer && bookingOverlay) {
      bookingDrawer.classList.remove('hidden');
      bookingOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (bookingDrawer && bookingOverlay) {
      bookingDrawer.classList.add('hidden');
      bookingOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (openBookingBtn)  openBookingBtn.addEventListener('click', openDrawer);
  if (openBookingBtn2) openBookingBtn2.addEventListener('click', openDrawer);
  if (drawerClose)     drawerClose.addEventListener('click', closeDrawer);
  if (bookingOverlay)  bookingOverlay.addEventListener('click', closeDrawer);

  // ════════════════════════════
  // МЭДЭЭЛЛИЙН DRAWER
  // ════════════════════════════
  const openInfoBtn = document.getElementById('openInfoBtn');
  const infoDrawer  = document.getElementById('infoDrawer');
  const infoOverlay = document.getElementById('infoOverlay');
  const infoClose   = document.getElementById('infoClose');

  function openInfoDrawer() {
    if (infoDrawer && infoOverlay) {
      infoDrawer.classList.remove('hidden');
      infoOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeInfoDrawer() {
    if (infoDrawer && infoOverlay) {
      infoDrawer.classList.add('hidden');
      infoOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (openInfoBtn) openInfoBtn.addEventListener('click', openInfoDrawer);
  if (infoClose)   infoClose.addEventListener('click', closeInfoDrawer);
  if (infoOverlay) infoOverlay.addEventListener('click', closeInfoDrawer);

  // ════════════════════════════
  // ЗАХИАЛГЫН ФОРМ
  // ════════════════════════════
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    loadBookingPreview();

    bookingForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const errorMsg  = document.getElementById('errorMsg');
      const submitBtn = document.getElementById('submitBtn');

      const customerName = document.getElementById('customerName').value.trim();
      const phoneNumber  = document.getElementById('phoneNumber').value.trim();
      const carBrand     = document.getElementById('carBrand').value.trim();
      const carPlate     = document.getElementById('carPlate').value.trim();
      const bookingDate  = document.getElementById('bookingDate').value;
      const bookingTime  = document.getElementById('bookingTime').value;

      const checked          = document.querySelectorAll('#serviceSelect input[type="checkbox"]:checked');
      const selectedServices = Array.from(checked).map(cb => cb.value);

      if (!customerName || !phoneNumber || !carBrand || !carPlate || !bookingDate || !bookingTime) {
        errorMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Бүх талбарыг бөглөнө үү.';
        return;
      }
      if (selectedServices.length === 0) {
        errorMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Дор хаяж нэг үйлчилгээ сонгоно уу.';
        return;
      }

      const [h, m]   = bookingTime.split(':').map(Number);
      const totalMin = h * 60 + m;
      if (totalMin < 9 * 60 || totalMin > 18 * 60 + 30) {
        errorMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Ажлын цаг 09:00–18:30 байна. Өөр цаг сонгоно уу.';
        return;
      }

      errorMsg.textContent = '';
      submitBtn.disabled   = true;
      submitBtn.innerHTML  = '<i class="fa-solid fa-spinner fa-spin"></i> Илгээж байна...';

      const serviceType = selectedServices.join(', ');

      if (!supabase) {
        errorMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Supabase холболт олдсонгүй!';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Захиалга илгээх';
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .insert([{
          customer_name: customerName,
          phone_number:  phoneNumber,
          car_brand:     carBrand,
          car_plate:     carPlate,
          service_type:  serviceType,
          booking_date:  bookingDate,
          booking_time:  bookingTime,
        }]);

      submitBtn.disabled  = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Захиалга илгээх';

      if (error) {
        errorMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Алдаа гарлаа: ' + error.message;
        return;
      }

      await addToHistory({
        customer_name: customerName,
        phone_number:  phoneNumber,
        car_brand:     carBrand,
        car_plate:     carPlate,
        service_type:  serviceType,
        booking_date:  bookingDate,
        booking_time:  bookingTime,
      });

      sessionStorage.setItem('fixdrive_booking', JSON.stringify({
        services: serviceType,
        date:     bookingDate,
        time:     bookingTime,
      }));

      bookingForm.reset();
      loadBookingPreview();
      closeDrawer();
      const successModal = document.getElementById('successModal');
      if (successModal) successModal.classList.remove('hidden');
    });
  }

  // ════════════════════════════
  // SUCCESS MODAL
  // ════════════════════════════
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function () {
      const successModal = document.getElementById('successModal');
      if (successModal) successModal.classList.add('hidden');
    });
  }

  // ════════════════════════════
  // ЦУЦЛАХ ЛОГИК
  // ════════════════════════════
  const cancelBookingBtn = document.getElementById('cancelBookingBtn');
  if (cancelBookingBtn) {
    cancelBookingBtn.addEventListener('click', function () {
      const cancelModal = document.getElementById('cancelModal');
      if (cancelModal) cancelModal.classList.remove('hidden');
    });
  }

  const cancelNoBtn = document.getElementById('cancelNoBtn');
  if (cancelNoBtn) {
    cancelNoBtn.addEventListener('click', function () {
      const cancelModal = document.getElementById('cancelModal');
      if (cancelModal) cancelModal.classList.add('hidden');
    });
  }

  const cancelYesBtn = document.getElementById('cancelYesBtn');
  if (cancelYesBtn) {
    cancelYesBtn.addEventListener('click', function () {
      sessionStorage.removeItem('fixdrive_booking');
      const preview = document.getElementById('bookedPreview');
      if (preview) preview.classList.add('hidden');
      const cancelModal = document.getElementById('cancelModal');
      if (cancelModal) cancelModal.classList.add('hidden');
      const cancelledModal = document.getElementById('cancelledModal');
      if (cancelledModal) cancelledModal.classList.remove('hidden');
    });
  }

  const cancelledCloseBtn = document.getElementById('cancelledCloseBtn');
  if (cancelledCloseBtn) {
    cancelledCloseBtn.addEventListener('click', function () {
      const cancelledModal = document.getElementById('cancelledModal');
      if (cancelledModal) cancelledModal.classList.add('hidden');
    });
  }

  // ════════════════════════════
  // ҮНЭ ТООЦООЛОЛ
  // ════════════════════════════
  function calcPrice(services) {
    const prices = {
      'Тос солиулах':              0,
      'Тэнхлэгийн тохиргоо':      50000,
      'Явах эд ангийн оношилгоо': 30000,
      'Цэгэн тосолгоо':           30000,
      'Хөргөлтийн шингэн солих':  40000,
      'Ерөнхий үзлэг':            0,
      'Эд анги солих':            40000,
    };
    return services.split(',').map(s => s.trim()).reduce((sum, s) => sum + (prices[s] || 0), 0);
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
    if (historyDrawer && historyOverlay) {
      historyDrawer.classList.remove('hidden');
      historyOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      loadHistory();
    }
  }

  function closeHistoryDrawer() {
    if (historyDrawer && historyOverlay) {
      historyDrawer.classList.add('hidden');
      historyOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (openHistoryBtn) openHistoryBtn.addEventListener('click', openHistoryDrawer);
  if (historyClose)   historyClose.addEventListener('click', closeHistoryDrawer);
  if (historyOverlay) historyOverlay.addEventListener('click', closeHistoryDrawer);

  async function loadHistory() {
    if (!historyBody) return;
    historyBody.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Ачааллаж байна...</div>';

    if (!supabase) {
      historyBody.innerHTML = '<div class="empty-state"><p>Supabase холболт олдсонгүй.</p></div>';
      return;
    }

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
        <span class="total-label"><i class="fa-solid fa-receipt"></i> Нийт зарцуулсан</span>
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
    if (badgeDrawer && badgeOverlay) {
      badgeDrawer.classList.remove('hidden');
      badgeOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      loadBadges();
    }
  }

  function closeBadgeDrawer() {
    if (badgeDrawer && badgeOverlay) {
      badgeDrawer.classList.add('hidden');
      badgeOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (openBadgeBtn) openBadgeBtn.addEventListener('click', openBadgeDrawer);
  if (badgeClose)   badgeClose.addEventListener('click', closeBadgeDrawer);
  if (badgeOverlay) badgeOverlay.addEventListener('click', closeBadgeDrawer);

  async function loadBadges() {
    if (!badgeBody) return;
    badgeBody.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Ачааллаж байна...</div>';

    if (!supabase) {
      badgeBody.innerHTML = '<div class="empty-state"><p>Supabase холболт олдсонгүй.</p></div>';
      return;
    }

    const { data: history } = await supabase
      .from('service_history')
      .select('total_price');

    const total = (history || []).reduce((sum, h) => sum + (h.total_price || 0), 0);

    const badges = [
      { key: 'new',     name: 'Шинэ Үйлчлүүлэгч',    threshold: 100000, icon: '🥉', iconClass: 'bronze', rewards: ['Явах эд ангийн оношилгоо — 1 удаа үнэгүй'] },
      { key: 'regular', name: 'Байнгын Үйлчлүүлэгч',  threshold: 200000, icon: '🥈', iconClass: 'silver', rewards: ['Хөргөлтийн шингэн солиулах — 1 удаа үнэгүй'] },
      { key: 'vip',     name: 'Эрхэм Үйлчлүүлэгч',    threshold: 300000, icon: '🥇', iconClass: 'gold',   rewards: ['Тэнхлэгийн тохиргоо — 1 удаа үнэгүй'] },
    ];

    let nextThreshold = 100000;
    if (total >= 100000) nextThreshold = 200000;
    if (total >= 200000) nextThreshold = 300000;
    if (total >= 300000) nextThreshold = 300000;

    const progress = Math.min((total / nextThreshold) * 100, 100);

    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('*')
      .order('earned_at', { ascending: false });

    const user2 = JSON.parse(sessionStorage.getItem('fixdrive_user') || '{}');

    let html = `
      <div class="badge-user-info">
        <div class="badge-user-avatar"><i class="fa-solid fa-user"></i></div>
        <div>
          <div class="badge-user-name">${user2.name || 'Хэрэглэгч'}</div>
          <div class="badge-user-total">Нийт зарцуулсан: <span>${formatPrice(total)}</span></div>
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
      const isEarned   = total >= b.threshold;
      const earnedData = (earnedBadges || []).find(e => e.badge_type === b.key);
      const expiresAt  = earnedData ? new Date(earnedData.expires_at) : null;
      const rewardUsed = earnedData ? earnedData.reward_used : false;

      html += `
        <div class="badge-card ${isEarned ? 'earned' : 'locked'}">
          ${isEarned
            ? `<span class="badge-earned-tag"><i class="fa-solid fa-check"></i> Олгогдсон</span>`
            : `<span class="badge-locked-tag"><i class="fa-solid fa-lock"></i> Түгжигдсэн</span>`}
          <div class="badge-card-header">
            <div class="badge-icon-big ${b.iconClass}">${b.icon}</div>
            <div>
              <div class="badge-card-name">${b.name}</div>
              <div class="badge-card-threshold">${formatPrice(b.threshold)}-с дээш зарцуулсан</div>
            </div>
          </div>
          <div class="badge-rewards">
            <div class="badge-rewards-title"><i class="fa-solid fa-gift"></i> Олгох эрхүүд</div>
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
  // ТҮҮХЭНД НЭМЭХ
  // ════════════════════════════
  async function addToHistory(bookingData) {
    if (!supabase) return;
    const price = calcPrice(bookingData.service_type);
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
    await checkAndAwardBadge();
  }

  async function checkAndAwardBadge() {
    if (!supabase) return;

    const { data: history } = await supabase
      .from('service_history')
      .select('total_price');

    const total = (history || []).reduce((sum, h) => sum + (h.total_price || 0), 0);

    const { data: existing } = await supabase
      .from('user_badges')
      .select('badge_type');

    const earned  = (existing || []).map(b => b.badge_type);
    const now     = new Date();
    const expires = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    if (total >= 100000 && !earned.includes('new')) {
      await supabase.from('user_badges').insert([{ badge_type: 'new', expires_at: expires.toISOString() }]);
      showBadgeToast('🥉', 'Шинэ Үйлчлүүлэгч badge олгогдлоо!');
    }
    if (total >= 200000 && !earned.includes('regular')) {
      await supabase.from('user_badges').insert([{ badge_type: 'regular', expires_at: expires.toISOString() }]);
      showBadgeToast('🥈', 'Байнгын Үйлчлүүлэгч badge олгогдлоо!');
    }
    if (total >= 300000 && !earned.includes('vip')) {
      await supabase.from('user_badges').insert([{ badge_type: 'vip', expires_at: expires.toISOString() }]);
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
      toast.style.opacity    = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

});
