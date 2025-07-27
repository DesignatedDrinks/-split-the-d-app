// script.js

const imageUpload = document.getElementById("imageUpload");
const uploadedImage = document.getElementById("uploadedImage");
const overlay = document.getElementById("overlay");
const analyzeBtn = document.getElementById("analyzeBtn");
const result = document.getElementById("result");
const beerNameInput = document.getElementById("beerName");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    uploadedImage.src = event.target.result;
    uploadedImage.onload = () => {
      overlay.style.display = "block";
      canvas.width = uploadedImage.width;
      canvas.height = uploadedImage.height;
      drawOverlay();
    };
  };
  reader.readAsDataURL(file);
});

function drawOverlay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0);
  ctx.drawImage(overlay, 0, 0, uploadedImage.width, uploadedImage.height);
}

analyzeBtn.addEventListener("click", () => {
  const beerName = beerNameInput.value.trim();
  if (!uploadedImage.src) {
    result.innerText = "Upload your photo first.";
    return;
  }
  const analysisScore = Math.random(); // Simulated score for now
  let message = "";
  if (analysisScore > 0.8) {
    message = `🔥 Nailed it${beerName ? ", drinking " + beerName : ""}! You Split the D.`;
  } else if (analysisScore > 0.5) {
    message = `😎 Not bad${beerName ? ", drinking " + beerName : ""}. You're close to the D.`;
  } else {
    message = `😬 Missed it${beerName ? ", drinking " + beerName : ""}. Better luck next time.`;
  }
  result.innerText = message;
});
