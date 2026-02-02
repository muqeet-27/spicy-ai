let currentUser = null;
let token = null;

async function apiCall(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(endpoint, { ...options, headers });
  return res.json();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;
  try {
    const data = await apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.removeItem('paymentId'); // Clear any previous payment ID
      alert('Login successful!');
      
      // Check if user has verified payment
      try {
        const statusRes = await fetch('/api/user/payment-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          }
        });
        
        if (!statusRes.ok) {
          console.log('Status check failed, redirecting to gallery');
          window.location.href = 'gallery.html';
          return;
        }
        
        const statusData = await statusRes.json();
        console.log('Payment status:', statusData);
        
        if (statusData.hasVerifiedPayment === true) {
          console.log('✅ Verified customer - going to main.html');
          window.location.href = 'main.html';
        } else {
          console.log('❌ New customer - going to gallery.html');
          window.location.href = 'gallery.html';
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        window.location.href = 'gallery.html';
      }
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = e.target[0].value;
  const email = e.target[1].value;
  const password = e.target[2].value;
  try {
    const data = await apiCall('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    alert(data.message);
    showLogin();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

function showRegister() {
  document.querySelector('.form-box.login').classList.remove('active');
  document.querySelector('.form-box.register').classList.add('active');
}

function showLogin() {
  document.querySelector('.form-box.register').classList.remove('active');
  document.querySelector('.form-box.login').classList.add('active');
}
