// Check if user is logged in
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const userName = localStorage.getItem('userName');
const userEmail = localStorage.getItem('userEmail');
let selectedPlan = null;
let selectedAmount = null;
let paymentSubmitted = false;
let currentPaymentId = null;
let statusCheckInterval = null;

// Check if user has an existing payment on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedPaymentId = localStorage.getItem('paymentId');
  if (savedPaymentId) {
    currentPaymentId = savedPaymentId;
    paymentSubmitted = true;
    
    // Check status immediately
    checkPaymentStatus();
    
    // Start checking every 3 seconds
    statusCheckInterval = setInterval(checkPaymentStatus, 3000);
  }
});

// Check payment status 
function checkPaymentStatus() {
  if (!currentPaymentId) {
    console.log('No payment ID to check');
    return;
  }

  fetch(`/api/payment/status/${currentPaymentId}`)
    .then(res => {
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log('Payment status:', data.status);
      
      if (data.status === 'verified') {
        console.log('✅ Payment verified! Redirecting...');
        clearInterval(statusCheckInterval);
        
        // Clear payment ID from localStorage
        localStorage.removeItem('paymentId');
        
        document.getElementById('paymentForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('paymentStatus').style.display = 'block';
        
        // Redirect to main page after 2 seconds
        setTimeout(() => {
          window.location.href = 'main.html';
        }, 2000);
      } else if (data.status === 'rejected') {
        console.log('❌ Payment rejected');
        clearInterval(statusCheckInterval);
        showError('Your payment was rejected. Please try again.');
      }
    })
    .catch(err => {
      console.log('Checking payment status...');
    });
}

function selectPlan(element, plan, amount) {
  // Remove previous selection
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Add selection to clicked card
  element.classList.add('selected');
  element.querySelector('input[type="radio"]').checked = true;
  selectedPlan = plan;
  selectedAmount = amount;
}

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!selectedPlan) {
    showError('Please select a plan');
    return;
  }

  const transactionId = document.getElementById('transactionId').value;
  const utrNumber = document.getElementById('utrNumber').value;

  if (!transactionId || !utrNumber) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        plan: selectedPlan,
        amount: selectedAmount,
        transactionId,
        utrNumber,
        name: userName,
        email: userEmail
      })
    });

    const data = await response.json();

    if (response.ok) {
      paymentSubmitted = true;
      currentPaymentId = data.paymentId;
      localStorage.setItem('paymentId', data.paymentId);
      
      document.getElementById('paymentForm').style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
      document.getElementById('errorMessage').style.display = 'none';
      
      console.log('Payment submitted. ID:', data.paymentId);
      
      // Start checking status every 3 seconds
      if (statusCheckInterval) clearInterval(statusCheckInterval);
      statusCheckInterval = setInterval(checkPaymentStatus, 3000);
      checkPaymentStatus(); // Check immediately
    } else {
      showError(data.message || 'Error submitting payment');
    }
  } catch (error) {
    showError('Error: ' + error.message);
  }
});

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = '❌ ' + message;
  errorDiv.style.display = 'block';
}

function logout() {
  clearInterval(statusCheckInterval);
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('paymentId');
  window.location.href = 'index.html';
}
