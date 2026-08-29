// ════════════════════════════
// НЭВТРЭХ ЛОГИК
// ════════════════════════════
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl  = document.getElementById('loginError');

    if (username === 'admin' && password === 'fixdrive2025') {
      sessionStorage.setItem('fixdrive_auth', 'true');
      window.location.href = 'dashboard.html';
    } else {
      errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Нэвтрэх нэр эсвэл нууц үг буруу байна.';
    }
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
    sessionStorage.removeItem('fixdrive_booking');
    window.location.href = 'index.html';
  });
}

// ════════════════════════════
// NAVBAR PREVIEW АЧААЛЛАХ
// ════════════════════════════
function loadBookingPreview() {
  const saved = sessionStorage.getItem('fixdrive_booking');
  if (!saved) return;

  const booking = JSON.parse(saved);
  const preview = document.getElementById('bookedPreview');
  const previewText = document.getElementById('previewText');

  if (preview && previewText) {
    previewText.textContent = `${booking.services} · ${booking.date} ${booking.time}`;
    preview.classList.remove('hidden');
  }
}

// ════════════════════════════
// ЗАХИАЛГЫН ФОРМ
// ════════════════════════════
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  loadBookingPreview();

  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const errorMsg = document.getElementById('errorMsg');
    const submitBtn = document.getElementById('submitBtn');

    // Утгуудыг цуглуул
    const customerName = document.getElementById('customerName').value.trim();
    const phoneNumber  = document.getElementById('phoneNumber').value.trim();
    const carBrand     = document.getElementById('carBrand').value.trim();
    const carPlate     = document.getElementById('carPlate').value.trim();
    const bookingDate  = document.getElementById('bookingDate').value;
    const bookingTime  = document.getElementById('bookingTime').value;

    // Олон үйлчилгээ цуглуул
    const checked = document.querySelectorAll('#serviceSelect input[type="checkbox"]:checked');
    const selectedServices = Array.from(checked).map(cb => cb.value);

    // Validation
    if (!customerName || !phoneNumber || !carBrand || !carPlate || !bookingDate || !bookingTime) {
      errorMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Бүх талбарыг бөглөнө үү.';
      return;
    }

    if (selectedServices.length === 0) {
      errorMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Дор хаяж нэг үйлчилгээ сонгоно уу.';
      return;
    }

    errorMsg.textContent = '';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Илгээж байна...';

    const serviceType = selectedServices.join(', ');

    // Supabase руу илгээх
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

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Захиалга илгээх';

    if (error) {
      errorMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Алдаа гарлаа: ' + error.message;
      return;
    }

    // Session-д хадгалах (preview-д харуулах)
    sessionStorage.setItem('fixdrive_booking', JSON.stringify({
      services: serviceType,
      date: bookingDate,
      time: bookingTime,
    }));

    // Форм цэвэрлэх
    bookingForm.reset();

    // Preview шинэчлэх
    loadBookingPreview();

    // Modal харуулах
    document.getElementById('successModal').classList.remove('hidden');
  });
}

// ════════════════════════════
// SUCCESS MODAL ХААХ
// ════════════════════════════
const modalCloseBtn = document.getElementById('modalCloseBtn');
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', function () {
    document.getElementById('successModal').classList.add('hidden');
  });
}

// ════════════════════════════
// ЦУЦЛАХ ЛОГИК
// ════════════════════════════
const cancelBookingBtn = document.getElementById('cancelBookingBtn');
if (cancelBookingBtn) {
  cancelBookingBtn.addEventListener('click', function () {
    document.getElementById('cancelModal').classList.remove('hidden');
  });
}

// Үгүй товч
const cancelNoBtn = document.getElementById('cancelNoBtn');
if (cancelNoBtn) {
  cancelNoBtn.addEventListener('click', function () {
    document.getElementById('cancelModal').classList.add('hidden');
  });
}

// Тийм, цуцлах товч
const cancelYesBtn = document.getElementById('cancelYesBtn');
if (cancelYesBtn) {
  cancelYesBtn.addEventListener('click', function () {
    // Session-аас устгах
    sessionStorage.removeItem('fixdrive_booking');

    // Preview нуух
    const preview = document.getElementById('bookedPreview');
    if (preview) preview.classList.add('hidden');

    // Cancel modal хаах
    document.getElementById('cancelModal').classList.add('hidden');

    // Цуцлагдлаа modal харуулах
    document.getElementById('cancelledModal').classList.remove('hidden');
  });
}

// Цуцлагдлаа modal хаах
const cancelledCloseBtn = document.getElementById('cancelledCloseBtn');
if (cancelledCloseBtn) {
  cancelledCloseBtn.addEventListener('click', function () {
    document.getElementById('cancelledModal').classList.add('hidden');
  });
}
