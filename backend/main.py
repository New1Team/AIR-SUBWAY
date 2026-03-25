from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import data, upload
from database.spark_session import lifespan



app = FastAPI(lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:8501",
      "http://127.0.0.1:8501",
      "http://aiedu.tplinkdns.com:6100",
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(data.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
  return {"status": True}