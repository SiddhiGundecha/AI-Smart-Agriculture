# AI Smart Agriculture — Plant Health Decision Support System

An AI-powered web application for plant disease analysis and decision support using deep learning, explainable AI, visual similarity search, weather-based environmental risk analysis, and generative AI.

## Features

- Multi-class plant disease detection using **ResNet50 transfer learning**
- **Top-3 predictions** and confidence scoring
- **Grad-CAM** for explainable predictions
- **Image quality assessment**
- Location-based **environmental risk analysis** using Open-Meteo
- **Priority Action Plan** based on prediction and environmental conditions
- **FAISS-based visual similarity search** for similar leaf cases
- **Gemini API** powered agricultural assistant
- **English, Hindi, and Marathi** language support
- Local scan history

## Tech Stack

**Machine Learning:** Python, PyTorch, Torchvision, ResNet50, Grad-CAM  
**Backend:** FastAPI, REST APIs  
**AI & Retrieval:** Gemini API, FAISS  
**External APIs:** Open-Meteo, MyMemory Translation API  
**Frontend:** HTML, CSS, JavaScript

## System Flow

```text
Leaf Image
    ↓
Image Quality Check
    ↓
ResNet50 Prediction
    ↓
Grad-CAM + Confidence
    ↓
FAISS Similar Leaf Cases
    ↓
Weather & Environmental Risk
    ↓
Priority Action Plan
    ↓
Gemini Agricultural Assistant


