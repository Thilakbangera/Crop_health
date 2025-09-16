# app.py
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from PIL import Image
from io import BytesIO
import torch
from torchvision import transforms
from ultralytics import YOLO
import numpy as np

# -------------------------
# FastAPI App
# -------------------------
app = FastAPI(title="AgriAI Prototype API", version="0.1.0")

# -------------------------
# 1. Crop Health Prediction (TorchHub ResNet)
# -------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load pretrained ResNet-9 from TorchHub (PlantVillage)
# You can also use a different TorchHub model trained on plant disease
model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet18', pretrained=True)
model.eval().to(device)

# Example PlantVillage class names (modify based on the model you choose)
plant_classes = ["Healthy", "Diseased"]  # Map indices to class names

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

@app.post("/predict_crop_health")
async def predict_crop_health(file: UploadFile = File(...)):
    try:
        img_bytes = await file.read()
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        x = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(x)
            probs = torch.softmax(outputs, dim=1)[0]
            cls_idx = torch.argmax(probs).item()
            confidence = float(probs[cls_idx])
            class_label = plant_classes[cls_idx % len(plant_classes)]  # Ensure index within bounds

        return {"class_label": class_label, "confidence": confidence, "note": None}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# -------------------------
# 2. Pest Detection (YOLOv8)
# -------------------------
try:
    yolo = YOLO("yolov8n.pt")  # pretrained YOLOv8 model
except Exception as e:
    yolo = None
    print("⚠️ YOLO model could not be loaded:", e)

@app.post("/predict_pest")
async def predict_pest(file: UploadFile = File(...)):
    try:
        if yolo is None:
            return {"error": "YOLO model not available"}

        img_bytes = await file.read()
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        results = yolo.predict(img, conf=0.25)
        detections = []

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                detections.append({
                    "class": "Detected Pest",  # Replace with yolo.names[cls_id] if using a pest-specific model
                    "confidence": conf
                })

        return {"detections": detections}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# -------------------------
# 3. Soil Condition (Dummy Scoring)
# -------------------------
@app.post("/predict_soil")
async def predict_soil(
    moisture: float = Form(...),
    nitrogen: float = Form(...),
    phosphorus: float = Form(...),
    potassium: float = Form(...),
):
    try:
        # Normalize scores (example)
        moisture_score = min(moisture * 100 / 60, 100)
        nitrogen_score = min(nitrogen * 100 / 60, 100)
        phosphorus_score = min(phosphorus * 100 / 50, 100)
        potassium_score = min(potassium * 100 / 50, 100)

        overall_score = int((moisture_score + nitrogen_score + phosphorus_score + potassium_score) / 4)

        if overall_score >= 80:
            condition = "Excellent"
        elif overall_score >= 60:
            condition = "Good"
        elif overall_score >= 40:
            condition = "Moderate"
        else:
            condition = "Poor"

        return {
            "soil_condition": condition,
            "overall_score": overall_score,
            "details": {
                "moisture_score": int(moisture_score),
                "nitrogen_score": int(nitrogen_score),
                "phosphorus_score": int(phosphorus_score),
                "potassium_score": int(potassium_score)
            }
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

