from fastapi import FastAPI

app = FastAPI(title="S2O AI Service")

@app.get("/")
def read_root():
    return {"message": "S2O AI Service is running"}

@app.post("/recommend")
def recommend_dishes(user_preferences: dict):
    # TODO: Implement Recommendation Logic (Vector Search)
    return {"recommendations": []}

@app.post("/chat")
def chat_with_bot(question: str):
    # TODO: Implement RAG Chatbot
    return {"answer": "Đây là câu trả lời mẫu từ AI."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)