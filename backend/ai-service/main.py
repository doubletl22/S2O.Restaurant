from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os

# Khởi tạo App
app = FastAPI(title="S2O AI Service")

# Giả lập kết nối Vector DB (Qdrant) [cite: 122]
# from qdrant_client import QdrantClient
# qdrant = QdrantClient(host="qdrant", port=6333)

class UserQuery(BaseModel):
    user_id: str
    message: str
    tenant_id: str # AI cũng cần biết đang chat về nhà hàng nào

@app.get("/")
def read_root():
    return {"status": "AI Service is running"}

@app.post("/chat/qa")
async def chat_qa(query: UserQuery):
    """
    Chatbot QA: Trả lời câu hỏi về giờ mở cửa, menu... [cite: 43]
    Sử dụng kỹ thuật RAG (Retrieval-Augmented Generation).
    """
    try:
        # Bước 1: Tìm kiếm vector trong Qdrant dựa trên 'query.message' và lọc theo 'query.tenant_id'
        # search_result = qdrant.search(...) 
        
        # Bước 2: Gửi context tìm được + câu hỏi lên LLM (ví dụ OpenAI/Gemini)
        # response = llm.predict(...)
        
        # Mock response cho demo
        return {
            "reply": f"Dựa trên dữ liệu nhà hàng {query.tenant_id}, món Bò Beefsteak đang bán chạy nhất hôm nay.",
            "source": "Menu Data"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
async def recommend_dishes(user_id: str, weather: str, location: str):
    """
    Gợi ý món ăn dựa trên thời tiết và vị trí [cite: 38-40]
    """
    # Logic gợi ý AI đơn giản
    recommendations = []
    if "rain" in weather.lower():
        recommendations = ["Lẩu thái chua cay", "Súp bí đỏ"]
    else:
        recommendations = ["Salad cá ngừ", "Trà trái cây"]
        
    return {"user_id": user_id, "recommended_dishes": recommendations}

if __name__ == "__main__":
    import uvicorn
    # Chạy service tại port 5005 (khác với .NET thường là 5000/5001)
    uvicorn.run(app, host="0.0.0.0", port=5005)