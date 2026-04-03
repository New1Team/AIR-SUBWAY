from database.spark_session import fetch_jdbc_data

# 지도용 기본 역 위치 데이터
def map_data(spark, year:int):
    try:
        if spark:
            sql = f"""
            SELECT s.`역명`, c.`위도`, c.`경도` 
            FROM station_timeband_summary AS s
            JOIN coordinate AS c
                ON s.`역번호` = c.`역번호`
            WHERE s.`src_year` = {year}
            """
            result_df = fetch_jdbc_data(spark, sql)
            return [row.asDict() for row in result_df.collect()]
    except Exception as e:
        print(f"오류 : {e}")
    return []

# KPI 데이터
def top1_query(spark ,year:int, col1:str, label:str, day_cond:str):
        sql = f"""
            WITH ranked AS (SELECT src_year, `역명`, {col1} AS total,
                    ROW_NUMBER() OVER (
                        PARTITION BY src_year
                        ORDER BY {col1} DESC) AS rn FROM station_timeband_by_name
                WHERE `휴무일구분` {day_cond} AND src_year = {year})
            SELECT src_year, '{label}' AS kpi, `역명`, total AS `값` FROM ranked
            WHERE rn = 1
        """
        result_df = fetch_jdbc_data(spark, sql)
        rows = result_df.collect()
        return rows[0].asDict() if rows else {"역명": "-", "값": 0}

# 직장인 타겟 광고용 산점도 데이터
def get_scatter_data(spark, year:int):
    try:
        sql = f"""
            WITH base AS (SELECT src_year, `역명`, `출근_하차합` AS x_value, `퇴근_승차합` AS y_value FROM station_timeband_by_name
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
        result_df = fetch_jdbc_data(spark, sql)
        return [row.asDict() for row in result_df.collect()]
    
    except Exception as e:
        print(f"'에러: ' {e}")
        return{"error":str(e)}

# 주말/공휴일 13~18시 피크 기준 상위 호선 TOP3
def get_weekend_lines_data(spark, year:int):
    try:
        sql = f"""
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
            FROM subway_total s
            JOIN holiday_check h
                ON s.`날짜` = h.`날짜`
            WHERE h.`휴무일구분` IN ('주말', '공휴일')
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
        result_df = fetch_jdbc_data(spark, sql)
        items = [row.asDict() for row in result_df.collect()]
        return {"year": year, "items": items}
    except Exception as e:
        print(f"'에러: ' {e}")
        return{"error":str(e)}

# 주말/공휴일 13~18시 피크 기준 특정 호선 핵심역 TOP5    
def get_weekend_line_stations_data(spark, year:int, line:str):
    try:
        sql = f"""
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
            FROM subway_total s
            JOIN holiday_check h
                ON s.`날짜` = h.`날짜`
            WHERE h.`휴무일구분` IN ('주말', '공휴일')
              AND s.src_year = {year}
              AND s.`호선` = '{line}'
            GROUP BY
                s.src_year,
                s.`호선`,
                s.`역명`
        ),
        ranked AS (
            SELECT
                src_year,
                `호선`,
                `역명`,
                weekend_peak,
                RANK() OVER (
                    ORDER BY weekend_peak DESC
                ) AS rn
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
        result_df = fetch_jdbc_data(spark, sql)
        items = [row.asDict() for row in result_df.collect()]
        return {"year": year, "line": line, "items": items}
    except Exception as e:
        print(f"'에러: ' {e}")
        return{"error":str(e)}

# 지도 마커용 광고 전략 데이터
def get_map_data(spark, year:int, category:str, search: str=None):
    try:
        if (search is None):
            sql = f"""
                SELECT `대표역번호`, `역명`, `위도`, `경도`, `기본_분류`, `광고_집행_전략`,     
                    CAST(`주거_비중` AS DOUBLE) AS `주거_비중` , 
                    CAST(`산업_비중` AS DOUBLE) AS `산업_비중` , 
                    CAST(`문화_비중` AS DOUBLE) AS `문화_비중`,
                    `src_year`
                FROM view_광고전략_지도데이터
                WHERE `src_year` = {year}
            """
        else:
            sql = f"""
                SELECT `대표역번호`, `역명`, `위도`, `경도`, `기본_분류`, `광고_집행_전략`,     
                    CAST(`주거_비중` AS DOUBLE) AS `주거_비중` , 
                    CAST(`산업_비중` AS DOUBLE) AS `산업_비중` , 
                    CAST(`문화_비중` AS DOUBLE) AS `문화_비중`,
                    `src_year`
                FROM view_광고전략_지도데이터
                WHERE `src_year` = {year}
                AND `역명` = '{search}'
            """

        if category and category != "전체" and search is None:
            sql += f" AND TRIM(`기본_분류`) = '{category}'"

        sql += " ORDER BY `역명`"
        
        result_df = fetch_jdbc_data(spark, sql)
        rows = [row.asDict() for row in result_df.collect()]
        print(rows)
        return {"data":rows, "status": True}
    except Exception as e:
        print(f"'에러: ' {e}")
        return{"error":str(e)}