from pyspark.sql import SparkSession
from utils.settings import settings
import os

spark = None

db_properties = {
    "user": settings.maria_user,
    "password": settings.maria_password,
    "driver": "org.mariadb.jdbc.Driver"
}

sql_line_base = """
WITH line_base AS (
    SELECT
        s.src_year,
        s.`호선`,
        SUM(
            IFNULL(s.`13~14`, 0) +
            IFNULL(s.`14~15`, 0) +
            IFNULL(s.`15~16`, 0) +
            IFNULL(s.`16~17`, 0) +
            IFNULL(s.`17~18`, 0)
        ) AS weekend_peak
    FROM total s
    JOIN holiday h
        ON s.`날짜` = h.`날짜`
    WHERE h.`휴무일구분` IN ('주말', '공휴일')
"""

sql_station_base = """
WITH station_base AS (
    SELECT
        s.src_year,
        s.`호선`,
        s.`역명`,
        SUM(
            IFNULL(s.`13~14`, 0) +
            IFNULL(s.`14~15`, 0) +
            IFNULL(s.`15~16`, 0) +
            IFNULL(s.`16~17`, 0) +
            IFNULL(s.`17~18`, 0)
        ) AS weekend_peak
    FROM total s
    JOIN holiday h
        ON s.`날짜` = h.`날짜`
    WHERE h.`휴무일구분` IN ('주말', '공휴일')
"""


def startup():
    global spark

    if spark is not None:
        return spark
    
    os.environ["HADOOP_HOME"] = r"C:\hadoop"
    os.environ["hadoop.home.dir"] = r"C:\hadoop"
    os.environ["PATH"] = r"C:\hadoop\bin;" + os.environ["PATH"]

    try:
        jar_path = settings.jar_path.replace("\\", "/")
        if not jar_path.startswith("file:///"):
            jar_path = f"file:///{jar_path}"

        spark = (
            SparkSession.builder
            .appName("AIR-SUBWAY")
            .master(settings.spark_url)
            .config("spark.driver.host", settings.host_ip)
            .config("spark.driver.bindAddress", "0.0.0.0")
            .config("spark.driver.port", "10000")
            .config("spark.blockManager.port", "10001")
            .config("spark.cores.max", "2")
            .config("spark.jars", jar_path)
            .getOrCreate()
        )
        print("Spark 시작 성공")
        return spark

    except Exception as e:
        print(f"Failed to create Spark session: {e}")
        spark = None
        return None


def get_spark():
    global spark
    return spark


def shutdown():
    global spark
    if spark is not None:
        spark.stop()
        spark = None
        print("Spark 종료 완료")