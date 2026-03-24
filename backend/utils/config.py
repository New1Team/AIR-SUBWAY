from pyspark.sql import SparkSession, Row
from sqlalchemy import create_engine, inspect
from utils.settings import settings

spark = None
engine_mariadb = create_engine(settings.mariadb_host)

db_properties = {
  "user": settings.maria_user,
  "password": settings.maria_password,
  "driver": "org.mariadb.jdbc.Driver"
  }

# API 함수
def startup():
  global spark
  try:
    spark = SparkSession.builder \
      .appName("1team") \
      .master(settings.spark_url) \
      .config("spark.jars", settings.jar_path) \
      .config("spark.driver.host", settings.host_ip) \
      .config("spark.driver.bindAddress", "0.0.0.0") \
      .config("spark.driver.port", "10000") \
      .config("spark.blockManager.port", "10001") \
      .config("spark.cores.max", "2") \
      .config("spark.sql.sources.jdbc.driver.kind", "mariadb") \
      .config("spark.sql.dialect", "mysql") \
      .getOrCreate()
    print("성공!")
  except Exception as e:
    print(f"Failed to create Spark session: {e}")
  return spark

def get_spark():
    global spark
    if spark is None:
        return startup()
    return spark

def shutdown():
  if spark:
    spark.stop()
    
sql1 = f"""
        WITH station_base AS (
            SELECT
                s.`src_year`,
                s.`호선`,
                s.`역명`,
                SUM(
                    IFNULL(s.`13~14`, 0) +
                    IFNULL(s.`14~15`, 0) +
                    IFNULL(s.`15~16`, 0) +
                    IFNULL(s.`16~17`, 0) +
                    IFNULL(s.`17~18`, 0)
                ) AS weekend_peak
            FROM `total` s
            JOIN `holiday` h
                ON s.`날짜` = h.`날짜`
            WHERE h.`휴무일구분` IN ('주말', '공휴일')
            
"""