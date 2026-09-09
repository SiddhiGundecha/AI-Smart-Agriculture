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
import asyncio

from pydantic import BaseModel
from google import genai

from torchvision import models, transforms
from PIL import Image
from urllib.parse import urlencode
from urllib.request import urlopen
from urllib.error import HTTPError, URLError
import urllib.parse

try:
    import faiss
except ImportError:
    faiss = None


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
# MYMEMORY TRANSLATION (FREE HOSTED API)
# =========================================================
MYMEMORY_URL = "https://api.mymemory.translated.net/get"
SUPPORTED_TRANSLATION_LANGUAGES = {"en", "hi", "mr"}

class TranslateRequest(BaseModel):
    texts: list[str]
    target_language: str

def translate_with_mymemory(text: str, target_language: str) -> str:
    if not text or not text.strip() or target_language == "en":
        return text
    params = urllib.parse.urlencode({"q": text, "langpair": f"en|{target_language}"})
    request = urllib.request.Request(
        f"{MYMEMORY_URL}?{params}",
        headers={"User-Agent": "AI-Smart-Agriculture/1.0"}
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            raw_data = response.read()
        data = json.loads(raw_data.decode("utf-8-sig"))
        translated = data.get("responseData", {}).get("translatedText")
        return translated or text
    except Exception as exc:
        print(f"MyMemory translation error: {exc}")
        return text

@app.post("/translate")
async def translate(request: TranslateRequest):
    target_language = request.target_language.lower().strip()
    if target_language not in SUPPORTED_TRANSLATION_LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported translation language.")
    if not request.texts or target_language == "en":
        return {"translations": request.texts}
    translations = []
    for text in request.texts:
        translations.append(await asyncio.to_thread(translate_with_mymemory, text, target_language))
    return {"translations": translations}


# =========================================================
# DECISION SUPPORT ENGINE
# =========================================================
def build_decision_plan(disease, confidence, weather_score=None):
    confidence = max(0.0, min(1.0, float(confidence or 0)))
    score = None if weather_score is None else float(weather_score)
    recommendation = RECOMMENDATIONS.get(disease, {})
    actions = recommendation.get("recommended_actions") or recommendation.get("actions") or []
    prevention = recommendation.get("prevention") or []

    if score is not None and score >= 75:
        priority = "High priority"
        rationale = "Weather conditions are highly favorable for the detected condition, so early field action is advisable."
    elif score is not None and score >= 50:
        priority = "Watch closely"
        rationale = "Weather conditions may favor the detected condition, so closer monitoring and preventive action are advisable."
    elif confidence < 0.60:
        priority = "Verify first"
        rationale = "Model confidence is limited; confirm the condition with a clearer image or field inspection before disease-specific action."
    else:
        priority = "Monitor"
        rationale = "Use the model result as guidance and continue routine field monitoring."

    immediate = [str(x) for x in actions[:2]] or ["Inspect the affected plant and nearby plants for similar symptoms."]
    monitoring = [str(x) for x in prevention[:2]] or ["Continue regular crop monitoring and sanitation."]
    verification = []
    if confidence < 0.75:
        verification.append("Consider a clearer leaf image or local expert verification before disease-specific treatment.")
    return {"priority": priority, "rationale": rationale, "immediate_actions": immediate, "monitoring": monitoring, "verification": verification, "basis": {"model_confidence": round(confidence*100,2), "weather_score": None if score is None else round(score,1)}}

class DecisionPlanRequest(BaseModel):
    disease: str
    confidence: float
    weather_score: float | None = None

@app.post("/decision-plan")
def decision_plan(request: DecisionPlanRequest):
    return build_decision_plan(request.disease, request.confidence, request.weather_score)


# =========================================================
# IMAGE SIMILARITY / REFERENCE CASE RETRIEVAL
# =========================================================
SIMILARITY_INDEX_PATH = os.path.join(os.path.dirname(__file__), "similarity_index.faiss")
SIMILARITY_METADATA_PATH = os.path.join(os.path.dirname(__file__), "similarity_metadata.json")
SIMILARITY_EMBEDDINGS_PATH = os.path.join(os.path.dirname(__file__), "similarity_embeddings.npy")
_similarity_model = None


def _load_similarity_store():
    if not os.path.exists(SIMILARITY_METADATA_PATH):
        return None, None
    try:
        with open(SIMILARITY_METADATA_PATH, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        if faiss is not None and os.path.exists(SIMILARITY_INDEX_PATH):
            return faiss.read_index(SIMILARITY_INDEX_PATH), metadata
        if os.path.exists(SIMILARITY_EMBEDDINGS_PATH):
            return np.load(SIMILARITY_EMBEDDINGS_PATH), metadata
    except Exception as exc:
        print(f"Similarity index load error: {exc}")
    return None, None


def _get_embedding_model():
    global _similarity_model
    if _similarity_model is not None:
        return _similarity_model
    backbone = models.resnet50(weights=None)
    backbone.fc = nn.Linear(backbone.fc.in_features, len(class_names))
    checkpoint = torch.load(MODEL_PATH, map_location=device)
    backbone.load_state_dict(checkpoint["model_state_dict"])
    backbone.fc = nn.Identity()
    _similarity_model = backbone.to(device).eval()
    return _similarity_model


def _embedding_from_image(image):
    tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        vector = _get_embedding_model()(tensor).flatten(1)
        vector = F.normalize(vector, p=2, dim=1)
    return vector.cpu().numpy().astype("float32")


def find_similar_cases(image, predicted_class, k=5):
    store, metadata = _load_similarity_store()
    if store is None or not metadata:
        return []
    query = _embedding_from_image(image)
    k = min(int(k), len(metadata))
    if faiss is not None and hasattr(store, "search"):
        scores, indices = store.search(query, k)
        scores, indices = scores[0], indices[0]
    else:
        similarities = np.asarray(store) @ query[0]
        indices = np.argsort(-similarities)[:k]
        scores = similarities[indices]
    results=[]
    for score, idx in zip(scores, indices):
        idx=int(idx)
        if idx<0 or idx>=len(metadata): continue
        item=dict(metadata[idx])
        item["similarity"]=round(float(score)*100,2)
        item["same_condition"] = str(item.get("label", "")) == str(predicted_class)
        try:
            ref_image = Image.open(item["path"]).convert("RGB")
            ref_image.thumbnail((180, 180))
            buf = io.BytesIO()
            ref_image.save(buf, format="JPEG", quality=72)
            item["thumbnail"] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")
        except Exception:
            item["thumbnail"] = None
        results.append(item)
    return results

@app.post("/similar-cases")
async def similar_cases(file: UploadFile = File(...), predicted_class: str = ""):
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")
    store, _ = _load_similarity_store()
    return {"available": store is not None, "predicted_class": predicted_class, "cases": find_similar_cases(image, predicted_class, 5)}

# =========================================================
# WEATHER-AWARE DISEASE RISK ENGINE
# =========================================================

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"


class WeatherRiskRequest(BaseModel):
    disease: str
    latitude: float
    longitude: float


def fetch_json(url, params):
    """
    Fetch JSON data using Python's standard library.
    No extra package/API key required.
    """
    query = urlencode(params)
    full_url = f"{url}?{query}"

    try:
        with urlopen(full_url, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))

    except HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Weather service returned HTTP {e.code}"
        )

    except URLError:
        raise HTTPException(
            status_code=502,
            detail="Unable to reach the weather service."
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve weather data."
        )


def get_weather_profile(disease):
    """
    Returns a transparent rule-based environmental profile.

    This is NOT a disease prediction model.
    It estimates whether current/forecast weather
    resembles conditions that can favor the detected condition.
    """

    disease_lower = disease.lower()

    # -----------------------------------------------------
    # Healthy prediction
    # -----------------------------------------------------

    if "healthy" in disease_lower:
        return {
            "type": "healthy",
            "label": "No disease-specific risk",
            "min_temp": None,
            "max_temp": None,
            "moisture_sensitive": False
        }

    # -----------------------------------------------------
    # Late blight
    # -----------------------------------------------------

    if "late_blight" in disease_lower:
        return {
            "type": "cool_wet",
            "label": "Cool and wet conditions",
            "min_temp": 15.5,
            "max_temp": 21.0,
            "moisture_sensitive": True
        }

    # -----------------------------------------------------
    # Apple scab
    # -----------------------------------------------------

    if "apple_scab" in disease_lower:
        return {
            "type": "apple_scab",
            "label": "Leaf-wetness and moderate temperatures",
            "min_temp": 10.0,
            "max_temp": 24.0,
            "moisture_sensitive": True
        }

    # -----------------------------------------------------
    # Powdery mildew
    # -----------------------------------------------------

    if "powdery_mildew" in disease_lower:
        return {
            "type": "powdery_mildew",
            "label": "Humid conditions with suitable temperatures",
            "min_temp": 18.0,
            "max_temp": 27.0,
            "moisture_sensitive": True
        }

    # -----------------------------------------------------
    # Spider mites
    # -----------------------------------------------------

    if "spider_mites" in disease_lower:
        return {
            "type": "hot_dry",
            "label": "Hot and dry conditions",
            "min_temp": 28.0,
            "max_temp": 40.0,
            "moisture_sensitive": False
        }

    # -----------------------------------------------------
    # Bacterial diseases
    # -----------------------------------------------------

    if "bacterial" in disease_lower:
        return {
            "type": "warm_wet",
            "label": "Warm and wet conditions",
            "min_temp": 24.0,
            "max_temp": 30.0,
            "moisture_sensitive": True
        }

    # -----------------------------------------------------
    # Common fungal / leaf-spot diseases
    # -----------------------------------------------------

    fungal_keywords = [
        "black_rot",
        "leaf_blight",
        "early_blight",
        "septoria",
        "target_spot",
        "gray_leaf_spot",
        "common_rust",
        "cedar_apple_rust",
        "esca",
        "leaf_scorch"
    ]

    if any(keyword in disease_lower for keyword in fungal_keywords):
        return {
            "type": "humid_fungal",
            "label": "Humid and moisture-favorable conditions",
            "min_temp": 18.0,
            "max_temp": 30.0,
            "moisture_sensitive": True
        }

    # -----------------------------------------------------
    # Viral / conditions where weather is not a direct
    # disease indicator
    # -----------------------------------------------------

    viral_keywords = [
        "virus",
        "mosaic",
        "yellow_leaf_curl",
        "haunglongbing"
    ]

    if any(keyword in disease_lower for keyword in viral_keywords):
        return {
            "type": "limited",
            "label": "Weather has limited direct relevance",
            "min_temp": None,
            "max_temp": None,
            "moisture_sensitive": False
        }

    # -----------------------------------------------------
    # Generic fallback
    # -----------------------------------------------------

    return {
        "type": "humid_fungal",
        "label": "Humidity and moisture-favorable conditions",
        "min_temp": 18.0,
        "max_temp": 30.0,
        "moisture_sensitive": True
    }


def calculate_hourly_risk(
    profile,
    temperature,
    humidity,
    precipitation,
    precipitation_probability
):
    """
    Transparent heuristic score from 0-100.

    This score represents environmental suitability,
    NOT probability that the plant has or will develop disease.
    """

    profile_type = profile["type"]

    if profile_type == "healthy":
        return 0, []

    if profile_type == "limited":
        return 0, [
            "Weather is not treated as a direct indicator for this condition."
        ]

    score = 0
    drivers = []

    # =====================================================
    # HOT + DRY CONDITIONS
    # =====================================================

    if profile_type == "hot_dry":

        if temperature >= 32:
            score += 35
            drivers.append("Very warm conditions")

        elif temperature >= 28:
            score += 25
            drivers.append("Warm conditions")

        if humidity <= 45:
            score += 30
            drivers.append("Low humidity")

        elif humidity <= 55:
            score += 20
            drivers.append("Relatively dry air")

        if precipitation < 0.5:
            score += 20
            drivers.append("Little precipitation")

        return min(score, 100), drivers

    # =====================================================
    # TEMPERATURE
    # =====================================================

    min_temp = profile["min_temp"]
    max_temp = profile["max_temp"]

    if min_temp <= temperature <= max_temp:
        score += 30
        drivers.append("Temperature is favorable")

    elif (
        min_temp - 5
        <= temperature
        <= max_temp + 5
    ):
        score += 15
        drivers.append("Temperature is moderately favorable")

    # =====================================================
    # HUMIDITY
    # =====================================================

    if humidity >= 90:
        score += 30
        drivers.append("Very high humidity")

    elif humidity >= 80:
        score += 25
        drivers.append("High humidity")

    elif humidity >= 70:
        score += 12
        drivers.append("Moderately high humidity")

    # =====================================================
    # PRECIPITATION
    # =====================================================

    if precipitation >= 2:
        score += 25
        drivers.append("Rain/precipitation is present")

    elif precipitation >= 0.5:
        score += 15
        drivers.append("Some precipitation is expected")

    elif precipitation_probability >= 60:
        score += 10
        drivers.append("Rain probability is elevated")

    # =====================================================
    # POWDERY MILDEW SPECIAL CASE
    # =====================================================

    if profile_type == "powdery_mildew":

        # Powdery mildew can favor humid nights while
        # spreading during warmer/drier periods.
        if humidity >= 80:
            score += 10

        if precipitation < 0.5:
            score += 5

    return min(score, 100), drivers


def risk_level(score):

    if score >= 75:
        return "Very High"

    if score >= 50:
        return "High"

    if score >= 25:
        return "Moderate"

    return "Low"


def get_weather_risk(disease, latitude, longitude):

    profile = get_weather_profile(disease)

    weather = fetch_json(
        OPEN_METEO_FORECAST_URL,
        {
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "precipitation,"
                "wind_speed_10m"
            ),
            "hourly": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "precipitation,"
                "precipitation_probability"
            ),
            "forecast_days": 7,
            "timezone": "auto"
        }
    )

    current = weather.get("current", {})
    hourly = weather.get("hourly", {})

    current_temperature = float(
        current.get("temperature_2m", 0)
    )

    current_humidity = float(
        current.get("relative_humidity_2m", 0)
    )

    current_precipitation = float(
        current.get("precipitation", 0)
    )

    current_wind = float(
        current.get("wind_speed_10m", 0)
    )

    current_score, current_drivers = calculate_hourly_risk(
        profile,
        current_temperature,
        current_humidity,
        current_precipitation,
        0
    )

    temperatures = hourly.get("temperature_2m", [])
    humidities = hourly.get("relative_humidity_2m", [])
    precipitation = hourly.get("precipitation", [])
    precipitation_probability = hourly.get(
        "precipitation_probability",
        []
    )

    hourly_scores = []
    hourly_drivers = []

    for i in range(len(temperatures)):

        temp = float(temperatures[i] or 0)

        humidity = float(
            humidities[i] or 0
        )

        rain = float(
            precipitation[i] or 0
        )

        rain_probability = float(
            precipitation_probability[i] or 0
        )

        score, drivers = calculate_hourly_risk(
            profile,
            temp,
            humidity,
            rain,
            rain_probability
        )

        hourly_scores.append(score)

        hourly_drivers.extend(drivers)

    # -----------------------------------------------------
    # Next 24 hours
    # -----------------------------------------------------

    next_24_scores = hourly_scores[:24]

    next_24_score = (
        max(next_24_scores)
        if next_24_scores
        else current_score
    )

    # -----------------------------------------------------
    # Next 7 days
    # -----------------------------------------------------

    next_7_score = (
        max(hourly_scores)
        if hourly_scores
        else current_score
    )

    # -----------------------------------------------------
    # Consolidate risk drivers
    # -----------------------------------------------------
    # Keep one representative driver per weather factor.
    # This avoids showing overlapping messages such as
    # "Very high humidity", "High humidity", and
    # "Moderately high humidity" together.
    all_drivers = current_drivers + hourly_drivers

    driver_priority = {
        "Very warm conditions": ("temperature", 3),
        "Warm conditions": ("temperature", 2),
        "Temperature is favorable": ("temperature", 3),
        "Temperature is moderately favorable": ("temperature", 1),
        "Low humidity": ("humidity", 3),
        "Relatively dry air": ("humidity", 2),
        "Very high humidity": ("humidity", 3),
        "High humidity": ("humidity", 2),
        "Moderately high humidity": ("humidity", 1),
        "Little precipitation": ("precipitation", 1),
        "Some precipitation is expected": ("precipitation", 2),
        "Rain/precipitation is present": ("precipitation", 3),
        "Rain probability is elevated": ("precipitation", 2),
    }

    selected = {}
    fallback = []

    for driver in all_drivers:
        category, priority = driver_priority.get(driver, (None, 0))
        if category is None:
            if driver not in fallback:
                fallback.append(driver)
            continue
        if category not in selected or priority > selected[category][1]:
            selected[category] = (driver, priority)

    unique_drivers = [
        selected[key][0]
        for key in ("temperature", "humidity", "precipitation")
        if key in selected
    ]
    unique_drivers.extend(fallback)
    unique_drivers = unique_drivers[:5]

    # -----------------------------------------------------
    # Disease-specific message
    # -----------------------------------------------------

    if profile["type"] == "healthy":

        explanation = (
            "The model currently predicts a healthy leaf, "
            "so a disease-specific weather risk is not calculated."
        )

    elif profile["type"] == "limited":

        explanation = (
            "Weather can affect plant stress and disease ecology, "
            "but it is not used here as a direct indicator for this condition."
        )

    else:

        explanation = (
            "This score estimates how closely the current and "
            "forecast weather resembles environmental conditions "
            "that can favor the detected condition."
        )

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "timezone": weather.get("timezone")
        },

        "current_weather": {
            "temperature_c": round(
                current_temperature,
                1
            ),
            "humidity_percent": round(
                current_humidity,
                1
            ),
            "precipitation_mm": round(
                current_precipitation,
                2
            ),
            "wind_speed_kmh": round(
                current_wind,
                1
            )
        },

        "disease": disease,

        "weather_profile": {
            "type": profile["type"],
            "label": profile["label"]
        },

        "risk": {
            "current_score": current_score,
            "current_level": risk_level(
                current_score
            ),

            "next_24h_score": next_24_score,
            "next_24h_level": risk_level(
                next_24_score
            ),

            "next_7d_score": next_7_score,
            "next_7d_level": risk_level(
                next_7_score
            ),

            "drivers": unique_drivers,

            "explanation": explanation
        },

        "decision_plan": build_decision_plan(disease, 0.0, next_24_score),
        "source": "Open-Meteo"
    }


# =========================================================
# WEATHER LOCATION SEARCH
# =========================================================

@app.get("/geocode")
def geocode(location: str):

    location = location.strip()

    if not location:
        raise HTTPException(
            status_code=400,
            detail="Location cannot be empty."
        )

    data = fetch_json(
        OPEN_METEO_GEOCODING_URL,
        {
            "name": location,
            "count": 5,
            "language": "en",
            "format": "json"
        }
    )

    results = []

    for item in data.get("results", []):

        results.append({
            "name": item.get("name"),
            "country": item.get("country"),
            "admin1": item.get("admin1"),
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude"),
            "timezone": item.get("timezone")
        })

    return {
        "results": results
    }


# =========================================================
# WEATHER RISK ENDPOINT
# =========================================================

@app.post("/weather-risk")
def weather_risk(request: WeatherRiskRequest):

    if not -90 <= request.latitude <= 90:
        raise HTTPException(
            status_code=400,
            detail="Invalid latitude."
        )

    if not -180 <= request.longitude <= 180:
        raise HTTPException(
            status_code=400,
            detail="Invalid longitude."
        )

    return get_weather_risk(
        request.disease,
        request.latitude,
        request.longitude
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

        "recommendation": recommendation,
        "decision_plan": build_decision_plan(predicted_class, confidence_value, None)
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