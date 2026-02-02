// Check token
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
  throw new Error('No token');
}

let attachedFiles = [];

// File input handling
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');

// Handle click on file input label
document.querySelector('.file-input-label').addEventListener('click', () => {
  fileInput.click();
});

// Handle file selection
fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        attachedFiles.push({
          name: file.name,
          size: file.size,
          data: event.target.result
        });
        displayFilePreview();
      };
      reader.readAsDataURL(file);
    } else {
      alert('⚠️ Only image files are allowed');
    }
  });
  fileInput.value = '';
});

// Drag and drop functionality
document.querySelector('.file-input-label').addEventListener('dragover', (e) => {
  e.preventDefault();
  e.currentTarget.style.background = 'rgba(255, 20, 147, 0.3)';
  e.currentTarget.style.borderColor = '#ff69b4';
});

document.querySelector('.file-input-label').addEventListener('dragleave', (e) => {
  e.currentTarget.style.background = 'rgba(255, 20, 147, 0.05)';
  e.currentTarget.style.borderColor = '#ff1493';
});

document.querySelector('.file-input-label').addEventListener('drop', (e) => {
  e.preventDefault();
  e.currentTarget.style.background = 'rgba(255, 20, 147, 0.05)';
  e.currentTarget.style.borderColor = '#ff1493';
  
  const files = Array.from(e.dataTransfer.files);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        attachedFiles.push({
          name: file.name,
          size: file.size,
          data: event.target.result
        });
        displayFilePreview();
      };
      reader.readAsDataURL(file);
    } else {
      alert('⚠️ Only image files are allowed');
    }
  });
});

function displayFilePreview() {
  if (attachedFiles.length === 0) {
    filePreview.classList.remove('active');
    filePreview.innerHTML = '';
    return;
  }

  filePreview.classList.add('active');
  filePreview.innerHTML = attachedFiles.map((file, index) => `
    <div class="preview-item">
      <img src="${file.data}" alt="preview" class="preview-thumb">
      <div class="preview-info">
        <div class="filename">${file.name}</div>
        <div class="filesize">${(file.size / 1024).toFixed(2)} KB</div>
      </div>
      <button type="button" class="remove-file-btn" onclick="removeFile(${index})">✕ Remove</button>
    </div>
  `).join('');
}

function removeFile(index) {
  attachedFiles.splice(index, 1);
  displayFilePreview();
}

document.getElementById('genForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const prompt = document.getElementById('prompt').value;
  const container = document.getElementById('imageContainer');
  const button = document.querySelector('#genForm button[type="submit"]');
  
  // Show processing message with spinner
  const processingDiv = document.createElement('div');
  processingDiv.id = 'processingMessage';
  processingDiv.style.cssText = 'text-align: center; padding: 30px; font-size: 18px; color: #666; background: #f0f0f0; border-radius: 8px; margin-top: 20px;';
  processingDiv.innerHTML = '<div class="spinner"></div><p style="margin-top: 20px;">Under processing... Please wait for 30 mins</p><p style="font-size: 14px; color: #999;">Processing ' + (attachedFiles.length > 0 ? attachedFiles.length + ' attached image(s) with your prompt' : 'your prompt') + '</p>';
  
  container.parentNode.insertBefore(processingDiv, container.nextSibling);
  button.disabled = true;
  button.textContent = 'Processing...';
  
  // Fake loading for 30 minutes (1800000 ms)
  setTimeout(() => {
    processingDiv.innerHTML = '<p style="color: #d9534f; font-weight: bold;">Sorry, the image cannot be processed.</p><p style="font-size: 14px; color: #999;">Please try again later.</p>';
    button.disabled = false;
    button.textContent = '✨ Generate Image';
  }, 1800000); // 30 minutes in milliseconds
});

function downloadImg() {
  const img = document.getElementById('generatedImg');
  const link = document.createElement('a');
  link.href = img.src;
  link.download = 'generated-image.png';
  link.click();
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('paymentId');
  window.location.href = 'index.html';
}
