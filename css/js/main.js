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
      // Нэвтэрсэн тэмдэглэл
      sessionStorage.setItem('fixdrive_auth', 'true');
      // Dashboard руу шилжих
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.textContent = 'Нэвтрэх нэр эсвэл нууц үг буруу байна.';
    }

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

  });
}
