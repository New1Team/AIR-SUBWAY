from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import data, upload
from database.spark_session import lifespan
# from apscheduler.schedulers.background import BackgroundScheduler
# import schedule
from datetime import datetime

# def annual_update():
#     today = datetime.now()
#     if today.month == 1 and today.day == 1:
#         last_year = today.year - 1
#         process_yearly_subway_data(last_year)

# schedule.every().day.at("01:00").do(annual_update)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:8501",
      "http://127.0.0.1:8501",
      "http://aiedu.tplinkdns.com:7210",
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


if __name__ == "__main__":
    import uvicorn
    # 아래 코드가 있어야 서버가 대기 상태로 유지됩니다.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)