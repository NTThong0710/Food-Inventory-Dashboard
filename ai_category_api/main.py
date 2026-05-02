from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import re
import os

app = FastAPI(title="Food Category API")

# Cấu hình CORS để cho phép Frontend (Vue.js) gọi qua API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong thực tế có thể thay bằng Domain Web của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Biến toàn cục lưu model
model = None
vectorizer = None

# Load model khi server vừa khởi động lên
@app.on_event("startup")
def load_model():
    global model, vectorizer
    try:
        # Đường dẫn tới 2 file .pkl (đảm bảo file nằm cùng thư mục với main.py)
        model_path = os.path.join(os.path.dirname(__file__), 'food_category_model.pkl')
        vocab_path = os.path.join(os.path.dirname(__file__), 'tfidf_vectorizer.pkl')
        
        model = joblib.load(model_path)
        vectorizer = joblib.load(vocab_path)
        print("Đã load Model và Vectorizer thành công!")
    except Exception as e:
        print(f"Lỗi khi load model: {e}")

# Hàm làm sạch dữ liệu
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Khai báo cấu trúc dữ liệu đầu vào
class FoodInput(BaseModel):
    name: str

@app.post("/predict")
def predict_category(food: FoodInput):
    if model is None or vectorizer is None:
        return {"error": "Server chưa sẵn sàng hoặc thiếu file .pkl"}
    
    if not food.name.strip():
        return {"category": ""}
        
    try:
        # 1. Làm sạch text
        cleaned_text = clean_text(food.name)
        # 2. Chuyển thành số
        vectorized_text = vectorizer.transform([cleaned_text])
        
        # Nếu không có từ nào trong input khớp với từ điển của model
        if vectorized_text.nnz == 0:
            return {
                "is_food": False, 
                "category": "", 
                "message": "Tên này có vẻ không phải là món ăn hoặc thức uống."
            }
            
        # 3. Dự đoán
        prediction = model.predict(vectorized_text)[0]
        
        # 4. Kiểm tra độ tin cậy (nếu model có hỗ trợ)
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(vectorized_text)[0]
            if max(proba) < 0.25:
                return {
                    "is_food": False, 
                    "category": "", 
                    "message": "Tên này có vẻ không phải là món ăn hoặc thức uống."
                }
        
        return {"is_food": True, "category": prediction}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Food Category API đang chạy ngon lành!"}
