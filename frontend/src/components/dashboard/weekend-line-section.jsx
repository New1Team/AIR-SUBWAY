const WeekendLineSection = ({
  selectedYear,
  weekendLines,
  hoveredLine,
  hoverStations,
  hoverLoading,
  onLineHover,
  onLineLeave,
  fmt,
}) => {
  return (
    <div className="plan-section">
      <div className="plan-card">
        <h4>(주말) 여가/쇼핑 타겟 광고</h4>
        <p className="plan-desc">주말/공휴일 13~18시 피크 유동 기준 상위 3개 노선</p>

        <div className="weekend-line-rank">
          {weekendLines.map((item) => {
            const max = weekendLines[0]?.weekend_peak || 1;
            const widthPct = (item.weekend_peak / max) * 100;

            return (
              <div
                key={`${item.src_year}-${item.호선}`}
                className="line-rank-item"
                onMouseEnter={() => onLineHover(item.호선)}
                onMouseLeave={onLineLeave}
              >
                <div className="line-rank-header">
                  <span className="line-rank-title">
                    {item.rn}위 {item.호선}호선
                  </span>
                  <span className="line-rank-value">유동인구 합계 {fmt(item.weekend_peak)}명</span>
                </div>

                <div className="line-rank-bar-wrap">
                  <div
                    className={`line-rank-bar rank-${item.rn}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                {hoveredLine === item.호선 && (
                  <div className="line-hover-box">
                    <div className="line-hover-title">
                      {selectedYear}년 · {item.호선}호선 주말 유동 핵심역 TOP5
                    </div>

                    {hoverLoading ? (
                      <div className="line-hover-loading">불러오는 중...</div>
                    ) : hoverStations.length > 0 ? (
                      <ol className="line-hover-list">
                        {hoverStations.map((station, idx) => (
                          <li key={`${station.역명}-${idx}`}>
                            <span className="station-name">
                              {station.rn}위 {station.역명}
                            </span>
                            <span>{fmt(station.weekend_peak)} 명</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="line-hover-empty">데이터가 없습니다.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekendLineSection;