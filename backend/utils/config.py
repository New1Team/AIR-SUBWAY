from pyspark.sql import SparkSession, Row
from sqlalchemy import create_engine, inspect
from utils.settings import settings
from fastapi import Request

engine_mariadb = create_engine(settings.mariadb_host)

db_properties = {
  "user": settings.maria_user,
  "password": settings.maria_password,
  "driver": "org.mariadb.jdbc.Driver",
  "char.encoding": "utf-8",
  "characterEncoding": "UTF-8",
  "useUnicode": "true",
  "sessionVariables": "sql_mode='ANSI_QUOTES'"
  }

# API 함수
def startup():
  global spark
  try:
    spark = SparkSession.builder \
      .appName("soo") \
      .master(settings.spark_url) \
      .config("spark.jars", settings.jar_path) \
      .config("spark.driver.host", settings.host_ip) \
      .config("spark.driver.bindAddress", "0.0.0.0") \
      .config("spark.driver.port", "10000") \
      .config("spark.blockManager.port", "10001") \
      .config("spark.cores.max", "2") \
      .config("spark.sql.sources.jdbc.driver.kind", "mariadb") \
      .getOrCreate()
    print("성공!")
  except Exception as e:
    print(f"Failed to create Spark session: {e}")
  return spark

def shutdown():
  if spark:
    spark.stop()

def get_spark(request: Request) -> SparkSession:
  return request.app.state.spark
