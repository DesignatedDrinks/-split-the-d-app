const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const overlay = document.getElementById('overlay');
const analyzeBtn = document.getElementById('analyzeBtn');
const result = document.getElementById('result');
const beerNameInput = document.getElementById('beerName');
const beerFill = document.getElementById('beerFill');
const loadingContainer = document.getElementById('loadingContainer');

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage.src = event.target.result;
    overlay.style.display = 'block';
    result.innerHTML = '';
  };
  reader.readAsDataURL(file);
});

analyzeBtn.addEventListener('click', () => {
  result.innerHTML = '';
  loadingContainer.style.display = 'block';
  beerFill.style.height = '0%';

  setTimeout(() => {
    beerFill.style.height = '85%';
  }, 100);

  setTimeout(() => {
    loadingContainer.style.display = 'none';
    const beerName = beerNameInput.value.trim();
    const randomScore = Math.floor(Math.random() * 101);
    let message = '';

    if (randomScore >= 90) {
      message = 'Legendary pour! You nailed it. 🍻';
    } else if (randomScore >= 70) {
      message = 'Pretty damn close. 🍺';
    } else if (randomScore >= 50) {
      message = 'Respectable effort, keep practicing.';
    } else {
      message = 'You missed the D. Again. 😅';
    }

    result.innerHTML = `
      <h3>Result for ${beerName || 'your beer'}:</h3>
      <p><strong>${randomScore}% accuracy</strong></p>
      <p>${message}</p>
    `;
  }, 2500);
});
