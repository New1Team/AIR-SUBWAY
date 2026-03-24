from fastapi import APIRouter
from utils.config import get_spark, sql_line_base, sql_station_base
from utils.spark_cache import load_heavy_views_once

router = APIRouter(
    prefix="/data",
    tags=["data"]
)

def ensure_spark():
    spark = get_spark()
    if spark is None:
        raise RuntimeError("Spark session not initialized")
    return spark

@router.get("/weekend-lines")
def get_weekend_lines(year: int):
    try:
        spark = ensure_spark()
        load_heavy_views_once()

        sql = f"""
            {sql_line_base}
                AND s.src_year = {year}
            GROUP BY s.src_year, s.`호선`
            ),
            ranked AS (
                SELECT
                    src_year,
                    `호선`,
                    weekend_peak,
                    RANK() OVER (
                        PARTITION BY src_year
                        ORDER BY weekend_peak DESC
                    ) AS rn
                FROM line_base
            )
            SELECT
                src_year,
                `호선`,
                weekend_peak,
                rn
            FROM ranked
            WHERE rn <= 3
            ORDER BY rn
        """
        result = spark.sql(sql)
        items = [row.asDict() for row in result.collect()]
        return {"year": year, "items": items}
    except Exception as e:
        return {"error": str(e)}

@router.get("/weekend-line-stations")
def get_weekend_line_stations(year: int, line: str):
    try:
        spark = ensure_spark()
        load_heavy_views_once()

        sql = f"""
            {sql_station_base}
                AND s.src_year = {year}
                AND s.`호선` = '{line}'
            GROUP BY s.src_year, s.`호선`, s.`역명`
            ),
            ranked AS (
                SELECT
                    src_year,
                    `호선`,
                    `역명`,
                    weekend_peak,
                    RANK() OVER (ORDER BY weekend_peak DESC) AS rn
                FROM station_base
            )
            SELECT
                src_year,
                `호선`,
                `역명`,
                weekend_peak,
                rn
            FROM ranked
            WHERE rn <= 5
            ORDER BY rn
        """
        result = spark.sql(sql)
        items = [row.asDict() for row in result.collect()]
        return {"year": year, "line": line, "items": items}
    except Exception as e:
        return {"error": str(e)}