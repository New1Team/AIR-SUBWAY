from pyspark.sql import SparkSession, Row
from sqlalchemy import create_engine, inspect
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from utils.settings import settings
import os
from routers import data, table_add
from contextlib import asynccontextmanager
from py4j.protocol import Py4JNetworkError

@asynccontextmanager
async def lifespan(app: FastAPI):
  spark = None
  try:
    spark = SparkSession.builder \
      .appName("mySparkApp") \
      .master(settings.spark_url) \
      .config("spark.driver.host", settings.host_ip) \
      .config("spark.driver.bindAddress", "0.0.0.0") \
      .config("spark.driver.port", "10000") \
      .config("spark.blockManager.port", "10001") \
      .config("spark.network.timeout", "800s") \
      .config("spark.rpc.askTimeout", "300s") \
      .config("spark.tcp.retries", "16") \
      .config("spark.cores.max", "2") \
      .config("spark.rpc.message.maxSize", "512") \
      .config("spark.driver.maxResultSize", "2g") \
      .config("spark.shuffle.io.maxRetries", "10") \
      .config("spark.shuffle.io.retryWait", "15s") \
      .config("spark.jars.packages", "org.mariadb.jdbc:mariadb-java-client:3.4.0") \
      .getOrCreate()
      # .config("spark.executor.port", "10002") \
    app.state.spark = spark
    print("Spark Session Created Successfully!")
    yield
  except Exception as e:
    print(f"Spark initialization failed: {e}")
    raise e
  finally:
    print("Initiating Shutdown...")
    if spark:
      try:
        if hasattr(spark, "_jsc") and spark._jsc:
          print("Stopping Spark Session Safely...")
          spark.stop()
          print("Spark Stopped.")
      except (Py4JNetworkError, ConnectionResetError, Exception) as e:
        print(f"Spark JVM already closed, skipping clean stop")
      finally:
        spark = None
        print("Finalizing shutdown...")

app = FastAPI(lifespan=lifespan)

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

app.include_router(data.router)
app.include_router(table_add.router)

@app.get("/")
def read_root():
  return {"status": True}