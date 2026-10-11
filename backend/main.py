import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import db_manager
from backend.data.seed_data import seed_initial_database
from backend.routes.auth import router as auth_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.ueba import router as ueba_router
from backend.routes.anomaly import router as anomaly_router
from backend.routes.nlp import router as nlp_router
from backend.routes.deception import router as deception_router
from backend.routes.response import router as response_router
from backend.routes.alerts import router as alerts_router
from backend.routes.simulator import router as simulator_router, sim_controller

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Seed Baseline Data
    print(f"[{settings.PROJECT_NAME}] Starting up backend engine...")
    await db_manager.init()
    await seed_initial_database(db_manager.db)
    yield
    # Shutdown: Clean up background tasks
    if sim_controller.is_running:
        await sim_controller.stop()
    print(f"[{settings.PROJECT_NAME}] Shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CloudShield: AI-Based Insider Threat Detection Platform for Cloud Workspaces",
    lifespan=lifespan
)

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(ueba_router, prefix=settings.API_PREFIX)
app.include_router(anomaly_router, prefix=settings.API_PREFIX)
app.include_router(nlp_router, prefix=settings.API_PREFIX)
app.include_router(deception_router, prefix=settings.API_PREFIX)
app.include_router(response_router, prefix=settings.API_PREFIX)
app.include_router(alerts_router, prefix=settings.API_PREFIX)
app.include_router(simulator_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "database_mode": db_manager.mode,
        "docs_url": "/docs"
    }

@app.get(f"{settings.API_PREFIX}/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "platform": settings.PROJECT_NAME,
        "database_mode": db_manager.mode
    }

@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await websocket.accept()
    sim_controller.register_ws(websocket)
    # Send initial welcome & connection confirmation
    await websocket.send_json({
        "type": "CONNECTION_ESTABLISHED",
        "message": "Connected to CloudShield Real-Time SOC Stream",
        "simulator_running": sim_controller.is_running
    })
    try:
        while True:
            # Keep connection alive & handle incoming client messages if any
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        sim_controller.unregister_ws(websocket)
    except Exception:
        sim_controller.unregister_ws(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
