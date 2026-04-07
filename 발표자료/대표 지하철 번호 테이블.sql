CREATE OR REPLACE VIEW station_대표역번호 AS
SELECT
    a.src_year,
    a.휴무일구분,
    a.역명,
    r.대표역번호,

    a.출근_승차합,
    a.출근_하차합,
    a.출근_전체합,

    a.오전_승차합,
    a.오전_하차합,
    a.오전_전체합,

    a.오후_승차합,
    a.오후_하차합,
    a.오후_전체합,

    a.퇴근_승차합,
    a.퇴근_하차합,
    a.퇴근_전체합
FROM station_timeband_by_name a
LEFT JOIN station_name_rep r
    ON a.역명 = r.역명
LEFT JOIN coordinate c
    ON CAST(c.역번호 AS UNSIGNED) = r.대표역번호;