const imageUpload = document.getElementById("imageUpload"); 
const analyzeBtn = document.getElementById("analyzeBtn");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");
const resultText = document.getElementById("resultText");

let uploadedImage = null;

// Constants
const TARGET_D_LINE_Y = 520; // Position of the D line on your actual glass

// Upload image
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      uploadedImage = img;
    };
    img.src = event.target.result;
  };

  if (file) reader.readAsDataURL(file);
});

// Scoring logic
function scoreBeerAlignment(detectedY) {
  const distance = Math.abs(TARGET_D_LINE_Y - detectedY);
  let score = 0;
  if (distance <= 2) score = 100;
  else if (distance <= 8) score = 85;
  else if (distance <= 15) score = 60;
  else if (distance <= 25) score = 40;
  else score = 0;

  const message = getScoringMessage(score);
  return { score, message, distance };
}

function getScoringMessage(score) {
  if (score >= 98) return "You nailed it. Dead center D.";
  if (score >= 85) return "So close – you grazed the D.";
  if (score >= 60) return "You tried. It’s respectable.";
  if (score >= 40) return "Just missed. D's over there.";
  return "You missed the D like it owed you money.";
}

function drawScoreOverlay(ctx, canvas, score, message, detectedY) {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, 60);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(message, 20, 55);

  // Detected beer line (yellow)
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, detectedY);
  ctx.lineTo(canvas.width, detectedY);
  ctx.stroke();

  // D target line (red)
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(0, TARGET_D_LINE_Y);
  ctx.lineTo(canvas.width, TARGET_D_LINE_Y);
  ctx.stroke();
}

// Simulate detection for now
analyzeBtn.addEventListener("click", () => {
  if (!uploadedImage) {
    alert("Upload an image first.");
    return;
  }

  // 🔧 Placeholder for future detection logic
  const simulatedBeerLineY = 537;

  // Redraw image
  ctx.drawImage(uploadedImage, 0, 0);

  const { score, message } = scoreBeerAlignment(simulatedBeerLineY);
  drawScoreOverlay(ctx, canvas, score, message, simulatedBeerLineY);
  resultText.textContent = `Score: ${score} – ${message}`;
});
