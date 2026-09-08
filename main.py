from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import torch
import torch.nn as nn
import torch.nn.functional as F

import os
import io
import base64
import numpy as np
import cv2
import json

from pydantic import BaseModel
from google import genai

from torchvision import models, transforms
from PIL import Image


# =========================================================
# 1. LOAD RECOMMENDATIONS
# =========================================================

with open("recommendations.json", "r", encoding="utf-8") as f:
    RECOMMENDATIONS = json.load(f)


# =========================================================
# 2. CONFIGURATION
# =========================================================

MODEL_PATH = r"D:\Projects\Agriculture\plant_disease_resnet50_weighted_best.pth"

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# =========================================================
# GEMINI AI ASSISTANT
# =========================================================

gemini_client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

GEMINI_MODEL = "gemini-3.6-flash"


# =========================================================
# 3. CLASS NAMES
# =========================================================

class_names = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]


# =========================================================
# 4. IMAGE TRANSFORM
# =========================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =========================================================
# 5. LOAD MODEL
# =========================================================

model = models.resnet50(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    len(class_names)
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)
model.eval()


print("========================================")
print("      Plant Disease Detection API")
print("========================================")
print("Device:", device)
print("Number of classes:", len(class_names))
print(
    "Validation Accuracy:",
    f"{checkpoint['val_acc'] * 100:.2f}%"
)
print("Model loaded successfully.")
print("========================================")


# =========================================================
# 6. GRAD-CAM SETUP
# =========================================================

target_layer = model.layer4[-1]

activations = None
gradients = None


def forward_hook(module, input, output):
    global activations
    activations = output


def backward_hook(module, grad_input, grad_output):
    global gradients
    gradients = grad_output[0]


target_layer.register_forward_hook(forward_hook)
target_layer.register_full_backward_hook(backward_hook)


# =========================================================
# 7. GRAD-CAM FUNCTION
# =========================================================

def generate_gradcam(image, input_tensor, predicted_class):

    global activations
    global gradients

    # Clear previous values
    activations = None
    gradients = None

    # Forward pass
    model.zero_grad()

    output = model(input_tensor)

    # Backward pass for predicted class
    output[0, predicted_class].backward()

    # Get activation and gradient
    activation = activations[0]
    gradient = gradients[0]

    # Calculate channel weights
    weights = gradient.mean(
        dim=(1, 2)
    )

    # Weighted combination
    cam = torch.zeros(
        activation.shape[1:],
        device=device
    )

    for i, weight in enumerate(weights):
        cam += weight * activation[i]

    # ReLU
    cam = F.relu(cam)

    # Normalize
    cam -= cam.min()
    cam /= cam.max() + 1e-8

    # Convert to NumPy
    cam = cam.detach().cpu().numpy()

    # Resize heatmap to original image
    heatmap = cv2.resize(
        cam,
        (image.width, image.height)
    )

    # Convert to 0-255
    heatmap = np.uint8(
        255 * heatmap
    )

    # Apply color map
    heatmap_color = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    # PIL image → OpenCV
    original = np.array(image)

    original = cv2.cvtColor(
        original,
        cv2.COLOR_RGB2BGR
    )

    # Overlay heatmap
    overlay = cv2.addWeighted(
        original,
        0.6,
        heatmap_color,
        0.4,
        0
    )

    # OpenCV BGR → RGB
    overlay = cv2.cvtColor(
        overlay,
        cv2.COLOR_BGR2RGB
    )

    # Convert to PIL
    result_image = Image.fromarray(
        overlay
    )

    # Convert image to bytes
    buffer = io.BytesIO()

    result_image.save(
        buffer,
        format="JPEG"
    )

    # Encode Base64
    encoded_image = base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")

    return encoded_image


# =========================================================
# 8. FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Plant Disease Detection API",
    description="AI-based plant disease detection using ResNet50 and Grad-CAM",
    version="1.0"
)


# =========================================================
# ASSISTANT REQUEST MODEL
# =========================================================

class AssistantRequest(BaseModel):
    disease: str
    confidence: float
    top_predictions: list
    question: str


# =========================================================
# 9. CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# 10. HOME ROUTE
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Plant Disease Detection API is running",
        "model": "ResNet50",
        "classes": len(class_names),
        "explainability": "Grad-CAM"
    }


# =========================================================
# 11. PREDICTION + TOP-3 + GRAD-CAM ROUTE
# =========================================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # -----------------------------------------------------
    # 1. Read uploaded image
    # -----------------------------------------------------

    contents = await file.read()

    image = Image.open(
        io.BytesIO(contents)
    ).convert("RGB")


    # -----------------------------------------------------
    # 2. Preprocess image
    # -----------------------------------------------------

    input_tensor = transform(
        image
    ).unsqueeze(0).to(device)


    # -----------------------------------------------------
    # 3. Model prediction
    # -----------------------------------------------------

    model.zero_grad()

    outputs = model(input_tensor)

    probabilities = torch.softmax(
        outputs,
        dim=1
    )


    # -----------------------------------------------------
    # 4. Get Top-3 predictions
    # -----------------------------------------------------

    top_probs, top_indices = torch.topk(
        probabilities,
        k=3,
        dim=1
    )

    top_predictions = []

    for prob, idx in zip(
        top_probs[0],
        top_indices[0]
    ):

        top_predictions.append({
            "class": class_names[idx.item()],
            "confidence": round(
                prob.item() * 100,
                2
            )
        })


    # -----------------------------------------------------
    # 5. Top-1 prediction
    # -----------------------------------------------------

    predicted_class = top_predictions[0]["class"]

    confidence_value = (
        top_predictions[0]["confidence"] / 100
    )

    predicted_index = top_indices[0][0].item()


    # -----------------------------------------------------
    # 6. Get recommendation
    # -----------------------------------------------------

    recommendation = RECOMMENDATIONS.get(
        predicted_class,
        {
            "crop": "Unknown",
            "disease": predicted_class,
            "description": "No recommendation information is available for this prediction.",
            "symptoms": [],
            "recommended_actions": [],
            "prevention": []
        }
    )


    # -----------------------------------------------------
    # 7. Generate Grad-CAM
    # -----------------------------------------------------

    gradcam_image = generate_gradcam(
        image,
        input_tensor,
        predicted_index
    )


    # -----------------------------------------------------
    # 8. Return result
    # -----------------------------------------------------

    return {
        "filename": file.filename,

        "prediction": predicted_class,

        "confidence": round(
            confidence_value * 100,
            2
        ),

        "top_predictions": top_predictions,

        "gradcam": gradcam_image,

        "recommendation": recommendation
    }


# =========================================================
# 12. AI AGRICULTURE ASSISTANT
# =========================================================

@app.post("/assistant")
async def assistant(request: AssistantRequest):

    question = request.question.strip()

    if not question:
        return {
            "answer": "Please enter a question about the detected plant condition."
        }


    top_predictions_text = "\n".join(
        [
            f"{i + 1}. {item.get('class', 'Unknown')} "
            f"({item.get('confidence', 0)}%)"
            for i, item in enumerate(
                request.top_predictions[:3]
            )
        ]
    )


    prompt = f"""
You are an AI Agriculture Assistant inside a plant disease
detection application.

The plant disease model has already analyzed the image.

Detected condition:
{request.disease}

Model confidence:
{request.confidence}%

Top predictions:
{top_predictions_text}

User question:
{question}

Instructions:

- Answer the user's actual question directly.
- Keep the answer SHORT and practical.
- For simple questions, answer in 2-3 short sentences.
- For care or treatment questions, use a maximum of 4-5 short bullet points.
- Do not use long introductions or unnecessary explanations.
- Do not use markdown headings or long numbered sections.
- Do not unnecessarily repeat the disease name, confidence, or Top-3 predictions.
- Use the Top-3 predictions only when they are relevant to the user's question.
- If confidence is low or predictions are close, briefly mention the uncertainty.
- Treat the prediction as a model prediction, not a guaranteed diagnosis.
- Do not claim that you personally diagnosed the plant.
- Give practical, general plant-care advice.
- Do not invent pesticide names, doses, chemical concentrations, or application schedules.
- For chemical treatment, advise consulting a local agricultural expert and following the product label.
- Do not describe model confidence, Grad-CAM, or AI Attention Impact Score as laboratory-confirmed disease severity.
- You have not been given the actual image. Do not say "Based on the image provided".
- Use simple language suitable for students and farmers.
- If the question is unrelated to plant health or agriculture, politely explain that you are designed for plant-health assistance.
"""


    try:

        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )

        return {
            "answer": response.text
        }


    except Exception as e:

        print("Gemini Error:", e)

        return {
            "answer": "Sorry, I could not generate an AI response right now."
        }