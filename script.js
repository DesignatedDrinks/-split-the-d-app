const imageUpload = document.getElementById("imageUpload");
const beerName = document.getElementById("beerName");
const imageCanvas = document.getElementById("imageCanvas");
const ctx = imageCanvas.getContext("2d");
const result = document.getElementById("result");
const analyzeBtn = document.getElementById("analyzeBtn");

let uploadedImg = new Image();

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    uploadedImg.onload = function () {
      imageCanvas.width = uploadedImg.width;
      imageCanvas.height = uploadedImg.height;
      ctx.drawImage(uploadedImg, 0, 0);
    };
    uploadedImg.src = event.target.result;
  };
  if (file) reader.readAsDataURL(file);
});

analyzeBtn.addEventListener("click", () => {
  if (!uploadedImg.src) {
    result.innerHTML = "Upload a photo first!";
    return;
  }

  // --- Semi-Auto Scoring ---
  // Sample row near the center to find the average brightness (estimation of beer line)
  const yStart = Math.floor(imageCanvas.height * 0.6);
  const yEnd = Math.floor(imageCanvas.height * 0.8);
  const xMid = Math.floor(imageCanvas.width / 2);

  let bestY = 0;
  let maxContrast = 0;

  for (let y = yStart; y < yEnd; y++) {
    const pixel = ctx.getImageData(xMid, y, 1, 1).data;
    const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3;

    const pixelAbove = ctx.getImageData(xMid, y - 5, 1, 1).data;
    const brightnessAbove = (pixelAbove[0] + pixelAbove[1] + pixelAbove[2]) / 3;

    const contrast = Math.abs(brightness - brightnessAbove);

    if (contrast > maxContrast) {
      maxContrast = contrast;
      bestY = y;
    }
  }

  // Expected D-line position (roughly where overlay would sit)
  const expectedY = Math.floor(imageCanvas.height * 0.72);
  const distance = Math.abs(bestY - expectedY);
  const score = Math.max(0, 100 - distance); // crude % match

  let message = "";
  if (score > 90) {
    message = `🎯 Bullseye. Nailed it. (${score}%)`;
  } else if (score > 75) {
    message = `🔥 Close enough to count. (${score}%)`;
  } else if (score > 50) {
    message = `🥴 Almost... but not quite. (${score}%)`;
  } else {
    message = `🫣 Yikes. Not even close. (${score}%)`;
  }

  result.innerHTML = `
    <strong>${beerName.value || "Your beer"}</strong><br/>
    ${message}
  `;
});
