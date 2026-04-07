DROP TABLE IF EXISTS station_timeband_summary;

CREATE TABLE station_timeband_summary (
    src_year INT NOT NULL,
    휴무일구분 VARCHAR(20) NOT NULL,
    호선 VARCHAR(50) NOT NULL,
    역번호 VARCHAR(50) NOT NULL,
    역명 VARCHAR(100) NOT NULL,

    출근_승차합 BIGINT NOT NULL DEFAULT 0,
    출근_하차합 BIGINT NOT NULL DEFAULT 0,
    출근_전체합 BIGINT NOT NULL DEFAULT 0,

    오전_승차합 BIGINT NOT NULL DEFAULT 0,
    오전_하차합 BIGINT NOT NULL DEFAULT 0,
    오전_전체합 BIGINT NOT NULL DEFAULT 0,

    오후_승차합 BIGINT NOT NULL DEFAULT 0,
    오후_하차합 BIGINT NOT NULL DEFAULT 0,
    오후_전체합 BIGINT NOT NULL DEFAULT 0,

    퇴근_승차합 BIGINT NOT NULL DEFAULT 0,
    퇴근_하차합 BIGINT NOT NULL DEFAULT 0,
    퇴근_전체합 BIGINT NOT NULL DEFAULT 0,

    PRIMARY KEY (src_year, 휴무일구분, 호선, 역번호),
    INDEX idx_station_lookup (역번호, src_year, 휴무일구분)
) ENGINE=InnoDB;