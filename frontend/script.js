/* ==========================================================
   SMART PLANT HEALTH ASSISTANT — SCRIPT
   Connects to an existing FastAPI backend at
   http://127.0.0.1:8000/predict
   ========================================================== */

(function () {
  "use strict";

  // =========================================================
  // CONFIG
  // =========================================================

  const API_URL = "http://127.0.0.1:8000/predict";
  const ASSISTANT_API_URL = "http://127.0.0.1:8000/assistant";

  const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  const HISTORY_KEY = "plantHealthScanHistory";
  const HISTORY_LIMIT = 20;

  const RING_CIRCUMFERENCE = 2 * Math.PI * 30;


  // =========================================================
  // DOM REFERENCES
  // =========================================================

  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const dropzoneContent =
    document.getElementById("dropzoneContent");

  const previewContent =
    document.getElementById("previewContent");

  const previewImageEl =
    document.getElementById("previewImage");

  const changeImageBtn =
    document.getElementById("changeImageBtn");

  const uploadError =
    document.getElementById("uploadError");

  const apiError =
    document.getElementById("apiError");

  const analyzeBtn =
    document.getElementById("analyzeBtn");

  const loadingRow =
    document.getElementById("loadingRow");

  const loadingText =
    document.getElementById("loadingText");


  // =========================================================
  // IMAGE QUALITY
  // =========================================================

  const imageQualityCard =
    document.getElementById("imageQualityCard");

  const qualityStatus =
    document.getElementById("qualityStatus");

  const qualityMessage =
    document.getElementById("qualityMessage");

  const qualityStatusDot =
    document.getElementById("qualityStatusDot");

  const qualityDetails =
    document.getElementById("qualityDetails");


  // =========================================================
  // RESULT REFERENCES
  // =========================================================

  const resultsPanel =
    document.getElementById("resultsPanel");

  const resultCropLabel =
    document.getElementById("resultCropLabel");

  const resultDiseaseName =
    document.getElementById("resultDiseaseName");

  const resultTechnicalName =
    document.getElementById("resultTechnicalName");

  const confidenceValue =
    document.getElementById("confidenceValue");

  const confidenceRing =
    document.getElementById("confidenceRing");


  // =========================================================
  // ESTIMATED DISEASE IMPACT
  // =========================================================

  const severityAssessment =
    document.getElementById("severityAssessment");

  const severityStatus =
    document.getElementById("severityStatus");

  const severityMessage =
    document.getElementById("severityMessage");

  const severityCoverage =
    document.getElementById("severityCoverage");

  const severityStatusDot =
    document.getElementById("severityStatusDot");


  // =========================================================
  // CONFIDENCE / UNCERTAINTY
  // =========================================================

  const confidenceAssessment =
    document.getElementById("confidenceAssessment");

  const confidenceStatus =
    document.getElementById("confidenceStatus");

  const confidenceMessage =
    document.getElementById("confidenceMessage");

  const confidenceGap =
    document.getElementById("confidenceGap");

  const confidenceStatusDot =
    document.getElementById("confidenceStatusDot");


  // =========================================================
  // TOP-3 PREDICTIONS
  // =========================================================

  /*
   * Your HTML currently has:
   *
   * <div class="top-predictions-section">
   *
   * and does not necessarily have an id called
   * "topPredictionsBlock".
   *
   * Therefore we use both options.
   */

  const topPredictionsBlock =
    document.getElementById("topPredictionsBlock") ||
    document.querySelector(".top-predictions-section");

  const topPredictions =
    document.getElementById("topPredictions");


  // =========================================================
  // GRAD-CAM
  // =========================================================

  const originalImageEl =
    document.getElementById("originalImage");

  const gradcamImageEl =
    document.getElementById("gradcamImage");

  const imageCompare =
    document.getElementById("imageCompare");


  // =========================================================
  // RECOMMENDATIONS
  // =========================================================

  const descriptionBlock =
    document.getElementById("descriptionBlock");

  const descriptionText =
    document.getElementById("descriptionText");

  const symptomsBlock =
    document.getElementById("symptomsBlock");

  const symptomsList =
    document.getElementById("symptomsList");

  const actionsBlock =
    document.getElementById("actionsBlock");

  const actionsList =
    document.getElementById("actionsList");

  const preventionBlock =
    document.getElementById("preventionBlock");

  const preventionList =
    document.getElementById("preventionList");


  // =========================================================
  // AI ASSISTANT
  // =========================================================

  const chatForm =
    document.getElementById("chatForm");

  const chatInput =
    document.getElementById("chatInput");


  // =========================================================
  // CROP HEALTH HUB
  // =========================================================

  const cropSelector =
    document.getElementById("cropSelector");

  const cropHealthContent =
    document.getElementById("cropHealthContent");

  const cropHealthEmpty =
    document.getElementById("cropHealthEmpty");

  const selectedCropName =
    document.getElementById("selectedCropName");

  const cropDiseaseCount =
    document.getElementById("cropDiseaseCount");

  const cropDiseaseGrid =
    document.getElementById("cropDiseaseGrid");


  // =========================================================
  // DISEASE COMPARISON
  // =========================================================

  const comparisonEmpty =
    document.getElementById("comparisonEmpty");

  const comparisonContent =
    document.getElementById("comparisonContent");

  const comparisonNote =
    document.getElementById("comparisonNote");

  const comparisonCards =
    document.getElementById("comparisonCards");


  // =========================================================
  // HISTORY
  // =========================================================

  const historyList =
    document.getElementById("historyList");

  const historyEmpty =
    document.getElementById("historyEmpty");

  const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");


  // =========================================================
  // STATE
  // =========================================================

  let selectedFile = null;
  let currentPrediction = null;

  /*
   * Prevents an old image-quality check from updating the
   * interface after the user selects another image.
   */

  let qualityCheckToken = 0;


  // =========================================================
  // NAVIGATION
  // =========================================================

  if (navToggle && navbar) {
    navToggle.addEventListener("click", () => {
      const isOpen =
        navbar.classList.toggle("nav-open");

      navToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });
  }


  document
    .querySelectorAll(".nav-links-mobile a")
    .forEach((link) => {
      link.addEventListener("click", () => {
        if (navbar) {
          navbar.classList.remove("nav-open");
        }

        if (navToggle) {
          navToggle.setAttribute(
            "aria-expanded",
            "false"
          );
        }
      });
    });


  // =========================================================
  // FILE SELECTION
  // =========================================================

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => {
      fileInput.click();
    });


    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
  }


  if (changeImageBtn && fileInput) {
    changeImageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }


  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file =
        e.target.files && e.target.files[0];

      handleFileSelection(file);
    });
  }


  // =========================================================
  // DRAG AND DROP
  // =========================================================

  if (dropzone) {
    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
    });


    ["dragleave", "drop"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });
    });


    dropzone.addEventListener("drop", (e) => {
      const file =
        e.dataTransfer.files &&
        e.dataTransfer.files[0];

      handleFileSelection(file);
    });
  }


  // =========================================================
  // HANDLE FILE SELECTION
  // =========================================================

  function handleFileSelection(file) {
    clearMessages();

    if (!file) {
      return;
    }


    if (!ACCEPTED_TYPES.includes(file.type)) {
      showUploadError(
        "Please select a JPG, PNG, or WEBP image."
      );

      resetSelection();
      return;
    }


    selectedFile = file;

    if (analyzeBtn) {
      analyzeBtn.disabled = false;
    }


    previewImage(file);

    resetResults();


    // -------------------------------------------------------
    // Client-side image quality check
    // -------------------------------------------------------

    const token = ++qualityCheckToken;

    hideImageQuality();

    checkImageQuality(file).then((quality) => {
      if (token === qualityCheckToken) {
        displayImageQuality(quality);
      }
    });
  }


  // =========================================================
  // PREVIEW IMAGE
  // =========================================================

  function previewImage(file) {
    if (!previewImageEl) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      previewImageEl.src = e.target.result;

      if (dropzoneContent) {
        dropzoneContent.classList.add("hidden");
      }

      if (previewContent) {
        previewContent.classList.remove("hidden");
      }
    };

    reader.readAsDataURL(file);
  }


  // =========================================================
  // IMAGE QUALITY CHECK
  // =========================================================

  function checkImageQuality(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();


      reader.onload = (e) => {
        const img = new Image();


        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;


          // -------------------------------------------------
          // Resolution
          // -------------------------------------------------

          if (width < 224 || height < 224) {
            resolve({
              status: "Poor quality",
              level: "poor-quality",

              message:
                "The image resolution is too low. Please upload a larger, clearer leaf image.",

              details: [
                `Resolution: ${width} × ${height}`,
                "Recommended: at least 224 × 224 pixels"
              ]
            });

            return;
          }


          // -------------------------------------------------
          // Resize for faster browser processing
          // -------------------------------------------------

          const maxSize = 500;

          const scale = Math.min(
            1,
            maxSize / Math.max(width, height)
          );


          const canvas =
            document.createElement("canvas");

          canvas.width = Math.max(
            1,
            Math.round(width * scale)
          );

          canvas.height = Math.max(
            1,
            Math.round(height * scale)
          );


          const ctx =
            canvas.getContext(
              "2d",
              {
                willReadFrequently: true
              }
            );


          if (!ctx) {
            resolve({
              status: "Quality check skipped",
              level: "needs-improvement",

              message:
                "The image quality could not be analyzed in this browser. You can still run the diagnosis.",

              details: [
                `Resolution: ${width} × ${height}`
              ]
            });

            return;
          }


          ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );


          let imageData;


          try {
            imageData =
              ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
          } catch (err) {
            resolve({
              status: "Quality check skipped",
              level: "needs-improvement",

              message:
                "The image quality could not be analyzed in this browser. You can still run the diagnosis.",

              details: [
                `Resolution: ${width} × ${height}`
              ]
            });

            return;
          }


          const pixels = imageData.data;

          const w = canvas.width;
          const h = canvas.height;


          // -------------------------------------------------
          // Grayscale image for sharpness calculation
          // -------------------------------------------------

          const grayscale =
            new Float32Array(w * h);

          let brightnessSum = 0;


          for (
            let i = 0, p = 0;
            i < pixels.length;
            i += 4, p += 1
          ) {
            const gray =
              0.299 * pixels[i] +
              0.587 * pixels[i + 1] +
              0.114 * pixels[i + 2];

            grayscale[p] = gray;

            brightnessSum += gray;
          }


          const averageBrightness =
            brightnessSum / grayscale.length;


          // -------------------------------------------------
          // Laplacian variance
          // Used as a simple blur indicator
          // -------------------------------------------------

          let laplacianSum = 0;
          let laplacianSquaredSum = 0;
          let laplacianCount = 0;


          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

              const center =
                grayscale[y * w + x];

              const top =
                grayscale[(y - 1) * w + x];

              const bottom =
                grayscale[(y + 1) * w + x];

              const left =
                grayscale[y * w + (x - 1)];

              const right =
                grayscale[y * w + (x + 1)];


              const laplacian =
                top +
                bottom +
                left +
                right -
                4 * center;


              laplacianSum += laplacian;

              laplacianSquaredSum +=
                laplacian * laplacian;

              laplacianCount++;
            }
          }


          const laplacianMean =
            laplacianSum /
            laplacianCount;


          const blurVariance =
            laplacianSquaredSum /
            laplacianCount -
            laplacianMean *
            laplacianMean;


          // -------------------------------------------------
          // Detect issues
          // -------------------------------------------------

          const issues = [];


          if (averageBrightness < 45) {
            issues.push("Image is too dark");
          } else if (averageBrightness > 215) {
            issues.push("Image is too bright");
          }


          if (blurVariance < 40) {
            issues.push("Image may be blurry");
          }


          const details = [
            `Resolution: ${width} × ${height}`,
            `Brightness: ${averageBrightness.toFixed(0)}/255`,
            `Sharpness: ${blurVariance.toFixed(0)}`
          ];


          let result;


          if (issues.length >= 2) {

            result = {
              status: "Poor quality",
              level: "poor-quality",

              message:
                "The image quality may affect the reliability of the diagnosis. Consider uploading a clearer leaf image.",

              details: [
                ...details,
                ...issues
              ]
            };


          } else if (issues.length === 1) {

            result = {
              status: "Needs improvement",
              level: "needs-improvement",

              message:
                "The image can be analyzed, but improving the image quality may produce a more reliable result.",

              details: [
                ...details,
                issues[0]
              ]
            };


          } else {

            result = {
              status: "Good quality",
              level: "good-quality",

              message:
                "The image quality is suitable for analysis.",

              details
            };
          }


          resolve(result);
        };


        img.onerror = () => {
          resolve({
            status: "Quality check failed",
            level: "needs-improvement",

            message:
              "The image could not be analyzed for quality. You can still try the diagnosis.",

            details: []
          });
        };


        img.src = e.target.result;
      };


      reader.onerror = () => {
        resolve({
          status: "Quality check failed",
          level: "needs-improvement",

          message:
            "The image could not be analyzed for quality. You can still try the diagnosis.",

          details: []
        });
      };


      reader.readAsDataURL(file);
    });
  }


  // =========================================================
  // DISPLAY IMAGE QUALITY
  // =========================================================

  function displayImageQuality(quality) {
    if (!imageQualityCard || !quality) {
      return;
    }


    imageQualityCard.classList.remove(
      "good-quality",
      "needs-improvement",
      "poor-quality"
    );


    imageQualityCard.classList.add(
      quality.level
    );


    imageQualityCard.classList.remove(
      "hidden"
    );


    if (qualityStatus) {
      qualityStatus.textContent =
        quality.status;
    }


    if (qualityMessage) {
      qualityMessage.textContent =
        quality.message;
    }


    if (qualityStatusDot) {
      qualityStatusDot.className =
        "quality-status-dot " +
        quality.level;
    }


    if (qualityDetails) {
      qualityDetails.innerHTML = "";

      (quality.details || []).forEach(
        (detail) => {

          const li =
            document.createElement("li");

          li.textContent = detail;

          qualityDetails.appendChild(li);
        }
      );
    }
  }


  // =========================================================
  // HIDE IMAGE QUALITY
  // =========================================================

  function hideImageQuality() {
    if (!imageQualityCard) {
      return;
    }


    imageQualityCard.classList.add(
      "hidden"
    );


    imageQualityCard.classList.remove(
      "good-quality",
      "needs-improvement",
      "poor-quality"
    );


    if (qualityDetails) {
      qualityDetails.innerHTML = "";
    }
  }


  // =========================================================
  // RESET SELECTION
  // =========================================================

  function resetSelection() {
    selectedFile = null;

    currentPrediction = null;


    if (analyzeBtn) {
      analyzeBtn.disabled = true;
    }


    if (fileInput) {
      fileInput.value = "";
    }


    if (dropzoneContent) {
      dropzoneContent.classList.remove("hidden");
    }


    if (previewContent) {
      previewContent.classList.add("hidden");
    }


    hideImageQuality();
  }


  // =========================================================
  // ERROR HANDLING
  // =========================================================

  function showUploadError(message) {
    if (!uploadError) {
      return;
    }


    uploadError.textContent = message;

    uploadError.classList.remove(
      "hidden"
    );
  }


  function showApiError(message) {
    if (!apiError) {
      return;
    }


    apiError.textContent = message;

    apiError.classList.remove(
      "hidden"
    );
  }


  function clearMessages() {
    if (uploadError) {
      uploadError.classList.add("hidden");
      uploadError.textContent = "";
    }


    if (apiError) {
      apiError.classList.add("hidden");
      apiError.textContent = "";
    }
  }


  // =========================================================
  // RESET RESULTS
  // =========================================================

  function resetResults() {

    if (resultsPanel) {
      resultsPanel.classList.add("hidden");
    }


    if (topPredictions) {
      topPredictions.innerHTML = "";
    }


    if (topPredictionsBlock) {
      topPredictionsBlock.classList.add("hidden");
    }


    if (comparisonContent) {
      comparisonContent.classList.add("hidden");
    }


    if (comparisonEmpty) {
      comparisonEmpty.classList.remove("hidden");
    }


    if (comparisonCards) {
      comparisonCards.innerHTML = "";
    }


    if (comparisonNote) {
      comparisonNote.textContent = "";
    }


    if (confidenceAssessment) {
      confidenceAssessment.classList.add("hidden");
    }


    if (severityAssessment) {
      severityAssessment.classList.add("hidden");
    }


    if (originalImageEl) {
      originalImageEl.removeAttribute("src");
    }


    if (gradcamImageEl) {
      gradcamImageEl.removeAttribute("src");
    }


    if (imageCompare) {
      imageCompare.classList.add("hidden");
    }


    [
      descriptionBlock,
      symptomsBlock,
      actionsBlock,
      preventionBlock
    ].forEach((block) => {
      if (block) {
        block.classList.add("hidden");
      }
    });


    if (descriptionText) {
      descriptionText.textContent = "";
    }


    if (symptomsList) {
      symptomsList.innerHTML = "";
    }


    if (actionsList) {
      actionsList.innerHTML = "";
    }


    if (preventionList) {
      preventionList.innerHTML = "";
    }
  }


  // =========================================================
  // ANALYZE IMAGE
  // =========================================================

  if (analyzeBtn) {
    analyzeBtn.addEventListener(
      "click",
      analyzeImage
    );
  }


  async function analyzeImage() {

    if (!selectedFile) {
      showUploadError(
        "Please select an image first."
      );
      return;
    }


    clearMessages();


    if (analyzeBtn) {
      analyzeBtn.disabled = true;
    }


    if (loadingRow) {
      loadingRow.classList.remove("hidden");
    }


    if (loadingText) {
      loadingText.textContent =
        "Analyzing leaf image...";
    }


    try {

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );


      const response =
        await fetch(
          API_URL,
          {
            method: "POST",
            body: formData
          }
        );


      if (!response.ok) {

        let errorMessage =
          "The server could not process the image.";

        try {
          const errorData =
            await response.json();

          if (errorData.detail) {
            errorMessage =
              errorData.detail;
          }
        } catch (err) {
          // Keep default error message.
        }

        throw new Error(
          errorMessage
        );
      }


      const data =
        await response.json();


      currentPrediction = data;

      window.currentPrediction =
        data;


      displayResults(data);

      saveToHistory(data);


    } catch (error) {

      console.error(
        "Prediction error:",
        error
      );


      showApiError(
        error.message ||
        "Could not connect to the plant disease prediction server."
      );

    } finally {

      if (loadingRow) {
        loadingRow.classList.add("hidden");
      }


      if (analyzeBtn) {
        analyzeBtn.disabled =
          !selectedFile;
      }
    }
  }
  // =========================================================
// ANALYZE ERROR
// =========================================================

function handleAnalyzeError(error) {

  const message =
    error && error.message
      ? error.message
      : "";


  if (message === "HTTP_ERROR") {

    showApiError(
      "The AI server returned an error while analyzing this image. Please try again."
    );

  } else if (
    message === "INVALID_JSON" ||
    message === "INVALID_RESPONSE"
  ) {

    showApiError(
      "The AI server sent an unexpected response. Please try again."
    );

  } else {

    showApiError(
      "Unable to connect to the AI server. Please make sure the FastAPI backend is running."
    );
  }
}


// =========================================================
// FORMAT DISEASE LABEL
// =========================================================

function formatDiseaseLabel(rawLabel) {

  if (!rawLabel) {
    return "";
  }


  let label =
    String(rawLabel)
      .replace(/___/g, " ")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();


  const replacements = {
    "Apple Apple Scab":
      "Apple Scab",

    "Apple Black Rot":
      "Apple Black Rot",

    "Apple Cedar Apple Rust":
      "Cedar Apple Rust",

    "Apple Healthy":
      "Apple Healthy",

    "Blueberry Healthy":
      "Blueberry Healthy",

    "Cherry Including Sour Powdery Mildew":
      "Cherry Powdery Mildew",

    "Cherry Including Sour Healthy":
      "Cherry Healthy",

    "Corn Maize Cercospora Leaf Spot Gray Leaf Spot":
      "Corn Gray Leaf Spot",

    "Corn Maize Common Rust":
      "Corn Common Rust",

    "Corn Maize Northern Leaf Blight":
      "Corn Northern Leaf Blight",

    "Corn Maize Healthy":
      "Corn Healthy",

    "Grape Black Rot":
      "Grape Black Rot",

    "Grape Esca Black Measles":
      "Grape Esca (Black Measles)",

    "Grape Leaf Blight Isariopsis Leaf Spot":
      "Grape Leaf Blight",

    "Grape Healthy":
      "Grape Healthy",

    "Orange Haunglongbing Citrus Greening":
      "Orange Citrus Greening",

    "Peach Bacterial Spot":
      "Peach Bacterial Spot",

    "Peach Healthy":
      "Peach Healthy",

    "Pepper Bell Bacterial Spot":
      "Bell Pepper Bacterial Spot",

    "Pepper Bell Healthy":
      "Bell Pepper Healthy",

    "Potato Early Blight":
      "Potato Early Blight",

    "Potato Late Blight":
      "Potato Late Blight",

    "Potato Healthy":
      "Potato Healthy",

    "Raspberry Healthy":
      "Raspberry Healthy",

    "Soybean Healthy":
      "Soybean Healthy",

    "Squash Powdery Mildew":
      "Squash Powdery Mildew",

    "Strawberry Leaf Scorch":
      "Strawberry Leaf Scorch",

    "Strawberry Healthy":
      "Strawberry Healthy",

    "Tomato Bacterial Spot":
      "Tomato Bacterial Spot",

    "Tomato Early Blight":
      "Tomato Early Blight",

    "Tomato Late Blight":
      "Tomato Late Blight",

    "Tomato Leaf Mold":
      "Tomato Leaf Mold",

    "Tomato Septoria Leaf Spot":
      "Tomato Septoria Leaf Spot",

    "Tomato Spider Mites Two Spotted Spider Mite":
      "Tomato Spider Mites",

    "Tomato Target Spot":
      "Tomato Target Spot",

    "Tomato Tomato Yellow Leaf Curl Virus":
      "Tomato Yellow Leaf Curl Virus",

    "Tomato Tomato Mosaic Virus":
      "Tomato Mosaic Virus",

    "Tomato Healthy":
      "Tomato Healthy"
  };


  if (replacements[label]) {
    return replacements[label];
  }


  return label
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}


// =========================================================
// HEALTHY PREDICTION
// =========================================================

function isHealthyPrediction(rawLabel) {

  return (
    typeof rawLabel === "string" &&
    rawLabel
      .toLowerCase()
      .includes("healthy")
  );
}


// =========================================================
// DISPLAY RESULTS
// =========================================================

function displayResults(data) {

  if (!data) {
    return;
  }


  const recommendation =
    data.recommendation || {};


  const readableLabel =
    formatDiseaseLabel(
      data.prediction
    );


  const healthy =
    isHealthyPrediction(
      data.prediction
    );


  // ---------------------------------------------------------
  // Crop
  // ---------------------------------------------------------

  if (resultCropLabel) {

    resultCropLabel.textContent =
      recommendation.crop ||
      "Detected Crop";
  }


  // ---------------------------------------------------------
  // Disease
  // ---------------------------------------------------------

  if (resultDiseaseName) {

    resultDiseaseName.textContent =
      recommendation.disease ||
      readableLabel ||
      "Unknown Condition";


    resultDiseaseName.classList.toggle(
      "is-healthy",
      healthy
    );
  }


  // ---------------------------------------------------------
  // Technical model class
  // ---------------------------------------------------------

  if (resultTechnicalName) {

    resultTechnicalName.textContent =
      data.prediction
        ? `Model class: ${data.prediction}`
        : "";
  }


  // ---------------------------------------------------------
  // Confidence
  // ---------------------------------------------------------

  const confidence =
    Math.max(
      0,
      Math.min(
        100,
        Number(data.confidence) || 0
      )
    );


  if (confidenceValue) {

    confidenceValue.textContent =
      `${confidence.toFixed(1)}%`;
  }


  if (confidenceRing) {

    const offset =
      RING_CIRCUMFERENCE *
      (1 - confidence / 100);


    confidenceRing.style.strokeDashoffset =
      String(offset);
  }


  // ---------------------------------------------------------
  // Top 3
  // ---------------------------------------------------------

  displayTopPredictions(
    data.top_predictions
  );


  // ---------------------------------------------------------
  // Confidence assessment
  // ---------------------------------------------------------

  displayConfidenceAssessment(
    data.top_predictions
  );


  // ---------------------------------------------------------
  // Prediction comparison
  // ---------------------------------------------------------

  displayPredictionComparison(
    data.top_predictions
  );


  // ---------------------------------------------------------
  // Original image
  // ---------------------------------------------------------

  if (
    originalImageEl &&
    previewImageEl &&
    previewImageEl.src
  ) {

    originalImageEl.src =
      previewImageEl.src;
  }


  // ---------------------------------------------------------
  // Grad-CAM
  // ---------------------------------------------------------

  if (data.gradcam) {

    if (gradcamImageEl) {

      gradcamImageEl.src =
        "data:image/jpeg;base64," +
        data.gradcam;
    }


    if (imageCompare) {

      imageCompare.classList.remove(
        "hidden"
      );
    }


    /*
     * This is an image-based AI attention estimate.
     * It is NOT laboratory-confirmed disease severity.
     */

    estimateSeverityFromGradCAM(
      data.gradcam
    ).then(
      (impact) => {

        if (impact) {

          displaySeverityAssessment(
            impact
          );
        }
      }
    );


  } else {

    if (imageCompare) {

      imageCompare.classList.add(
        "hidden"
      );
    }


    if (severityAssessment) {

      severityAssessment.classList.add(
        "hidden"
      );
    }
  }


  // ---------------------------------------------------------
  // Recommendations
  // ---------------------------------------------------------

  displayRecommendation(
    recommendation,
    healthy
  );


  // ---------------------------------------------------------
  // Show results
  // ---------------------------------------------------------

  if (resultsPanel) {

    resultsPanel.classList.remove(
      "hidden"
    );


    resultsPanel.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }
}


// =========================================================
// TOP-3 PREDICTIONS
// =========================================================

function displayTopPredictions(
  rawTopPredictions
) {

  if (!topPredictions) {
    return;
  }


  topPredictions.innerHTML = "";


  if (
    !Array.isArray(
      rawTopPredictions
    ) ||
    rawTopPredictions.length === 0
  ) {

    if (topPredictionsBlock) {

      topPredictionsBlock.classList.add(
        "hidden"
      );
    }

    return;
  }


  rawTopPredictions
    .slice(0, 3)
    .forEach(
      (item, index) => {

        const confidence =
          Math.max(
            0,
            Math.min(
              100,
              Number(
                item &&
                item.confidence
              ) || 0
            )
          );


        const rawName =
          item &&
          (
            item.class ||
            item.label ||
            item.name
          )
            ? (
                item.class ||
                item.label ||
                item.name
              )
            : "";


        const row =
          document.createElement(
            "div"
          );


        row.className =
          "top-prediction-item";


        const rank =
          document.createElement(
            "div"
          );


        rank.className =
          "prediction-rank";


        rank.textContent =
          `#${index + 1}`;


        const details =
          document.createElement(
            "div"
          );


        details.className =
          "prediction-details";


        const name =
          document.createElement(
            "div"
          );


        name.className =
          "prediction-name";


        name.textContent =
          formatDiseaseLabel(
            rawName
          );


        const bar =
          document.createElement(
            "div"
          );


        bar.className =
          "prediction-bar";


        const fill =
          document.createElement(
            "div"
          );


        fill.className =
          "prediction-fill";


        fill.style.width =
          `${confidence}%`;


        bar.appendChild(
          fill
        );


        details.appendChild(
          name
        );


        details.appendChild(
          bar
        );


        const confidenceLabel =
          document.createElement(
            "div"
          );


        confidenceLabel.className =
          "prediction-confidence";


        confidenceLabel.textContent =
          `${confidence.toFixed(1)}%`;


        row.appendChild(
          rank
        );


        row.appendChild(
          details
        );


        row.appendChild(
          confidenceLabel
        );


        topPredictions.appendChild(
          row
        );
      }
    );


  if (topPredictionsBlock) {

    topPredictionsBlock.classList.remove(
      "hidden"
    );
  }
}


// =========================================================
// CONFIDENCE ASSESSMENT
// =========================================================

function displayConfidenceAssessment(
  rawTopPredictions
) {

  if (!confidenceAssessment) {
    return;
  }


  confidenceAssessment.classList.remove(
    "hidden",
    "high-confidence",
    "moderate-confidence",
    "low-confidence"
  );


  if (
    !Array.isArray(
      rawTopPredictions
    ) ||
    rawTopPredictions.length === 0
  ) {

    confidenceAssessment.classList.add(
      "low-confidence"
    );


    if (confidenceStatus) {

      confidenceStatus.textContent =
        "Limited confidence";
    }


    if (confidenceMessage) {

      confidenceMessage.textContent =
        "The model did not provide enough prediction information to assess confidence.";
    }


    if (confidenceStatusDot) {

      confidenceStatusDot.className =
        "confidence-status-dot low-confidence";
    }


    return;
  }


  const first =
    Number(
      rawTopPredictions[0] &&
      rawTopPredictions[0].confidence
    ) || 0;


  const second =
    Number(
      rawTopPredictions[1] &&
      rawTopPredictions[1].confidence
    ) || 0;


  const gap =
    first - second;


  if (confidenceGap) {

    confidenceGap.textContent =
      `Top-1 vs Top-2 gap: ${gap.toFixed(1)}%`;
  }


  if (
    first >= 80 &&
    gap >= 20
  ) {

    confidenceAssessment.classList.add(
      "high-confidence"
    );


    if (confidenceStatus) {

      confidenceStatus.textContent =
        "High confidence";
    }


    if (confidenceMessage) {

      confidenceMessage.textContent =
        "The leading prediction is substantially ahead of the other predictions.";
    }


    if (confidenceStatusDot) {

      confidenceStatusDot.className =
        "confidence-status-dot high-confidence";
    }


  } else if (
    first >= 60 ||
    gap >= 10
  ) {

    confidenceAssessment.classList.add(
      "moderate-confidence"
    );


    if (confidenceStatus) {

      confidenceStatus.textContent =
        "Moderate confidence";
    }


    if (confidenceMessage) {

      confidenceMessage.textContent =
        "The model has a leading prediction, but some uncertainty remains.";
    }


    if (confidenceStatusDot) {

      confidenceStatusDot.className =
        "confidence-status-dot moderate-confidence";
    }


  } else {

    confidenceAssessment.classList.add(
      "low-confidence"
    );


    if (confidenceStatus) {

      confidenceStatus.textContent =
        "Low confidence";
    }


    if (confidenceMessage) {

      confidenceMessage.textContent =
        "The top predictions are relatively close. Consider uploading a clearer leaf image or using additional expert verification.";
    }


    if (confidenceStatusDot) {

      confidenceStatusDot.className =
        "confidence-status-dot low-confidence";
    }
  }
}


// =========================================================
// ESTIMATED DISEASE IMPACT FROM GRAD-CAM
// =========================================================

function estimateSeverityFromGradCAM(
  base64Image
) {

  return new Promise(
    (resolve) => {

      if (!base64Image) {

        resolve(null);
        return;
      }


      const img =
        new Image();


      img.onload = () => {

        const maxSize = 400;


        const scale =
          Math.min(
            1,
            maxSize /
              Math.max(
                img.naturalWidth,
                img.naturalHeight
              )
          );


        const canvas =
          document.createElement(
            "canvas"
          );


        canvas.width =
          Math.max(
            1,
            Math.round(
              img.naturalWidth *
              scale
            )
          );


        canvas.height =
          Math.max(
            1,
            Math.round(
              img.naturalHeight *
              scale
            )
          );


        const ctx =
          canvas.getContext(
            "2d"
          );


        if (!ctx) {

          resolve(null);
          return;
        }


        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        );


        let imageData;


        try {

          imageData =
            ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

        } catch (error) {

          resolve(null);
          return;
        }


        const pixels =
          imageData.data;


        let heatSum = 0;
        let heatCount = 0;


        for (
          let i = 0;
          i < pixels.length;
          i += 4
        ) {

          const r =
            pixels[i];


          const g =
            pixels[i + 1];


          const b =
            pixels[i + 2];


          const warmth =
            Math.max(
              0,
              r -
                g * 0.45 -
                b * 0.25
            );


          heatSum +=
            warmth;


          heatCount++;
        }


        if (!heatCount) {

          resolve(null);
          return;
        }


        const averageHeat =
          heatSum /
          heatCount;


        const score =
          Math.max(
            0,
            Math.min(
              100,
              averageHeat * 2
            )
          );


        let level;


        if (score >= 65) {

          level =
            "high-impact";

        } else if (score >= 35) {

          level =
            "moderate-impact";

        } else {

          level =
            "low-impact";
        }


        resolve({
          score,
          level
        });
      };


      img.onerror = () => {
        resolve(null);
      };


      img.src =
        "data:image/jpeg;base64," +
        base64Image;
    }
  );
}


// =========================================================
// DISPLAY ESTIMATED DISEASE IMPACT
// =========================================================

function displaySeverityAssessment(
  impact
) {

  if (
    !severityAssessment ||
    !impact
  ) {
    return;
  }


  severityAssessment.classList.remove(
    "hidden",
    "low-impact",
    "moderate-impact",
    "high-impact"
  );


  severityAssessment.classList.add(
    impact.level
  );


  if (severityCoverage) {

    severityCoverage.textContent =
      `${Math.round(
        impact.score
      )}/100`;
  }


  if (severityStatusDot) {

    severityStatusDot.className =
      "severity-status-dot " +
      impact.level;
  }


  if (severityStatus) {

    if (
      impact.level ===
      "high-impact"
    ) {

      severityStatus.textContent =
        "High attention";

    } else if (
      impact.level ===
      "moderate-impact"
    ) {

      severityStatus.textContent =
        "Moderate attention";

    } else {

      severityStatus.textContent =
        "Low attention";
    }
  }


  if (severityMessage) {

    severityMessage.textContent =
      "This is an image-based Grad-CAM attention estimate showing how strongly the model focused on regions of the image. It is not a laboratory-confirmed measure of disease severity.";
  }
}


// =========================================================
// RECOMMENDATIONS
// =========================================================

function displayRecommendation(
  recommendation,
  healthy
) {

  recommendation =
    recommendation || {};


  const description =
    recommendation.description ||
    recommendation.summary ||
    "";


  if (descriptionBlock) {

    if (description) {

      descriptionBlock.classList.remove(
        "hidden"
      );


      if (descriptionText) {

        descriptionText.textContent =
          description;
      }


    } else {

      descriptionBlock.classList.add(
        "hidden"
      );
    }
  }


  const symptoms =
    Array.isArray(
      recommendation.symptoms
    )
      ? recommendation.symptoms
      : [];


  displayListBlock(
    symptomsBlock,
    symptomsList,
    symptoms
  );


  const actions =
    Array.isArray(
      recommendation.actions
    )
      ? recommendation.actions
      : Array.isArray(
          recommendation.recommended_actions
        )
        ? recommendation.recommended_actions
        : [];


  displayListBlock(
    actionsBlock,
    actionsList,
    actions
  );


  const prevention =
    Array.isArray(
      recommendation.prevention
    )
      ? recommendation.prevention
      : [];


  displayListBlock(
    preventionBlock,
    preventionList,
    prevention
  );


  if (
    healthy &&
    !description &&
    symptoms.length === 0 &&
    actions.length === 0 &&
    prevention.length === 0
  ) {

    if (descriptionBlock) {

      descriptionBlock.classList.remove(
        "hidden"
      );
    }


    if (descriptionText) {

      descriptionText.textContent =
        "The model predicts a healthy leaf. Continue regular monitoring and good crop-care practices.";
    }
  }
}


// =========================================================
// DISPLAY LIST BLOCK
// =========================================================

function displayListBlock(
  block,
  listElement,
  items
) {

  if (
    !block ||
    !listElement
  ) {
    return;
  }


  listElement.innerHTML = "";


  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    block.classList.add(
      "hidden"
    );

    return;
  }


  items.forEach(
    (item) => {

      const li =
        document.createElement(
          "li"
        );


      if (
        typeof item ===
        "string"
      ) {

        li.textContent =
          item;


      } else if (
        item &&
        typeof item ===
        "object"
      ) {

        if (item.title) {

          const title =
            document.createElement(
              "strong"
            );


          title.textContent =
            item.title;


          li.appendChild(
            title
          );


          if (item.description) {

            const text =
              document.createElement(
                "span"
              );


            text.textContent =
              ` ${item.description}`;


            li.appendChild(
              text
            );
          }


        } else if (item.text) {

          li.textContent =
            item.text;


        } else {

          li.textContent =
            JSON.stringify(
              item
            );
        }


      } else {

        li.textContent =
          String(item);
      }


      listElement.appendChild(
        li
      );
    }
  );


  block.classList.remove(
    "hidden"
  );
}


// =========================================================
// RESET RESULTS
// =========================================================

function clearResultSections() {

  if (topPredictions) {
    topPredictions.innerHTML = "";
  }


  if (topPredictionsBlock) {

    topPredictionsBlock.classList.add(
      "hidden"
    );
  }


  if (confidenceAssessment) {

    confidenceAssessment.classList.add(
      "hidden"
    );
  }


  if (severityAssessment) {

    severityAssessment.classList.add(
      "hidden"
    );
  }


  if (imageCompare) {

    imageCompare.classList.add(
      "hidden"
    );
  }


  if (comparisonCards) {

    comparisonCards.innerHTML = "";
  }


  if (comparisonContent) {

    comparisonContent.classList.add(
      "hidden"
    );
  }


  if (comparisonEmpty) {

    comparisonEmpty.classList.remove(
      "hidden"
    );
  }


  if (comparisonNote) {

    comparisonNote.textContent = "";
  }


  [
    descriptionBlock,
    symptomsBlock,
    actionsBlock,
    preventionBlock
  ].forEach(
    (block) => {

      if (block) {
        block.classList.add(
          "hidden"
        );
      }
    }
  );


  if (descriptionText) {
    descriptionText.textContent = "";
  }


  if (symptomsList) {
    symptomsList.innerHTML = "";
  }


  if (actionsList) {
    actionsList.innerHTML = "";
  }


  if (preventionList) {
    preventionList.innerHTML = "";
  }
}


// =========================================================
// RESET RESULTS
// =========================================================

function resetResults() {

  currentPrediction =
    null;


  window.currentPrediction =
    null;


  clearResultSections();


  if (resultsPanel) {

    resultsPanel.classList.add(
      "hidden"
    );
  }


  if (originalImageEl) {

    originalImageEl.removeAttribute(
      "src"
    );
  }


  if (gradcamImageEl) {

    gradcamImageEl.removeAttribute(
      "src"
    );
  }


  if (confidenceValue) {

    confidenceValue.textContent =
      "0.0%";
  }


  if (confidenceRing) {

    confidenceRing.style.strokeDashoffset =
      String(RING_CIRCUMFERENCE);
  }
}


// =========================================================
// PREDICTION COMPARISON
// =========================================================

function getPredictionName(item) {

  if (!item) {
    return "";
  }


  return formatDiseaseLabel(
    item.class ||
    item.label ||
    item.name ||
    ""
  );
}


function getComparisonType(
  rawName
) {

  if (
    isHealthyPrediction(
      rawName
    )
  ) {
    return "Healthy condition";
  }


  return "Possible disease";
}


function displayPredictionComparison(
  rawTopPredictions
) {

  if (
    !comparisonContent ||
    !comparisonEmpty ||
    !comparisonCards
  ) {
    return;
  }


  comparisonCards.innerHTML =
    "";


  if (
    !Array.isArray(
      rawTopPredictions
    ) ||
    rawTopPredictions.length < 2
  ) {

    comparisonContent.classList.add(
      "hidden"
    );


    comparisonEmpty.classList.remove(
      "hidden"
    );


    comparisonEmpty.textContent =
      "At least two model predictions are required for comparison.";


    return;
  }


  const predictions =
    rawTopPredictions.slice(
      0,
      3
    );


  comparisonEmpty.classList.add(
    "hidden"
  );


  comparisonContent.classList.remove(
    "hidden"
  );


  if (comparisonNote) {

    comparisonNote.textContent =
      `${predictions.length} predictions compared`;
  }


  predictions.forEach(
    (item, index) => {

      const rawName =
        item.class ||
        item.label ||
        item.name ||
        "";


      const readableName =
        getPredictionName(
          item
        );


      const confidence =
        Math.max(
          0,
          Math.min(
            100,
            Number(
              item.confidence
            ) || 0
          )
        );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "comparison-card";


      if (index === 0) {

        card.classList.add(
          "comparison-leading"
        );
      }


      const rank =
        document.createElement(
          "div"
        );


      rank.className =
        "comparison-rank";


      rank.textContent =
        `#${index + 1}`;


      const title =
        document.createElement(
          "h4"
        );


      title.textContent =
        readableName;


      const type =
        document.createElement(
          "span"
        );


      type.className =
        "comparison-type";


      type.textContent =
        getComparisonType(
          rawName
        );


      const confidenceLabel =
        document.createElement(
          "div"
        );


      confidenceLabel.className =
        "comparison-confidence";


      confidenceLabel.textContent =
        `${confidence.toFixed(1)}%`;


      const bar =
        document.createElement(
          "div"
        );


      bar.className =
        "comparison-bar";


      const fill =
        document.createElement(
          "div"
        );


      fill.className =
        "comparison-fill";


      fill.style.width =
        `${confidence}%`;


      bar.appendChild(
        fill
      );


      card.appendChild(
        rank
      );


      card.appendChild(
        title
      );


      card.appendChild(
        type
      );


      card.appendChild(
        confidenceLabel
      );


      card.appendChild(
        bar
      );


      comparisonCards.appendChild(
        card
      );
    }
  );
}


// =========================================================
// CROP HEALTH HUB DATA
// =========================================================

const cropHealthData = {

  Apple: [
    {
      name: "Apple Scab",
      className:
        "Apple___Apple_scab",
      type: "Disease"
    },
    {
      name: "Apple Black Rot",
      className:
        "Apple___Black_rot",
      type: "Disease"
    },
    {
      name: "Cedar Apple Rust",
      className:
        "Apple___Cedar_apple_rust",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Apple___healthy",
      type: "Healthy"
    }
  ],


  Blueberry: [
    {
      name: "Healthy",
      className:
        "Blueberry___healthy",
      type: "Healthy"
    }
  ],


  Cherry: [
    {
      name: "Powdery Mildew",
      className:
        "Cherry_(including_sour)___Powdery_mildew",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Cherry_(including_sour)___healthy",
      type: "Healthy"
    }
  ],


  Corn: [
    {
      name:
        "Cercospora Leaf Spot / Gray Leaf Spot",
      className:
        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
      type: "Disease"
    },
    {
      name: "Common Rust",
      className:
        "Corn_(maize)___Common_rust_",
      type: "Disease"
    },
    {
      name: "Northern Leaf Blight",
      className:
        "Corn_(maize)___Northern_Leaf_Blight",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Corn_(maize)___healthy",
      type: "Healthy"
    }
  ],


  Grape: [
    {
      name: "Black Rot",
      className:
        "Grape___Black_rot",
      type: "Disease"
    },
    {
      name:
        "Esca / Black Measles",
      className:
        "Grape___Esca_(Black_Measles)",
      type: "Disease"
    },
    {
      name: "Leaf Blight",
      className:
        "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Grape___healthy",
      type: "Healthy"
    }
  ],


  Orange: [
    {
      name:
        "Huanglongbing / Citrus Greening",
      className:
        "Orange___Haunglongbing_(Citrus_greening)",
      type: "Disease"
    }
  ],


  Peach: [
    {
      name: "Bacterial Spot",
      className:
        "Peach___Bacterial_spot",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Peach___healthy",
      type: "Healthy"
    }
  ],


  Pepper: [
    {
      name: "Bacterial Spot",
      className:
        "Pepper,_bell___Bacterial_spot",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Pepper,_bell___healthy",
      type: "Healthy"
    }
  ],


  Potato: [
    {
      name: "Early Blight",
      className:
        "Potato___Early_blight",
      type: "Disease"
    },
    {
      name: "Late Blight",
      className:
        "Potato___Late_blight",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Potato___healthy",
      type: "Healthy"
    }
  ],


  Raspberry: [
    {
      name: "Healthy",
      className:
        "Raspberry___healthy",
      type: "Healthy"
    }
  ],


  Soybean: [
    {
      name: "Healthy",
      className:
        "Soybean___healthy",
      type: "Healthy"
    }
  ],


  Squash: [
    {
      name: "Powdery Mildew",
      className:
        "Squash___Powdery_mildew",
      type: "Disease"
    }
  ],


  Strawberry: [
    {
      name: "Leaf Scorch",
      className:
        "Strawberry___Leaf_scorch",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Strawberry___healthy",
      type: "Healthy"
    }
  ],


  Tomato: [
    {
      name: "Bacterial Spot",
      className:
        "Tomato___Bacterial_spot",
      type: "Disease"
    },
    {
      name: "Early Blight",
      className:
        "Tomato___Early_blight",
      type: "Disease"
    },
    {
      name: "Late Blight",
      className:
        "Tomato___Late_blight",
      type: "Disease"
    },
    {
      name: "Leaf Mold",
      className:
        "Tomato___Leaf_Mold",
      type: "Disease"
    },
    {
      name: "Septoria Leaf Spot",
      className:
        "Tomato___Septoria_leaf_spot",
      type: "Disease"
    },
    {
      name: "Spider Mites",
      className:
        "Tomato___Spider_mites Two-spotted_spider_mite",
      type: "Disease"
    },
    {
      name: "Target Spot",
      className:
        "Tomato___Target_Spot",
      type: "Disease"
    },
    {
      name:
        "Tomato Yellow Leaf Curl Virus",
      className:
        "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
      type: "Disease"
    },
    {
      name:
        "Tomato Mosaic Virus",
      className:
        "Tomato___Tomato_mosaic_virus",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Tomato___healthy",
      type: "Healthy"
    }
  ]
};


// =========================================================
// DISPLAY CROP HEALTH HUB
// =========================================================

function displayCropHealth(
  crop
) {

  if (
    !cropHealthContent ||
    !cropHealthEmpty ||
    !cropDiseaseGrid
  ) {
    return;
  }


  const diseases =
    cropHealthData[crop];


  cropDiseaseGrid.innerHTML =
    "";


  if (
    !diseases ||
    diseases.length === 0
  ) {

    cropHealthContent.classList.add(
      "hidden"
    );


    cropHealthEmpty.classList.remove(
      "hidden"
    );


    cropHealthEmpty.textContent =
      "No supported conditions found for this crop.";


    return;
  }


  cropHealthEmpty.classList.add(
    "hidden"
  );


  cropHealthContent.classList.remove(
    "hidden"
  );


  if (selectedCropName) {

    selectedCropName.textContent =
      crop;
  }


  if (cropDiseaseCount) {

    cropDiseaseCount.textContent =
      `${diseases.length} condition${
        diseases.length === 1
          ? ""
          : "s"
      }`;
  }


  diseases.forEach(
    (item) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "crop-disease-card";


      if (
        item.type ===
        "Healthy"
      ) {

        card.classList.add(
          "healthy-condition"
        );
      }


      const badge =
        document.createElement(
          "span"
        );


      badge.className =
        "crop-condition-badge";


      badge.textContent =
        item.type;


      const title =
        document.createElement(
          "h4"
        );


      title.textContent =
        item.name;


      const modelClass =
        document.createElement(
          "p"
        );


      modelClass.className =
        "crop-model-class";


      modelClass.textContent =
        item.className;


      card.appendChild(
        badge
      );


      card.appendChild(
        title
      );


      card.appendChild(
        modelClass
      );


      cropDiseaseGrid.appendChild(
        card
      );
    }
  );
}


// =========================================================
// CROP SELECTOR
// =========================================================

if (cropSelector) {

  cropSelector.addEventListener(
    "change",
    () => {

      const crop =
        cropSelector.value;


      if (!crop) {

        if (cropHealthContent) {

          cropHealthContent.classList.add(
            "hidden"
          );
        }


        if (cropHealthEmpty) {

          cropHealthEmpty.classList.remove(
            "hidden"
          );


          cropHealthEmpty.textContent =
            "Select a crop to explore its supported conditions.";
        }


        return;
      }


      displayCropHealth(
        crop
      );
    }
  );


  if (cropSelector.value) {

    displayCropHealth(
      cropSelector.value
    );
  }
}
// =========================================================
// DISEASE COMPARISON
// =========================================================

function getPredictionName(item) {

  if (!item) {
    return "";
  }

  return formatDiseaseLabel(
    item.class ||
    item.label ||
    item.name ||
    ""
  );
}


function getComparisonType(rawName) {

  if (
    isHealthyPrediction(rawName)
  ) {
    return "Healthy condition";
  }

  return "Possible disease";
}


function displayPredictionComparison(
  rawTopPredictions
) {

  if (
    !comparisonContent ||
    !comparisonEmpty ||
    !comparisonCards
  ) {
    return;
  }

  comparisonCards.innerHTML = "";


  if (
    !Array.isArray(
      rawTopPredictions
    ) ||
    rawTopPredictions.length < 2
  ) {

    comparisonContent.classList.add(
      "hidden"
    );

    comparisonEmpty.classList.remove(
      "hidden"
    );

    comparisonEmpty.textContent =
      "At least two model predictions are required for comparison.";

    return;
  }


  const predictions =
    rawTopPredictions.slice(
      0,
      3
    );


  comparisonEmpty.classList.add(
    "hidden"
  );

  comparisonContent.classList.remove(
    "hidden"
  );


  if (comparisonNote) {

    comparisonNote.textContent =
      `${predictions.length} predictions compared`;
  }


  predictions.forEach(
    (item, index) => {

      const rawName =
        item.class ||
        item.label ||
        item.name ||
        "";


      const readableName =
        getPredictionName(item);


      const confidence =
        Math.max(
          0,
          Math.min(
            100,
            Number(
              item.confidence
            ) || 0
          )
        );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "comparison-card";


      if (index === 0) {

        card.classList.add(
          "comparison-leading"
        );
      }


      const rank =
        document.createElement(
          "div"
        );


      rank.className =
        "comparison-rank";


      rank.textContent =
        `#${index + 1}`;


      const title =
        document.createElement(
          "h4"
        );


      title.textContent =
        readableName;


      const type =
        document.createElement(
          "span"
        );


      type.className =
        "comparison-type";


      type.textContent =
        getComparisonType(
          rawName
        );


      const confidenceLabel =
        document.createElement(
          "div"
        );


      confidenceLabel.className =
        "comparison-confidence";


      confidenceLabel.textContent =
        `${confidence.toFixed(1)}%`;


      const bar =
        document.createElement(
          "div"
        );


      bar.className =
        "comparison-bar";


      const fill =
        document.createElement(
          "div"
        );


      fill.className =
        "comparison-fill";


      fill.style.width =
        `${confidence}%`;


      bar.appendChild(
        fill
      );


      card.appendChild(
        rank
      );

      card.appendChild(
        title
      );

      card.appendChild(
        type
      );

      card.appendChild(
        confidenceLabel
      );

      card.appendChild(
        bar
      );


      comparisonCards.appendChild(
        card
      );
    }
  );
}


// =========================================================
// AI ASSISTANT MESSAGE CONTAINER
// =========================================================

function getAssistantMessagesContainer() {

  return (
    document.getElementById(
      "assistantMessages"
    ) ||

    document.getElementById(
      "chatMessages"
    ) ||

    document.querySelector(
      ".assistant-messages"
    ) ||

    document.querySelector(
      ".chat-messages"
    ) ||

    document.querySelector(
      ".chat-body"
    )
  );
}


// =========================================================
// ADD AI ASSISTANT MESSAGE
// =========================================================

function addAssistantMessage(
  message,
  role = "assistant"
) {

  const container =
    getAssistantMessagesContainer();


  if (!container) {

    console.warn(
      "AI Assistant message container not found."
    );

    return null;
  }


  const messageEl =
    document.createElement(
      "div"
    );


  messageEl.className =
    role === "user"
      ? "chat-message user-message"
      : "chat-message assistant-message";


  messageEl.dataset.role =
    role;


  const textEl =
    document.createElement(
      "div"
    );


  textEl.className =
    "chat-message-text";


  textEl.textContent =
    message;


  messageEl.appendChild(
    textEl
  );


  container.appendChild(
    messageEl
  );


  container.scrollTop =
    container.scrollHeight;


  return messageEl;
}


// =========================================================
// REMOVE AI ASSISTANT MESSAGE
// =========================================================

function removeAssistantMessage(
  messageEl
) {

  if (
    messageEl &&
    messageEl.parentNode
  ) {

    messageEl.parentNode.removeChild(
      messageEl
    );
  }
}


// =========================================================
// AI ASSISTANT
// =========================================================

if (chatForm) {

  chatForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const question =
        chatInput
          ? chatInput.value.trim()
          : "";


      if (!question) {
        return;
      }


      // -------------------------------------------------------
      // Require prediction
      // -------------------------------------------------------

      if (!currentPrediction) {

        addAssistantMessage(
          "Please analyze a plant image first. I need the current model prediction before I can answer questions about that plant.",
          "assistant"
        );

        return;
      }


      // -------------------------------------------------------
      // Show user message
      // -------------------------------------------------------

      addAssistantMessage(
        question,
        "user"
      );


      // Clear input AFTER reading it
      if (chatInput) {

        chatInput.value = "";
      }


      // -------------------------------------------------------
      // Submit button
      // -------------------------------------------------------

      const submitButton =
        chatForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;
      }


      // -------------------------------------------------------
      // Thinking
      // -------------------------------------------------------

      const thinkingMessage =
        addAssistantMessage(
          "Thinking…",
          "assistant"
        );


      try {

        const topPredictions =
          Array.isArray(
            currentPrediction.top_predictions
          )
            ? currentPrediction.top_predictions
            : [];


        const payload = {

          disease:
            currentPrediction.prediction,

          confidence:
            Number(
              currentPrediction.confidence
            ) || 0,

          top_predictions:
            topPredictions,

          question:
            question
        };


        const response =
          await fetch(
            ASSISTANT_API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );


        // -----------------------------------------------------
        // Parse response
        // -----------------------------------------------------

        let result = null;


        try {

          result =
            await response.json();

        } catch (jsonError) {

          throw new Error(
            "The AI Assistant returned an invalid response."
          );
        }


        // -----------------------------------------------------
        // Remove thinking message
        // -----------------------------------------------------

        removeAssistantMessage(
          thinkingMessage
        );


        if (!response.ok) {

          throw new Error(
            result &&
            (
              result.detail ||
              result.message
            )
              ? (
                  result.detail ||
                  result.message
                )
              : "The AI Assistant server returned an error."
          );
        }


        const answer =
          result &&
          typeof result.answer ===
            "string"
            ? result.answer.trim()
            : "";


        if (!answer) {

          throw new Error(
            "The AI Assistant returned an empty answer."
          );
        }


        // -----------------------------------------------------
        // Display answer
        // -----------------------------------------------------

        addAssistantMessage(
          answer,
          "assistant"
        );


      } catch (error) {

        removeAssistantMessage(
          thinkingMessage
        );


        console.error(
          "AI Assistant error:",
          error
        );


        addAssistantMessage(
          error &&
          error.message
            ? error.message
            : "Unable to reach the AI Assistant. Please make sure the FastAPI backend is running.",
          "assistant"
        );


      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;
        }


        if (chatInput) {

          chatInput.focus();
        }
      }
    }
  );
}


// =========================================================
// ENTER KEY SUPPORT
// =========================================================

if (chatInput) {

  chatInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();


        if (chatForm) {

          if (
            typeof chatForm.requestSubmit ===
            "function"
          ) {

            chatForm.requestSubmit();

          } else {

            chatForm.dispatchEvent(
              new Event(
                "submit",
                {
                  bubbles: true,
                  cancelable: true
                }
              )
            );
          }
        }
      }
    }
  );
}


// =========================================================
// HISTORY
// =========================================================

function getHistory() {

  try {

    const stored =
      localStorage.getItem(
        HISTORY_KEY
      );


    if (!stored) {
      return [];
    }


    const parsed =
      JSON.parse(
        stored
      );


    return Array.isArray(
      parsed
    )
      ? parsed
      : [];


  } catch (error) {

    console.warn(
      "Unable to read scan history:",
      error
    );


    return [];
  }
}


// =========================================================
// SAVE HISTORY
// =========================================================

function saveToHistory(
  data
) {

  if (!data) {
    return;
  }


  const history =
    getHistory();


  const item = {

    id:
      Date.now(),

    prediction:
      data.prediction ||
      "",

    confidence:
      Number(
        data.confidence
      ) || 0,

    top_predictions:
      Array.isArray(
        data.top_predictions
      )
        ? data.top_predictions
        : [],

    recommendation:
      data.recommendation ||
      {},

    timestamp:
      new Date().toISOString()
  };


  history.unshift(
    item
  );


  const limited =
    history.slice(
      0,
      HISTORY_LIMIT
    );


  try {

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(
        limited
      )
    );

  } catch (error) {

    console.warn(
      "Unable to save scan history:",
      error
    );
  }


  renderHistory();
}


// =========================================================
// RENDER HISTORY
// =========================================================

function renderHistory() {

  if (!historyList) {
    return;
  }


  const history =
    getHistory();


  historyList.innerHTML =
    "";


  if (historyEmpty) {

    historyEmpty.classList.toggle(
      "hidden",
      history.length !== 0
    );
  }


  if (
    history.length === 0
  ) {

    return;
  }


  history.forEach(
    (item) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "history-item";


      const content =
        document.createElement(
          "div"
        );


      content.className =
        "history-item-content";


      const disease =
        document.createElement(
          "div"
        );


      disease.className =
        "history-item-disease";


      disease.textContent =
        item.recommendation &&
        item.recommendation.disease
          ? item.recommendation.disease
          : formatDiseaseLabel(
              item.prediction
            );


      const confidence =
        document.createElement(
          "div"
        );


      confidence.className =
        "history-item-confidence";


      confidence.textContent =
        `${Number(
          item.confidence
        ).toFixed(1)}% confidence`;


      const date =
        document.createElement(
          "div"
        );


      date.className =
        "history-item-date";


      date.textContent =
        formatHistoryDate(
          item.timestamp
        );


      content.appendChild(
        disease
      );


      content.appendChild(
        confidence
      );


      content.appendChild(
        date
      );


      const viewButton =
        document.createElement(
          "button"
        );


      viewButton.type =
        "button";


      viewButton.className =
        "history-view-btn";


      viewButton.textContent =
        "View";


      viewButton.addEventListener(
        "click",
        () => {

          restoreHistoryItem(
            item
          );
        }
      );


      card.appendChild(
        content
      );


      card.appendChild(
        viewButton
      );


      historyList.appendChild(
        card
      );
    }
  );
}


// =========================================================
// FORMAT HISTORY DATE
// =========================================================

function formatHistoryDate(
  timestamp
) {

  if (!timestamp) {
    return "";
  }


  const date =
    new Date(
      timestamp
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";
  }


  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  );
}


// =========================================================
// RESTORE HISTORY ITEM
// =========================================================

function restoreHistoryItem(
  item
) {

  if (!item) {
    return;
  }


  currentPrediction =
    item;


  window.currentPrediction =
    item;


  displayResults(
    item
  );


  if (resultsPanel) {

    resultsPanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


// =========================================================
// CLEAR HISTORY
// =========================================================

if (clearHistoryBtn) {

  clearHistoryBtn.addEventListener(
    "click",
    () => {

      try {

        localStorage.removeItem(
          HISTORY_KEY
        );

      } catch (error) {

        console.warn(
          "Unable to clear scan history:",
          error
        );
      }


      renderHistory();
    }
  );
}


// =========================================================
// INITIAL HISTORY LOAD
// =========================================================

renderHistory();


// =========================================================
// INITIAL UI STATE
// =========================================================

if (analyzeBtn) {

  analyzeBtn.disabled =
    !selectedFile;
}


// =========================================================
// SMOOTH NAVIGATION
// =========================================================

document
  .querySelectorAll(
    'a[href^="#"]'
  )
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute(
              "href"
            );


          if (
            !href ||
            href === "#"
          ) {

            return;
          }


          let target = null;


          try {

            target =
              document.querySelector(
                href
              );

          } catch (error) {

            return;
          }


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    }
  );


// =========================================================
// WINDOW RESIZE
// =========================================================

window.addEventListener(
  "resize",
  () => {

    if (
      window.innerWidth > 900 &&
      navbar
    ) {

      navbar.classList.remove(
        "nav-open"
      );


      if (navToggle) {

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  }
);


// =========================================================
// EXPOSE CURRENT PREDICTION
// =========================================================

window.getCurrentPlantPrediction =
  function () {

    return currentPrediction;
  };


// =========================================================
// DEBUG INFORMATION
// =========================================================

console.log(
  "Smart Plant Health Assistant loaded."
);


console.log(
  "Prediction API:",
  API_URL
);


console.log(
  "AI Assistant API:",
  ASSISTANT_API_URL
);


// =========================================================
// END
// =========================================================

})();