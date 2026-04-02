CREATE TABLE `dim_station` (
	`station_key`	BIGINT	NOT NULL,
	`station_name`	VARCHAR(100)	NOT NULL,
	`representative_no`	VARCHAR(20)	NOT NULL,
	`latitude`	DECIMAL(10, 7)	NULL,
	`longitude`	DECIMAL(10, 7)	NULL
);

CREATE TABLE `dim_line` (
	`line_key`	INT	NOT NULL,
	`line_name`	VARCHAR(50)	NOT NULL
);

CREATE TABLE `dim_date` (
	`date_key`	INT	NOT NULL,
	`full_date`	DATE	NOT NULL,
	`year_no`	SMALLINT	NOT NULL,
	`month_no`	TINYINT	NOT NULL,
	`day_no`	TINYINT	NOT NULL,
	`weekday_no`	TINYINT	NOT NULL,
	`weekday_name`	VARCHAR(10)	NOT NULL,
	`day_type`	VARCHAR(20)	NOT NULL
);

CREATE TABLE `mart_station_timeband_summary` (
	`summary_id`	BIGINT	NOT NULL,
	`src_year`	SMALLINT	NOT NULL,
	`station_key`	BIGINT	NOT NULL,
	`휴무일구분`	VARCHAR(20)	NOT NULL,
	`출근_승차합`	BIGINT	NOT NULL,
	`출근_하차합`	BIGINT	NOT NULL,
	`출근_전체합`	BIGINT	NOT NULL,
	`오전_승차합`	BIGINT	NOT NULL,
	`오전_하차합`	BIGINT	NOT NULL,
	`오전_전체합`	BIGINT	NOT NULL,
	`오후_승차합`	BIGINT	NOT NULL,
	`오후_하차합`	BIGINT	NOT NULL,
	`오후_전체합`	BIGINT	NOT NULL,
	`퇴근_승차합`	BIGINT	NOT NULL,
	`퇴근_하차합`	BIGINT	NOT NULL,
	`퇴근_전체합`	BIGINT	NOT NULL
);

CREATE TABLE `fact_station_hourly_flow` (
	`flow_id`	BIGINT	NOT NULL,
	`date_key`	INT	NOT NULL,
	`station_key`	BIGINT	NOT NULL,
	`line_key`	INT	NOT NULL,
	`time_slot_key`	INT	NOT NULL,
	`ride_type`	CHAR(2)	NOT NULL,
	`passengers`	BIGINT	NOT NULL,
	`src_year`	SMALLINT	NOT NULL
);


CREATE TABLE `subway_total` (
	`subway_id`	BIGINT NOT NULL AUTO_INCREMENT,
	PRIMARY KEY (`subway_id`),
	`날짜`	DATE	NOT NULL,
	`호선`	VARCHAR(50)	NOT NULL,
	`역번호`	VARCHAR(20)	NOT NULL,
	`역명`	VARCHAR(100)	NOT NULL,
	`구분`	VARCHAR(10seoul_metro_spark)	NOT NULL,
	`05~06`	BIGINT	NULL,
	`06~07`	BIGINT	NULL,
	`07~08`	BIGINT	NULL,
	`08~09`	BIGINT	NULL,
	`09~10`	BIGINT	NULL,
	`10~11`	BIGINT	NULL,
	`11~12`	BIGINT	NULL,
	`12~13`	BIGINT	NULL,
	`13~14`	BIGINT	NULL,
	`14~15`	BIGINT	NULL,
	`15~16`	BIGINT	NULL,
	`16~17`	BIGINT	NULL,
	`17~18`	BIGINT	NULL,
	`18~19`	BIGINT	NULL,
	`19~20`	BIGINT	NULL,
	`20~21`	BIGINT	NULL,
	`21~22`	BIGINT	NULL,
	`22~23`	BIGINT	NULL,
	`23~24`	BIGINT	NULL,
	`src_year`	SMALLINT	NOT NULL
);

CREATE TABLE `mart_station_profile_score` (
	`profile_id`	BIGIseoul_metro_sparkNT	NOT NULL,
	`src_year`	SMALLINT	NOT NULL,
	`station_key`	BIGINT	NOT NULL,
	`total_in`	BIGINT	NOT NULL,
	`total_out`	BIGINT	NOT NULL,
	`s_h`	DECIMAL(12, 6)	NOT NULL,
	`s_w`	DECIMAL(12, 6)	NOT NULL,
	`s_c`	DECIMAL(12, 6)	NOT NULL,
	`n_h`	DECIMAL(12, 6)	NOT NULL,
	`n_w`	DECIMAL(12, 6)	NOT NULL,
	`n_c`	DECIMAL(12, 6)	NOT NULL,
	`기본_분류`	VARCHAR(20)	NOT NULL,
	`광고_집행_전략`	VARCHAR(30)	NOT NULL,
	`updated_at`	TIMESTAMP	NOT NULL
);

CREATE TABLE `coordinate` (
	`역번호`	VARCHAR(20)	NOT NULL,
	`위도`	DECIMAL(10, 7)	NULL,
	`경도`	DECIMAL(10, 7)	NULL
);

CREATE TABLE `station_name_rep` (
	`역명`	VARCHAR(100)	NOT NULL,
	`대표역번호`	VARCHAR(20)	NOT NULL
);

CREATE TABLE `holiday_check` (
	`날짜`	DATE	NOT NULL,
	`휴무일구분`	VARCHAR(20)	NOT NULL
);

CREATE TABLE `dim_time_slot` (
	`time_slot_key`	INT	NOT NULL,
	`slot_code`	VARCHAR(20)	NOT NULL,
	`start_hour`	TINYINT	NOT NULL,
	`end_hour`	TINYINT	NOT NULL,
	`band_name`	VARCHAR(20)	NOT NULL
);

ALTER TABLE `dim_station` ADD CONSTRAINT `PK_DIM_STATION` PRIMARY KEY (
	`station_key`
);

ALTER TABLE `dim_line` ADD CONSTRAINT `PK_DIM_LINE` PRIMARY KEY (
	`line_key`
);

ALTER TABLE `dim_date` ADD CONSTRAINT `PK_DIM_DATE` PRIMARY KEY (
	`date_key`
);

ALTER TABLE `mart_station_timeband_summary` ADD CONSTRAINT `PK_MART_STATION_TIMEBAND_SUMMARY` PRIMARY KEY (
	`summary_id`
);

ALTER TABLE `fact_station_hourly_flow` ADD CONSTRAINT `PK_FACT_STATION_HOURLY_FLOW` PRIMARY KEY (
	`flow_id`
);

ALTER TABLE `subway_total` ADD CONSTRAINT `PK_SUBWAY_TOTAL` PRIMARY KEY (
	`subway_id`
);

ALTER TABLE `mart_station_profile_score` ADD CONSTRAINT `PK_MART_STATION_PROFILE_SCORE` PRIMARY KEY (
	`profile_id`
);

ALTER TABLE `coordinate` ADD CONSTRAINT `PK_COORDINATE` PRIMARY KEY (
	`역번호`
);

ALTER TABLE `station_name_rep` ADD CONSTRAINT `PK_STATION_NAME_REP` PRIMARY KEY (
	`역명`
);

ALTER TABLE `holiday_check` ADD CONSTRAINT `PK_HOLIDAY_CHECK` PRIMARY KEY (
	`날짜`
);

ALTER TABLE `dim_time_slot` ADD CONSTRAINT `PK_DIM_TIME_SLOT` PRIMARY KEY (
	`time_slot_key`
);
