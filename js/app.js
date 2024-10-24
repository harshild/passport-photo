// Centralized paper sizes and custom size support
const pageSizes = {
    A4: {width: 210, height: 297},  // mm
    Letter: {width: 215.9, height: 279.4},  // mm
    Legal: {width: 215.9, height: 355.6},  // mm
    "4x6": {width: 101.6, height: 152.4},  // mm
    custom: {width: 0, height: 0}  // Custom sizes will be set dynamically
};

// DPI conversion factor (300 DPI)
const MM_TO_PX = 11.811;

// Global variables
let uploadedImage = null;
const imageWidthMM = 50.8;  // 2 inches (50.8mm)
const imageHeightMM = 50.8;

// DOM elements
const imageUpload = document.getElementById('imageUpload');
const paperSizeSelect = document.getElementById('paperSize');
const customWidthInput = document.getElementById('customWidth');
const customHeightInput = document.getElementById('customHeight');
const horizontalSpaceInput = document.getElementById('horizontalSpace');
const verticalSpaceInput = document.getElementById('verticalSpace');
const canvas = document.getElementById('collageCanvas');
const ctx = canvas.getContext('2d');
const generateCollageButton = document.getElementById('generateCollage');
const downloadCollageButton = document.getElementById('downloadCollage');

// Show/hide custom paper size inputs
paperSizeSelect.addEventListener('change', () => {
    const isCustom = paperSizeSelect.value === 'custom';
    document.getElementById('customPaperSizeInputs').style.display = isCustom ? 'block' : 'none';
});

// Handle image upload
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            uploadedImage = img;
        }
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

// Handle collage generation
generateCollageButton.addEventListener('click', () => {
    const selectedPaperSize = paperSizeSelect.value;
    let paperWidthMM, paperHeightMM;

    // If custom size is selected, get custom values
    if (selectedPaperSize === 'custom') {
        paperWidthMM = parseFloat(customWidthInput.value);
        paperHeightMM = parseFloat(customHeightInput.value);
    } else {
        paperWidthMM = pageSizes[selectedPaperSize].width;
        paperHeightMM = pageSizes[selectedPaperSize].height;
    }

    const horizontalSpaceMM = parseFloat(horizontalSpaceInput.value);
    const verticalSpaceMM = parseFloat(verticalSpaceInput.value);

    // Convert dimensions to pixels
    const paperWidthPX = paperWidthMM * MM_TO_PX;
    const paperHeightPX = paperHeightMM * MM_TO_PX;
    const horizontalSpacePX = horizontalSpaceMM * MM_TO_PX;
    const verticalSpacePX = verticalSpaceMM * MM_TO_PX;
    const imageWidthPX = imageWidthMM * MM_TO_PX;
    const imageHeightPX = imageHeightMM * MM_TO_PX;

    // Set canvas size
    canvas.width = paperWidthPX;
    canvas.height = paperHeightPX;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (uploadedImage) {
        // Calculate how many images can fit on the page, considering margins
        const cols = Math.floor((paperWidthPX + horizontalSpacePX) / (imageWidthPX + horizontalSpacePX));
        const rows = Math.floor((paperHeightPX + verticalSpacePX) / (imageHeightPX + verticalSpacePX));

        // Place images on the canvas
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * (imageWidthPX + horizontalSpacePX);
                const y = row * (imageHeightPX + verticalSpacePX);
                ctx.drawImage(uploadedImage, x, y, imageWidthPX, imageHeightPX);
            }
        }
    } else {
        alert('Please upload an image!');
    }
});

downloadCollageButton.addEventListener('click', () => {
    // Check if the canvas has content
    if (canvas.width === 0 || canvas.height === 0) {
        alert('Please generate a collage first!');
        return;
    }

    // Create an offscreen canvas to manipulate
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    const offscreenCtx = offscreenCanvas.getContext('2d');

    // Fill the offscreen canvas with white background
    offscreenCtx.fillStyle = 'white';
    offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // Draw the existing canvas content on top of the white background
    offscreenCtx.drawImage(canvas, 0, 0);

    // Convert the offscreen canvas to a JPEG data URL
    const dataURL = offscreenCanvas.toDataURL('image/jpeg', 1.0); // The second parameter is quality (1.0 is highest)

    // Create an invisible anchor element to trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'collage.jpeg';  // File name for the downloaded image

    // Programmatically click the anchor to trigger the download
    downloadLink.click();
});