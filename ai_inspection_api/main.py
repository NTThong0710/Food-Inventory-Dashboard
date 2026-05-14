from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import io
import base64
from PIL import Image

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

app = FastAPI(title="AI Inspection API")

# Cấu hình CORS để cho phép Frontend (Vue.js) gọi qua API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Biến toàn cục lưu model
yolo_model = None

# Load model khi server vừa khởi động lên
@app.on_event("startup")
def load_model():
    global yolo_model
    try:
        yolo_path = os.path.join(os.path.dirname(__file__), 'best.pt')
        if YOLO and os.path.exists(yolo_path):
            yolo_model = YOLO(yolo_path)
            print("Đã load YOLO Model thành công!")
        else:
            print("Chưa có file best.pt hoặc chưa cài ultralytics.")
    except Exception as e:
        print(f"Lỗi khi load YOLO model: {e}")

@app.post("/inspect-shipment")
async def inspect_shipment(file: UploadFile = File(...)):
    if yolo_model is None:
        return {"error": "YOLO model chưa sẵn sàng (thiếu file best.pt hoặc lỗi load)."}
        
    try:
        # Đọc file ảnh
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Chạy model YOLO dự đoán
        results = yolo_model.predict(source=image, conf=0.1)
        result = results[0]
        
        defects = []
        # Lấy thông tin các khung (bounding boxes)
        for box in result.boxes:
            class_id = int(box.cls[0])
            class_name = yolo_model.names[class_id]
            confidence = float(box.conf[0])
            
            # Các nhãn bình thường không tính là lỗi
            if class_name.lower() not in ['cardboard box', 'no defect']:
                defects.append({
                    "label": class_name,
                    "confidence": round(confidence, 2)
                })
        
        # Lấy ảnh kết quả đã được vẽ khung
        im_array = result.plot()  # numpy array (BGR)
        im = Image.fromarray(im_array[..., ::-1])  # Chuyển BGR sang RGB cho Pillow
        
        # Chuyển ảnh sang Base64
        buffered = io.BytesIO()
        im.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return {
            "is_accepted": len(defects) == 0,
            "defects": defects,
            "image_base64": f"data:image/jpeg;base64,{img_str}"
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Inspection API đang chạy ngon lành!"}
