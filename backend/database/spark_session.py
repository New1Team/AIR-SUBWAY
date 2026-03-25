from core.settings import settings
from pyspark.sql import SparkSession, Row
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from py4j.protocol import Py4JNetworkError
from core.constants import db_properties

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

def get_spark(request: Request) -> SparkSession:
  return request.app.state.spark

def fetch_jdbc_data(spark: SparkSession, sql_query:str):
  final_query = sql_query if "AS t" in sql_query.lower() else f"({sql_query}) AS t"
  return spark.read.jdbc(url=settings.db_url, table=final_query, properties=db_properties)