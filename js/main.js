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

    const errorMsg = document.getElementById('errorMsg');
    const submitBtn = document.getElementById('submitBtn');

    // Утгуудыг цуглуул
    const customerName = document.getElementById('customerName').value.trim();
    const phoneNumber  = document.getElementById('phoneNumber').value.trim();
    const carBrand     = document.getElementById('carBrand').value.trim();
    const carPlate     = document.getElementById('carPlate').value.trim();
    const serviceType  = document.getElementById('serviceType').value;
    const bookingDate  = document.getElementById('bookingDate').value;
    const bookingTime  = document.getElementById('bookingTime').value;

    // Validation
    if (!customerName || !phoneNumber || !carBrand || !carPlate || !serviceType || !bookingDate || !bookingTime) {
      errorMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Бүх талбарыг бөглөнө үү.';
      return;
    }

    // Loading төлөв
    errorMsg.textContent = '';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Илгээж байна...';

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

    // Товч буцаах
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Захиалга илгээх';

    if (error) {
      errorMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Алдаа гарлаа: ' + error.message;
      return;
    }

    // Амжилттай
    bookingForm.reset();
    document.getElementById('successModal').classList.remove('hidden');
  });
}

// ── Modal хаах ──
const modalCloseBtn = document.getElementById('modalCloseBtn');
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', function () {
    document.getElementById('successModal').classList.add('hidden');
  });
}
