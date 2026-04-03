from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth_router, categorias_router, transacoes_router, metas_router, dashboard_router, ia_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="StonksCare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(categorias_router.router)
app.include_router(transacoes_router.router)
app.include_router(metas_router.router)
app.include_router(dashboard_router.router)
app.include_router(ia_router.router)

@app.get("/")
def root():
    return {"message": "StonksCare API is running"}
