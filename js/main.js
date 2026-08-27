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
