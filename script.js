const imageUpload = document.getElementById("imageUpload");
const beerNameInput = document.getElementById("beerName");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const analyzeBtn = document.getElementById("analyzeBtn");
const result = document.getElementById("result");
const tapInstruction = document.getElementById("tap-instruction");

let uploadedImage = null;
let beerLineY = null;

// Load image into canvas
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      overlay.onload = () => {
        ctx.drawImage(overlay, 0, 0, img.width, img.height);
      };

      uploadedImage = img;
      beerLineY = null;
      result.innerHTML = "";
      tapInstruction.style.display = "block";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Tap to mark beer line
canvas.addEventListener("click", (e) => {
  if (!uploadedImage) return;

  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  beerLineY = y;

  // Draw line where user tapped
  ctx.drawImage(uploadedImage, 0, 0);
  ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(0, beerLineY);
  ctx.lineTo(canvas.width, beerLineY);
  ctx.strokeStyle = "#00FF88";
  ctx.lineWidth = 3;
  ctx.stroke();
});

// Analyze button
analyzeBtn.addEventListener("click", () => {
  if (!uploadedImage || beerLineY === null) {
    result.innerHTML = "📍 Please upload and tap your beer line.";
    return;
  }

  const targetY = canvas.height * 0.67; // Position of the line in the "D" (~2/3 down)
  const diff = Math.abs(beerLineY - targetY);
  const threshold = canvas.height * 0.03; // ~3% margin

  let message = "";
  if (diff <= threshold) {
    message = `🎯 Nailed it! You lined up the D.`;
  } else if (diff <= threshold * 2) {
    message = `😎 Not bad. You're close to the D.`;
  } else {
    message = `👀 Way off. You missed the D.`;
  }

  const beerName = beerNameInput.value.trim();
  if (beerName) {
    message += `<br/><span style="font-size: 0.9em; opacity: 0.8;">🍺 Beer: ${beerName}</span>`;
  }

  result.innerHTML = message;
});
