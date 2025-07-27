const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const overlay = document.getElementById('overlay');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const result = document.getElementById('result');
const beerNameInput = document.getElementById('beerName');

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    uploadedImage.src = reader.result;
    overlay.style.display = 'block';

    uploadedImage.onload = () => {
      canvas.width = uploadedImage.naturalWidth;
      canvas.height = uploadedImage.naturalHeight;
      drawOverlay();
    };
  };
  reader.readAsDataURL(file);
});

document.getElementById('analyzeBtn').addEventListener('click', () => {
  if (!uploadedImage.src || uploadedImage.src === window.location.href) {
    result.innerText = 'Please upload an image first.';
    return;
  }

  const pourLineY = detectPourLine(); // placeholder, returns middle of image
  const dLineY = uploadedImage.height * 0.385; // adjust this if needed

  const distance = Math.abs(pourLineY - dLineY);
  let score = Math.max(0, 100 - distance);
  score = Math.round(score);

  const beer = beerNameInput.value.trim();
  let message = '';

  if (score > 90) {
    message = `Bang on. The D has been split. ${
      beer ? `With a ${beer}` : ''
    } 🍻`;
  } else if (score > 75) {
    message = `So close. A pour worthy of respect. ${
      beer ? `Drinking ${beer}?` : ''
    }`;
  } else {
    message = `The D remains unchallenged. Try again.`;
  }

  result.innerText = `Score: ${score}/100\n${message}`;
});

function drawOverlay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
  // Optional: overlay drawing on canvas if desired
}

function detectPourLine() {
  // Placeholder: assumes user’s pour is horizontal and centered
  return uploadedImage.height * 0.4;
}
