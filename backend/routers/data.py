from db import findAll
from fastapi import APIRouter
from utils.settings import settings
from utils.config import db_properties, get_spark, sql1

router = APIRouter(
    prefix="/data",
    tags=["data"]
)

spark = get_spark()
# 각 테이블 및 뷰
summary_df = spark.read.jdbc(url=settings.db_url, table="station_timeband_summary", properties=db_properties)
summary_df.createOrReplaceTempView('summary')
coordinate_df = spark.read.jdbc(url=settings.db_url, table="coordinate", properties=db_properties)
coordinate_df.createOrReplaceTempView('coord')
name_df=spark.read.jdbc(url=settings.db_url, table="station_timeband_by_name", properties=db_properties)
name_df.createOrReplaceTempView('name')
total_df=spark.read.jdbc(url=settings.db_url, table="subway_total", properties=db_properties)
total_df.createOrReplaceTempView('total')
holiday_df=spark.read.jdbc(url=settings.db_url, table="holiday_check", properties=db_properties)
holiday_df.createOrReplaceTempView('holiday')
map_df=spark.read.jdbc(url=settings.db_url, table="view_광고전략_지도데이터", properties=db_properties)
map_df.createOrReplaceTempView('map')


def check_spark():
     if not spark:
        return {"error": "Spark session error"}


# 1. 지도용 기본 역 위치 데이터
@router.get("/")
def get_data(year: int):
    check_spark()
    sql = f"""
        SELECT s.`역명`, c.`위도`, c.`경도` FROM summary AS s
        JOIN coord AS c
            ON s.`역번호` = c.`역번호`
        WHERE s.`src_year` = {year}
    """
    result_df = spark.sql(sql)
    data = [row.asDict() for row in result_df.collect()]
    return {"data": data}


# 2. KPI 데이터
# - 출근시간 최다 승/하차
# - 퇴근시간 최다 승/하차
# - 주말 오전/오후 최다 승/하차
@router.get("/kpi")
def get_kpi(year: int):
    check_spark()
    def top1_query(col, label, day_cond):
        sql = f"""
            WITH ranked AS (SELECT src_year, `역명`, {col} AS total,
                    ROW_NUMBER() OVER (
                        PARTITION BY src_year
                        ORDER BY {col} DESC) AS rn FROM name
                WHERE `휴무일구분` {day_cond} AND src_year = {year})
            SELECT src_year, '{label}' AS kpi, `역명`, total AS `값` FROM ranked
            WHERE rn = 1
        """
        result = spark.sql(sql).collect()
        return result[0].asDict() if result else {"역명": "-", "값":0}

    weekday = "= '평일'"
    weekend = "IN ('주말', '공휴일')"

    return {
        "commute": {
            "boarding": top1_query("`출근_승차합`", "`평일 출근 승차 최대역`", weekday),
            "alighting": top1_query("`출근_하차합`", "`평일 출근 하차 최대역`", weekday),
        },
        "weekday": {
            "boarding": top1_query("`퇴근_승차합`", "`평일 퇴근 승차 최대역`", weekday),
            "alighting": top1_query("`오전_하차합`", "`주말 오전 하차 최대역`", weekend),
        },
        "weekend": {
            "am_boarding": top1_query("`오전_승차합`", "`주말 오전 승차 최대역`", weekend),
            "am_alighting": top1_query("`오전_하차합`", "`주말 오전 하차 최대역`", weekend),
            "pm_boarding": top1_query("`오후_승차합`", "`주말 오후 승차 최대역`", weekend),
            "pm_alighting": top1_query("`오후_하차합`", "`주말 오후 하차 최대역`", weekend),
        },
    }



# 3.1 직장인 타겟 광고용 산점도 데이터
# X축 = 출근 하차합
# Y축 = 퇴근 승차합
@router.get("/scatter")
def get_scatter(year: int):
    try:
        name_df.createOrReplaceTempView('name')
        sql = f"""
            WITH base AS (SELECT src_year, `역명`, `출근_하차합` AS x_value, `퇴근_승차합` AS y_value FROM name
                WHERE `휴무일구분` = '평일' AND src_year = {year}),
            avg_val AS (SELECT src_year, AVG(x_value) AS avg_x, AVG(y_value) AS avg_y FROM base
                GROUP BY src_year),
            filtered AS (SELECT b.src_year, b.`역명`, b.x_value, b.y_value, (b.x_value + b.y_value) AS score, a.avg_x, a.avg_y FROM base b
                JOIN avg_val a
                    ON b.src_year = a.src_year
                WHERE b.x_value > a.avg_x AND b.y_value > a.avg_y)
            SELECT src_year, `역명`, x_value, y_value, score, avg_x, avg_y FROM filtered
            ORDER BY src_year, score DESC
        """
        result = spark.sql(sql)
        rows =[row.asDict() for row in result.collect()]
        return {"data": rows}
    except Exception as e:
        print(f"'에러: ' {e}")
        return{"error":str(e)}


# 3.2 주말/공휴일 13~18시 피크 기준 상위 호선 TOP3
@router.get("/weekend-lines")
def get_weekend_lines(year: int):
    try:
        sql = f"""
            {sql1}
                AND s.src_year = {year}
                GROUP BY s.src_year, s.`호선`),
            ranked AS (SELECT src_year, `호선`, weekend_peak,
                    RANK() OVER (PARTITION BY src_year 
                    ORDER BY weekend_peak DESC) AS rn FROM line_base)
            SELECT src_year, `호선`, weekend_peak, rn FROM ranked
            WHERE rn <= 3
            ORDER BY rn
        """
        result = spark.sql(sql)
        items = [row.asDict() for row in result.collect()]
        return {"year": year, "items": items}
    except Exception as e:
        print(f"'에러: ' {e}")
        return{"error":str(e)}

# 3.2 주말/공휴일 13~18시 피크 기준 특정 호선 핵심역 TOP5
@router.get("/weekend-line-stations")
def get_weekend_line_stations(year: int, line: str):
    try:
        sql = f"""
            {sql1}
                AND s.src_year = {year} AND s.`호선` = '{line}'
                GROUP BY s.src_year, s.`호선`, s.`역명`),
            ranked AS (SELECT src_year, `호선`, `역명`, weekend_peak,
                    RANK() OVER (ORDER BY weekend_peak DESC) AS rn
                FROM station_base)
            SELECT src_year, `호선`, `역명`, weekend_peak, rn FROM ranked
            WHERE rn <= 5
            ORDER BY rn
        """
        result = spark.sql(sql)
        items = [row.asDict() for row in result.collect()]
        return {"year": year, "line": line, "items": items}
    except Exception as e:
        print(f"'에러: ' {e}")
        return{"error":str(e)}


# 4. 지도 마커용 광고 전략 데이터
# category:
# - 주거지
# - 산업지
# - 문화권
# category 없으면 전체 반환
@router.get("/map")
def get_map(year: int, category: str = None):
    try:
        sql = f"""
            SELECT `대표역번호`, `역명`, `위도`, `경도`, `기본_분류`, `주거_비중`, `산업_비중`, `문화_비중`, `src_year`
            FROM map
            WHERE `src_year` = {year}
        """

        if category and category != "전체":
            sql += f" AND TRIM(`기본_분류`) = '{category}'"

        sql += " ORDER BY `역명`"

        result = spark.sql(sql)
        data = [row.asDict() for row in result.collect()]
        return {"data": data}
    except Exception as e:
        print(f"'에러: ' {e}")
        return{"error":str(e)}
