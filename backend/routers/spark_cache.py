from utils.config import get_spark, db_properties
from utils.settings import settings

_cached_light_loaded = False
_cached_heavy_loaded = False


def load_light_views_once():
    global _cached_light_loaded

    if _cached_light_loaded:
        return

    spark = get_spark()
    if spark is None:
        raise RuntimeError("Spark session not initialized")

    print("Spark light cache 로드 시작")

    summary_df = spark.read.jdbc(
        url=settings.db_url,
        table="station_timeband_summary",
        properties=db_properties
    )
    summary_df.createOrReplaceTempView("summary")

    coordinate_df = spark.read.jdbc(
        url=settings.db_url,
        table="coordinate",
        properties=db_properties
    )
    coordinate_df.cache()
    coordinate_df.count()
    coordinate_df.createOrReplaceTempView("coord")

    name_df = spark.read.jdbc(
        url=settings.db_url,
        table="station_timeband_by_name",
        properties=db_properties
    )
    name_df.cache()
    name_df.count()
    name_df.createOrReplaceTempView("name")

    map_df = spark.read.jdbc(
        url=settings.db_url,
        table="view_광고전략_지도데이터",
        properties=db_properties
    )
    map_df.cache()
    map_df.count()
    map_df.createOrReplaceTempView("map")

    _cached_light_loaded = True
    print("Spark light cache 로드 완료")


def load_heavy_views_once():
    global _cached_heavy_loaded

    if _cached_heavy_loaded:
        return

    spark = get_spark()
    if spark is None:
        raise RuntimeError("Spark session not initialized")

    print("Spark heavy cache 로드 시작")

    total_df = spark.read.jdbc(
        url=settings.db_url,
        table="subway_total",
        properties=db_properties
    )
    total_df.cache()
    total_df.count()
    total_df.createOrReplaceTempView("total")

    holiday_df = spark.read.jdbc(
        url=settings.db_url,
        table="holiday_check",
        properties=db_properties
    )
    holiday_df.cache()
    holiday_df.count()
    holiday_df.createOrReplaceTempView("holiday")

    _cached_heavy_loaded = True
    print("Spark heavy cache 로드 완료")


def clear_cache():
    global _cached_light_loaded, _cached_heavy_loaded

    spark = get_spark()
    if spark is not None:
        spark.catalog.clearCache()

    _cached_light_loaded = False
    _cached_heavy_loaded = False
    print("Spark 캐시 초기화 완료")