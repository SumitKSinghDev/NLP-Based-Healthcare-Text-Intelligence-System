import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title="Healthcare Text Intelligence System API",
    description="NLP-Based Healthcare Text Intelligence System for Medical Entity Extraction, Symptom Analysis and Clinical Information Retrieval (Group 6)",
    version="1.0.0"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "project": "Healthcare Text Intelligence System", "group": "Group 6"}

# Mount frontend production build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/")
    def root():
        return {
            "status": "healthy",
            "project": "Healthcare Text Intelligence System",
            "group": "Group 6",
            "note": "Frontend dist not found. Run 'npm run build' in frontend/ or run frontend dev server on port 3000."
        }

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
