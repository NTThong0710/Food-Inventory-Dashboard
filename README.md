# 🍽️ FOOD MANAGEMENT SYSTEM

FOOD MANAGEMENT SYSTEM is a comprehensive, AI-powered food management platform designed to streamline operations for food businesses. Built with modern web technologies and intelligent automation, it provides end-to-end solutions for inventory management, sales processing, and customer engagement.

## 📦 Technologies

### Frontend
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend & AI
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-000000?style=for-the-badge&logo=chromadb&logoColor=white)

### DevOps & Infrastructure
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

<br>

## 🎥 Demo Screenshots

Here are some key interface previews:

<div align="center">
  <img src="https://via.placeholder.com/800x400/4FC08D/white?text=Dashboard+Preview" alt="Dashboard Preview" width="800" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin: 10px;">
  <img src="https://via.placeholder.com/800x400/38B2AC/white?text=POS+System" alt="POS System" width="800" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin: 10px;">
</div>

<br>

## ✨ Features

- **Smart Inventory Management:** Real-time stock tracking with automated alerts for low stock and expiration dates.
- **AI-Powered Chatbot:** Intelligent recipe recommendations and Q&A using RAG (Retrieval-Augmented Generation).
- **Automated Quality Inspection:** AI-driven image analysis for food quality control using YOLOv8.
- **Point of Sale (POS) System:** Modern checkout interface with order management and payment processing.
- **Customer Relationship Management:** Booking system, customer profiles, and feedback collection.
- **Sales Analytics:** Comprehensive reporting with forecasting capabilities.
- **Multi-role Authentication:** Secure access control for different user types (admin, staff, customer).
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile devices.
- **Real-time Synchronization:** Live updates across all connected devices.

<br>

## 🛤️ The Development Process

Building FOOD MANAGEMENT SYSTEM was an intensive full-stack development journey. Here's how I approached it:

1. **Planning & Architecture:**
   * Designed the system architecture with microservices for AI components.
   * Created database schema in Supabase (PostgreSQL) for core business data.
   * Planned AI integrations for chatbot, categorization, and inspection services.

2. **Backend Development:**
   * Set up Supabase for authentication and database management.
   * Built Python FastAPI services for AI functionalities (chatbot, inspection, categorization).
   * Implemented RESTful APIs for inventory, POS, and customer management.

3. **Frontend Development:**
   * Initialized the project with Vue 3, TypeScript, and Vite for optimal performance.
   * Created modular components for each feature (inventory, POS, dashboard, etc.).
   * Integrated real-time data synchronization using Supabase's real-time features.

4. **AI Integration:**
   * Developed RAG-based chatbot using ChromaDB for vector storage.
   * Implemented YOLOv8 model for automated quality inspection.
   * Built machine learning categorization service for food items.

5. **Testing & Deployment:**
   * Deployed frontend to Vercel for global CDN distribution.
   * Containerized AI services with Docker for scalable deployment.
   * Implemented comprehensive testing and monitoring.

<br>

## 🧠 What I Learned

This project significantly enhanced my technical skills and understanding:

* **Full-Stack Architecture:** Mastered integrating Vue.js frontend with Python AI services and Supabase backend.
* **AI/ML Integration:** Gained practical experience with computer vision (YOLOv8), NLP (RAG), and machine learning deployment.
* **Real-time Systems:** Learned to implement real-time features using WebSockets and database triggers.
* **Microservices Design:** Understood the benefits and challenges of microservices architecture for AI components.
* **Modern Vue.js:** Deepened knowledge of Vue 3 Composition API, TypeScript integration, and performance optimization.
* **DevOps Practices:** Improved skills in Docker containerization, CI/CD pipelines, and cloud deployment.

<br>

## 🏃 How to Run (Installation)

Follow the steps below to run the project locally.

### Prerequisites
* Node.js (v18+)
* Python 3.9+
* Supabase account
* Docker (for AI services)

### Phase 1: Setup Supabase
1. Create a new Supabase project
2. Run the SQL migrations from `supabase_*.sql` files
3. Configure authentication and RLS policies

### Phase 2: Start Frontend (Run this first)

```bash
cd FOOD_MANAGEMENT
npm install
npm run dev
# Frontend will run on: http://localhost:5173
```

### Phase 3: Start AI Services
```bash
# Chatbot API
cd ai_chatbot_api
pip install -r requirements.txt
python main.py
# Runs on port 8001

# Category API
cd ../ai_category_api
pip install -r requirements.txt
python main.py
# Runs on port 8002

# Inspection API
cd ../ai_inspection_api
pip install -r requirements.txt
python main.py
# Runs on port 8003
```

### Phase 4: Environment Configuration

Create `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CHATBOT_API_URL=http://localhost:8001
VITE_CATEGORY_API_URL=http://localhost:8002
VITE_INSPECTION_API_URL=http://localhost:8003
```

### Phase 5: Build for Production
```bash
npm run build
npm run preview
```

<br>

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│              (Vue 3 + TypeScript + Tailwind CSS)            │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Inventory │ POS │ Customer │ Chatbot │ Admin   │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬─────────────────────────────┐
        │   REST APIs         │                             │
        │ (Axios Client)      │                             │
        └─────────────────────┘                             │
                   │                                        │
        ┌──────────┴──────────┬─────────────────────────────┴─────┐
        │  Core Services      │                                      │
        │  (Supabase)         │                                      │
        │                     │                                      │
        │ • Authentication    │                                      │
        │ • Database (PG)     │                                      │
        │ • Real-time         │                                      │
        └─────────────────────┘                                      │
                   │                                                │
        ┌──────────┴──────────┬─────────────────────────────┴─────┐
        │  AI Services        │                                     │
        │  (Python + FastAPI) │                                     │
        │                     │                                     │
        │ • Chatbot API       │                                     │
        │ • Category API      │                                     │
        │ • Inspection API    │                                     │
        └─────────────────────┘                                     │
                   │                                                │
        ┌──────────┴──────────┬─────────────────────────────┴─────┐
        │  Vector Database    │                                     │
        │  (ChromaDB)         │                                     │
        │                     │                                     │
        │ • Embeddings        │                                     │
        │ • RAG Context       │                                     │
        └─────────────────────┘                                     │
```

<br>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the FOOD MANAGEMENT Team**
