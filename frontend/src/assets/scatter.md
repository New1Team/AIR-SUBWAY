/* 산점도 그래프를 감싸는 바깥쪽 박스 */
.weekday-scatter-wrap {
  margin-top: 24px;
}

/* 산점도 그래프 타이틀 */
.weekday-scatter-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #334155;
  margin-bottom: 14px;
}

/* 실제 그래프가 렌더링되는 캔버스/박스 영역 */
.scatter-chart-box {
  width: 100%;
  background: #fbfcfe;
  border: 1px solid #e7edf4;
  border-radius: 16px;
  padding: 18px 22px 10px 16px;
  box-sizing: border-box;
}

/* 그래프 바로 아래 위치하는 요약 정보 바 */
.scatter-info-bar {
  margin-top: 14px;
  width: 100%;
  border: 1px solid #e5eaf0;
  border-radius: 16px;
  background: #fcfdff;
  padding: 14px 18px;
  box-sizing: border-box;
}

.scatter-info-bar .info-group {
  width: 100%;
}

/* 마우스 오버 시 나타나는 상세 박스 */
.line-hover-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 18px 16px 18px;
  margin-top: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* 차트 라이브러리(예: Recharts, Highcharts 등) 커스텀 툴팁 */
.custom-tooltip {
  background: #1f2937 !important;
  color: #ffffff !important;
  border-radius: 10px !important;
  padding: 10px 12px !important;
  border: none !important;
  font-size: 12px !important;
  max-width: 280px;
  line-height: 1.5;
}


/* 1사분면: 연한 빨강 (#fcc1c1) */
.dot.focus { background-color: #fcc1c1; border: 1px solid #f87171; }
/* 2사분면: 연한 노랑 (#ffe476) */
.dot.dominant-evening { background-color: #ffe476; border: 1px solid #fbbf24; }
/* 4사분면: 연한 초록 (#7bffa9) */
.dot.dominant-morning { background-color: #7bffa9; border: 1px solid #34d399; }
/* 3사분면: 연한 파랑 (#72b9ff) */
.dot.normal { background-color: #72b9ff; border: 1px solid #60a5fa; }