from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import data, table_add
from utils.config import startup, shutdown
from utils.spark_cache import load_light_views_once

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.0.105:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    spark = startup()
    if spark is None:
        raise RuntimeError("Spark startup failed")

    load_light_views_once()

@app.on_event("shutdown")
def on_shutdown():
    shutdown()

app.include_router(data.router)
app.include_router(table_add.router)

@app.get("/")
def read_root():
    return {"status": True}