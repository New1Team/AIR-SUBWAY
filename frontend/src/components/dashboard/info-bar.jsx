const InfoBar = () => {
  return (
    <div className="map-info-wrap">
      <div className="analytics-info-bar">
        <div className="info-group">
          <span className="info-label">분석 지표</span>
          <div className="info-content">
            역별 <span className="help-dot" data-tooltip-id="tt-pattern">전체 이용 패턴</span> 대비 성격별
            <span className="norm-text" data-tooltip-id="tt-norm"> 100% 환산 상대적 점유 비중</span>
          </div>
        </div>

        <div className="info-group">
          <span className="info-label">도출 유형</span>
          <div className="type-tags">
            <div className="type-tag">
              <span className="dot focus" />
              <span className="type-name">집중 지역</span>
              <span className="val-sub">1위 비중 50%↑</span>
            </div>

            <div className="type-tag">
              <span className="dot mixed" />
              <span className="type-name">우세 지역</span>
              <span className="val-sub">비중 격차 5~49%</span>
            </div>

            <div className="type-tag">
              <span className="dot Eddominant" />
              <span className="type-name">복합 지역</span>
              <span className="val-sub">비중 격차 5%↓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBar;