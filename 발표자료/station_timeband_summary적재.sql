USE seoul_metro_spark;
DROP TABLE IF EXISTS station_timeband_summary;

CREATE TABLE station_timeband_summary (
    id BIGINT NOT NULL AUTO_INCREMENT,
    src_year INT NOT NULL,
    휴일구분 VARCHAR(20) NOT NULL,
    호선 VARCHAR(20) NOT NULL,
    역번호 VARCHAR(20) NOT NULL,
    역명 VARCHAR(100) NOT NULL,

    출근_승차합 BIGINT NOT NULL DEFAULT 0,
    출근_하차합 BIGINT NOT NULL DEFAULT 0,
    출근_전체합 BIGINT NOT NULL DEFAULT 0,

    평일오전_승차합 BIGINT NOT NULL DEFAULT 0,
    평일오전_하차합 BIGINT NOT NULL DEFAULT 0,
    평일오전_전체합 BIGINT NOT NULL DEFAULT 0,

    평일오후_승차합 BIGINT NOT NULL DEFAULT 0,
    평일오후_하차합 BIGINT NOT NULL DEFAULT 0,
    평일오후_전체합 BIGINT NOT NULL DEFAULT 0,

    퇴근_승차합 BIGINT NOT NULL DEFAULT 0,
    퇴근_하차합 BIGINT NOT NULL DEFAULT 0,
    퇴근_전체합 BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_station_timeband_summary (src_year, 휴일구분, 호선, 역번호)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4;

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
    h.휴무일구분,   -- ⚠️ 실제 컬럼명으로 수정
    s.호선,
    s.역번호,
    s.역명,

    -- 출근 (07~09)
    SUM(CASE WHEN s.구분 = '승차'
        THEN IFNULL(s.`07~08`,0) + IFNULL(s.`08~09`,0)
        ELSE 0 END),

    SUM(CASE WHEN s.구분 = '하차'
        THEN IFNULL(s.`07~08`,0) + IFNULL(s.`08~09`,0)
        ELSE 0 END),

    SUM(IFNULL(s.`07~08`,0) + IFNULL(s.`08~09`,0)),

    -- 평일 오전 (09~12)
    SUM(CASE WHEN s.구분 = '승차'
        THEN IFNULL(s.`09~10`,0) + IFNULL(s.`10~11`,0) + IFNULL(s.`11~12`,0)
        ELSE 0 END),

    SUM(CASE WHEN s.구분 = '하차'
        THEN IFNULL(s.`09~10`,0) + IFNULL(s.`10~11`,0) + IFNULL(s.`11~12`,0)
        ELSE 0 END),

    SUM(IFNULL(s.`09~10`,0) + IFNULL(s.`10~11`,0) + IFNULL(s.`11~12`,0)),

    -- 평일 오후 (12~17)
    SUM(CASE WHEN s.구분 = '승차'
        THEN IFNULL(s.`12~13`,0) + IFNULL(s.`13~14`,0)
           + IFNULL(s.`14~15`,0) + IFNULL(s.`15~16`,0)
           + IFNULL(s.`16~17`,0)
        ELSE 0 END),

    SUM(CASE WHEN s.구분 = '하차'
        THEN IFNULL(s.`12~13`,0) + IFNULL(s.`13~14`,0)
           + IFNULL(s.`14~15`,0) + IFNULL(s.`15~16`,0)
           + IFNULL(s.`16~17`,0)
        ELSE 0 END),

    SUM(
        IFNULL(s.`12~13`,0) + IFNULL(s.`13~14`,0)
      + IFNULL(s.`14~15`,0) + IFNULL(s.`15~16`,0)
      + IFNULL(s.`16~17`,0)
    ),

    -- 퇴근 (17~19)
    SUM(CASE WHEN s.구분 = '승차'
        THEN IFNULL(s.`17~18`,0) + IFNULL(s.`18~19`,0)
        ELSE 0 END),

    SUM(CASE WHEN s.구분 = '하차'
        THEN IFNULL(s.`17~18`,0) + IFNULL(s.`18~19`,0)
        ELSE 0 END),

    SUM(IFNULL(s.`17~18`,0) + IFNULL(s.`18~19`,0))

FROM subway_total s
LEFT JOIN holiday_check h
    ON s.날짜 = h.날짜

GROUP BY
    s.src_year,
    h.휴무일구분,   -- ⚠️ 반드시 동일하게 수정
    s.호선,
    s.역번호,
    s.역명;