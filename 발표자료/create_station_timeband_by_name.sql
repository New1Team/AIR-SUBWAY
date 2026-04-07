CREATE OR REPLACE VIEW station_timeband_by_name AS
SELECT
    src_year,
    휴무일구분,
    역명,

    SUM(출근_승차합) AS 출근_승차합,
    SUM(출근_하차합) AS 출근_하차합,
    SUM(출근_전체합) AS 출근_전체합,

    SUM(오전_승차합) AS 오전_승차합,
    SUM(오전_하차합) AS 오전_하차합,
    SUM(오전_전체합) AS 오전_전체합,

    SUM(오후_승차합) AS 오후_승차합,
    SUM(오후_하차합) AS 오후_하차합,
    SUM(오후_전체합) AS 오후_전체합,

    SUM(퇴근_승차합) AS 퇴근_승차합,
    SUM(퇴근_하차합) AS 퇴근_하차합,
    SUM(퇴근_전체합) AS 퇴근_전체합
FROM station_timeband_summary
GROUP BY src_year, 휴무일구분, 역명;
    