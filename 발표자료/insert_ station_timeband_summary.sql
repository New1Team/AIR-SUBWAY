INSERT INTO station_timeband_summary (
    src_year,
    휴무일구분,
    호선,
    역번호,
    역명,

    출근_승차합,
    출근_하차합,
    출근_전체합,

    평일오전_승차합,
    평일오전_하차합,
    평일오전_전체합,

    평일오후_승차합,
    평일오후_하차합,
    평일오후_전체합,

    퇴근_승차합,
    퇴근_하차합,
    퇴근_전체합
)
SELECT
    s.src_year,
    h.휴무일구분 AS 휴무일구분,   -- holiday_check 실제 컬럼명으로 수정 필요
    s.호선,
    s.역번호,
    s.역명,

    SUM(
        CASE
            WHEN s.구분 = '승차'
            THEN IFNULL(s.`07~08`,0) + IFNULL(s.`08~09`,0)
            ELSE 0
        END
    ) AS 출근_승차합,

    SUM(
        CASE
            WHEN s.구분 = '하차'
            THEN IFNULL(s.`07~08`,0) + IFNULL(s.`08~09`,0)
            ELSE 0
        END
    ) AS 출근_하차합,

    SUM(
        IFNULL(s.`07~08`,0) + IFNULL(s.`08~09`,0)
    ) AS 출근_전체합,

    SUM(
        CASE
            WHEN s.구분 = '승차'
            THEN IFNULL(s.`09~10`,0) + IFNULL(s.`10~11`,0) + IFNULL(s.`11~12`,0)
            ELSE 0
        END
    ) AS 평일오전_승차합,

    SUM(
        CASE
            WHEN s.구분 = '하차'
            THEN IFNULL(s.`09~10`,0) + IFNULL(s.`10~11`,0) + IFNULL(s.`11~12`,0)
            ELSE 0
        END
    ) AS 평일오전_하차합,

    SUM(
        IFNULL(s.`09~10`,0) + IFNULL(s.`10~11`,0) + IFNULL(s.`11~12`,0)
    ) AS 평일오전_전체합,

    SUM(
        CASE
            WHEN s.구분 = '승차'
            THEN IFNULL(s.`12~13`,0) + IFNULL(s.`13~14`,0) + IFNULL(s.`14~15`,0)
               + IFNULL(s.`15~16`,0) + IFNULL(s.`16~17`,0)
            ELSE 0
        END
    ) AS 평일오후_승차합,

    SUM(
        CASE
            WHEN s.구분 = '하차'
            THEN IFNULL(s.`12~13`,0) + IFNULL(s.`13~14`,0) + IFNULL(s.`14~15`,0)
               + IFNULL(s.`15~16`,0) + IFNULL(s.`16~17`,0)
            ELSE 0
        END
    ) AS 평일오후_하차합,

    SUM(
        IFNULL(s.`12~13`,0) + IFNULL(s.`13~14`,0) + IFNULL(s.`14~15`,0)
      + IFNULL(s.`15~16`,0) + IFNULL(s.`16~17`,0)
    ) AS 평일오후_전체합,

    SUM(
        CASE
            WHEN s.구분 = '승차'
            THEN IFNULL(s.`17~18`,0) + IFNULL(s.`18~19`,0)
            ELSE 0
        END
    ) AS 퇴근_승차합,

    SUM(
        CASE
            WHEN s.구분 = '하차'
            THEN IFNULL(s.`17~18`,0) + IFNULL(s.`18~19`,0)
            ELSE 0
        END
    ) AS 퇴근_하차합,

    SUM(
        IFNULL(s.`17~18`,0) + IFNULL(s.`18~19`,0)
    ) AS 퇴근_전체합

FROM subway_total s
LEFT JOIN holiday_check h
    ON s.날짜 = h.날짜
GROUP BY
    s.src_year,
    h.휴무일구분,   -- holiday_check 실제 컬럼명으로 수정 필요
    s.호선,
    s.역번호,
    s.역명;
   