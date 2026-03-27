from fastapi import APIRouter, Depends
from database.spark_session import get_spark
from pyspark.sql import SparkSession
from service import data_service

router = APIRouter(
    prefix="/data",
    tags=["data"]
)

# 1. 지도용 기본 역 위치 데이터
@router.get("/")
def get_data(year: int, spark: SparkSession = Depends(get_spark)):
    return data_service.map_data(spark, year)
 
# 2. KPI 데이터
# - 출근시간 최다 승/하차
# - 퇴근시간 최다 승/하차
# - 주말 오전/오후 최다 승/하차
@router.get("/kpi")
def get_kpi(year: int, spark: SparkSession = Depends(get_spark)):
    weekday = "= '평일'"
    weekend = "IN ('주말', '공휴일')"

    return {
        "commute": {
            "boarding": data_service.top1_query(spark, year, "`출근_승차합`", "`평일 출근 승차 최대역`", weekday),
            "alighting": data_service.top1_query(spark, year, "`출근_하차합`", "`평일 출근 하차 최대역`", weekday),
        },
        "weekday": {
            "boarding": data_service.top1_query(spark, year, "`퇴근_승차합`", "`평일 퇴근 승차 최대역`", weekday),
            "alighting": data_service.top1_query(spark, year, "`오전_하차합`", "`주말 오전 하차 최대역`", weekend),
        },
        "weekend": {
            "am_boarding": data_service.top1_query(spark, year, "`오전_승차합`", "`주말 오전 승차 최대역`", weekend),
            "am_alighting": data_service.top1_query(spark, year, "`오전_하차합`", "`주말 오전 하차 최대역`", weekend),
            "pm_boarding": data_service.top1_query(spark, year, "`오후_승차합`", "`주말 오후 승차 최대역`", weekend),
            "pm_alighting": data_service.top1_query(spark, year, "`오후_하차합`", "`주말 오후 하차 최대역`", weekend),
        },
    }


# 3.1 직장인 타겟 광고용 산점도 데이터
# X축 = 출근 하차합
# Y축 = 퇴근 승차합
@router.get("/scatter")
def get_scatter(year: int, spark: SparkSession = Depends(get_spark)):
    rows = data_service.get_scatter_data(spark, year)
    return {"data": rows}       
        

# 3.2 주말/공휴일 13~18시 피크 기준 상위 호선 TOP3
@router.get("/weekend-lines")
def get_weekend_lines(year: int, spark: SparkSession = Depends(get_spark)):
    return data_service.get_weekend_lines_data(spark, year)
    

# 3.2 주말/공휴일 13~18시 피크 기준 특정 호선 핵심역 TOP5
@router.get("/weekend-line-stations")
def get_weekend_line_stations(year: int, line: str, spark: SparkSession = Depends(get_spark)):
    return data_service.get_weekend_line_stations_data(spark, year, line)


# 4. 지도 마커용 광고 전략 데이터
# category: 주거지 / 산업지 / 문화권
# category 없으면 전체 반환
@router.get("/map")
def get_map(year: int, category: str = None, spark: SparkSession = Depends(get_spark)):
    return data_service.get_map_data(spark, year, category)

