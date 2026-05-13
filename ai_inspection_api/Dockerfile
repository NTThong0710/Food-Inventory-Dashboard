FROM python:3.9-slim

WORKDIR /app

# Cài đặt thư viện hệ thống cho OpenCV (Dùng libgl1 thay cho libgl1-mesa-glx cũ)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code và file model vào
COPY . .

# Hugging Face Spaces yêu cầu ứng dụng phải chạy ở cổng 7860
EXPOSE 7860

# Lệnh khởi động FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
