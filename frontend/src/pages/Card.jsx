import { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // axios.isCancel 체크용으로 유지
import { api } from '../utils/network'; // 공통 axios 인스턴스 사용
import '../assets/Dashboard.css';
import Maps from './Maps';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import '../assets/ScatterLegend.css';

  //  1. 산점도 범례 설명 데이터
  //  - 각 사분면/유형에 대한 제목과 설명을 관리
  //  - ScatterLegend 컴포넌트에서 이 데이터를 순회 렌더링

const INSIGHTS = {
  Efocus: {
    title: '업무 중심지',
    description: '강남, 여의도, 시청 같은 전형적인 중심 업무 지구입니다.',
  },
  Edominant: {
    title: '퇴근 유입지 / 주거 밀집지',
    description:
      "흔히 말하는 '베드타운'보다는, 주거지 근처에서 오후~저녁에 경제 활동을 시작하는 인구가 많은 지역일 수 있습니다.",
  },
  Mdominant: {
    title: '출근 유입지',
    description:
      '이곳은 직장인들이 출근은 하지만, 퇴근 시에는 다른 곳(근처 핫플레이스나 회식 장소)으로 이동하여 지하철을 탈 확률이 높습니다.',
  },
  Nnormal: {
    title: '일반 / 저유동',
    description:
      '직장인 타겟 마케팅에서는 비용 효율을 위해 우선순위에서 배제해야 할 지역입니다.',
  },
};

  //  2. 산점도 범례 컴포넌트
  //  - Card 바깥에 분리해 두면 렌더 구조가 깔끔해짐
  //  - INSIGHTS 객체를 map 돌면서 범례 출력

const ScatterLegend = () => {
  return (
    <div className="scatter-info-bar">
      <div className="info-group">
        <div className="type-tags">
          {Object.entries(INSIGHTS).map(([key, info]) => (
            <div key={key} className="type-tag group">
              <span className={`dot ${key}`} />
              <span className="type-name">{info.title}</span>

              {/* hover 시 보이는 설명 툴팁 */}
              <div className="insight-tooltip">
                <div className="tooltip-header">{info.title}</div>
                <p className="tooltip-desc">{info.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

  //  3. 산점도 점 hover 시 보이는 툴팁
  //  - Recharts Tooltip content 커스텀

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const item = payload[0].payload;

    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #dbe2ea',
          padding: '10px 12px',
          borderRadius: '10px',
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 800, color: '#111827' }}>{item.name}</p>
        <p style={{ margin: '4px 0 0 0', color: '#475569' }}>
          출근 하차합: {Number(item.x ?? 0).toLocaleString()}
        </p>
        <p style={{ margin: '2px 0 0 0', color: '#475569' }}>
          퇴근 승차합: {Number(item.y ?? 0).toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

const Card = () => {
    //  4. 산점도 축 고정값
    //  - MAX: 축 최대값
    //  - MID: 정중앙 기준선
    //  - 현재 산점도는 평균선이 아니라 중앙값(4,000,000) 기준으로 4등분
  const MAX = 8000000;
  const MID = MAX / 2;


    //  5. 기본 상태값

  const [selectedYear, setSelectedYear] = useState(2021);
  const [loading, setLoading] = useState(true);


    //  6. 산점도 데이터 / 평균값 상태
    //  - data: 산점도 점 데이터
    //  - avg : 기존 코드 흐름 유지용 상태
    //    (현재 실제 차트 기준선은 MID 사용 중이므로 avg는 남겨둠)
  const [data, setData] = useState([]);
  const [avg, setAvg] = useState({ x: 0, y: 0 });


    //  7. KPI 카드 데이터 상태
  const [kpiData, setKpiData] = useState({
    commute: {
      boarding: null,
      alighting: null,
    },
    weekday: {
      boarding: null,
      alighting: null,
    },
    weekend: {
      am_boarding: null,
      am_alighting: null,
      pm_boarding: null,
      pm_alighting: null,
    },
  });


    //  8. 주말 노선 rank + hover 관련 상태
    //  - weekendLines : 주말 상위 노선 목록
    //  - hoveredLine  : 현재 hover 중인 호선
    //  - hoverStations: hover 박스에 보여줄 역 목록
    //  - hoverLoading : hover 데이터 로딩 상태

  const [weekendLines, setWeekendLines] = useState([]);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [hoverStations, setHoverStations] = useState([]);
  const [hoverLoading, setHoverLoading] = useState(false);



    //  9. 추가 최적화 상태
    //  [추가 이유]
    //  - 같은 호선 hover 시 API를 매번 다시 호출하지 않기 위해 캐시 사용
    //  - 현재 같은 호선 요청이 진행 중일 때 중복 요청 막기
    //  - lineStationsCache:
    //    { '2호선': [...], '7호선': [...] } 형태로 저장
    //  - loadingLine:
    //    현재 요청 중인 호선명 저장

  const [lineStationsCache, setLineStationsCache] = useState({});
  const [loadingLine, setLoadingLine] = useState(null);

    //  10. 숫자 포맷 함수
  const fmt = (n) => Number(n ?? 0).toLocaleString();


    //  11. KPI + 산점도 데이터 조회
    //  - selectedYear 변경 시 재조회
    //  - axios 직접 호출 대신 api 인스턴스 사용
    //  - Promise.all로 병렬 호출
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [kpiRes, scatterRes] = await Promise.all([
          api.get('/data/kpi', {
            params: { year: selectedYear },
          }),
          api.get('/data/scatter', {
            params: { year: selectedYear },
          }),
        ]);

        setKpiData(kpiRes.data);

        const rows = scatterRes.data?.data || [];

        setData(
          rows.map((r) => ({
            x: r.x_value,
            y: r.y_value,
            name: r.역명,
          }))
        );

        if (rows.length > 0) {
          setAvg({
            x: rows[0].avg_x ?? 0,
            y: rows[0].avg_y ?? 0,
          });
        } else {
          setAvg({ x: 0, y: 0 });
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setData([]);
        setAvg({ x: 0, y: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);


    //  12. 주말 상위 노선 조회
    //  - 선택 연도 변경 시 재조회
    //  - api 인스턴스 사용
  useEffect(() => {
    const fetchWeekendLines = async () => {
      try {
        const res = await api.get('/data/weekend-lines', {
          params: { year: selectedYear },
        });

        setWeekendLines(res.data?.items || []);
      } catch (error) {
        console.error('주말 노선 데이터 로드 실패:', error);
        setWeekendLines([]);
      }
    };
    fetchWeekendLines();
  }, [selectedYear]);


    //  13. 연도 변경 시 hover 관련 상태 초기화
    //  [왜 필요한가]
    //  - 2021년 기준으로 캐시해 둔 2호선 역 목록을
    //    2020년에서도 그대로 재사용하면 잘못된 데이터가 됨
    //  - 그래서 연도 바뀌면 hover / cache를 초기화해야 함
  useEffect(() => {
    setHoveredLine(null);
    setHoverStations([]);
    setHoverLoading(false);
    setLoadingLine(null);
    setLineStationsCache({});
  }, [selectedYear]);



    //  14. 호선 hover 시 역 TOP5 조회
    //  [핵심 최적화 로직]
    //  1) hoveredLine 먼저 설정해서 UI는 즉시 반응
    //  2) 캐시에 있으면 API 호출 없이 바로 사용
    //  3) 같은 호선이 이미 요청 중이면 중복 요청 차단
    //  4) API 성공 시 캐시에 저장
     
  const handleLineHover = async (line) => {
    // hover UI 먼저 반응하도록 현재 호선 저장
    setHoveredLine(line);

    // 1. 이미 불러온 호선이면 캐시 재사용
    if (lineStationsCache[line]) {
      setHoverStations(lineStationsCache[line]);
      setHoverLoading(false);
      return;
    }

    // 2. 현재 같은 호선 요청이 진행 중이면 중복 요청 차단
    if (loadingLine === line) {
      return;
    }

    try {
      setLoadingLine(line);
      setHoverLoading(true);

      const res = await api.get('/data/weekend-line-stations', {
        params: {
          year: selectedYear,
          line: line,
        },
      });

      const items = res.data?.items || [];

      // hover 박스 데이터 세팅
      setHoverStations(items);

      // 다음 hover에서 재호출하지 않도록 캐시 저장
      setLineStationsCache((prev) => ({
        ...prev,
        [line]: items,
      }));
    } catch (error) {
      // axios cancel 에러면 무시
      if (axios.isCancel?.(error)) return;

      console.error('호선별 역 순위 데이터 로드 실패:', error);
      setHoverStations([]);
    } finally {
      setLoadingLine(null);
      setHoverLoading(false);
    }
  };


    //  15. hover 종료 처리
    //  - hover 박스는 닫되
    //  - 캐시는 유지해서 다음 hover에서 재사용
  const handleLineLeave = () => {
    setHoveredLine(null);
    setHoverStations([]);
    setHoverLoading(false);
  };

  return (
    <div className="dashboard-wrapper">
         {/* 16. 연도 선택 드롭다운 */}
      <div className="center-section">
        <select
          className="dropdown"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {Array.from({ length: 2021 - 2008 + 1 }, (_, i) => 2008 + i).map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>
      </div>

         {/* 17. KPI 카드 3개 영역 */}
      <div className="kpi-grid-3">
        <div className="box kpi-card">
          <span className="kpi-title">출근시간 최대 승하차</span>
          <div className="kpi-card-body kpi-2col">
            <div className="kpi-section">
              <span className="kpi-section-label boarding">🟢 승차</span>
              <div className="kpi-value" title={kpiData.commute.boarding?.역명 ?? '-'}>
                {kpiData.commute.boarding?.역명 ?? '-'}
              </div>
              <span className="kpi-sub">{fmt(kpiData.commute.boarding?.값)}명</span>
            </div>

            <div className="kpi-divider" />

            <div className="kpi-section">
              <span className="kpi-section-label alighting">🔴 하차</span>
              <div className="kpi-value" title={kpiData.commute.alighting?.역명 ?? '-'}>
                {kpiData.commute.alighting?.역명 ?? '-'}
              </div>
              <span className="kpi-sub">{fmt(kpiData.commute.alighting?.값)}명</span>
            </div>
          </div>
        </div>

        <div className="box kpi-card">
          <span className="kpi-title">퇴근시간 최대 승하차</span>
          <div className="kpi-card-body kpi-2col">
            <div className="kpi-section">
              <span className="kpi-section-label boarding">🟢 승차</span>
              <div className="kpi-value" title={kpiData.weekday.boarding?.역명 ?? '-'}>
                {kpiData.weekday.boarding?.역명 ?? '-'}
              </div>
              <span className="kpi-sub">{fmt(kpiData.weekday.boarding?.값)}명</span>
            </div>

            <div className="kpi-divider" />

            <div className="kpi-section">
              <span className="kpi-section-label alighting">🔴 하차</span>
              <div className="kpi-value" title={kpiData.weekday.alighting?.역명 ?? '-'}>
                {kpiData.weekday.alighting?.역명 ?? '-'}
              </div>
              <span className="kpi-sub">{fmt(kpiData.weekday.alighting?.값)}명</span>
            </div>
          </div>
        </div>

        <div className="box kpi-card">
          <span className="kpi-title">주말 최대 승하차</span>
          <div className="kpi-card-body kpi-4col">
            <div className="kpi-section">
              <span className="kpi-section-label boarding">🟢 오전 승차</span>
              <div className="kpi-value kpi-value-sm" title={kpiData.weekend.am_boarding?.역명 ?? '-'}>
                {kpiData.weekend.am_boarding?.역명 ?? '-'}
              </div>
              <span className="kpi-sub">{fmt(kpiData.weekend.am_boarding?.값)}명</span>
            </div>

            <div className="kpi-divider" />

            <div className="kpi-section">
              <span className="kpi-section-label alighting">🔴 오전 하차</span>
              <div className="kpi-value kpi-value-sm" title={kpiData.weekend.am_alighting?.역명 ?? '-'}>
                {kpiData.weekend.am_alighting?.역명 ?? '-'}
              </div>
              <span className="kpi-sub">{fmt(kpiData.weekend.am_alighting?.값)}명</span>
            </div>

            <div className="kpi-divider" />

            <div className="kpi-section">
              <span className="kpi-section-label boarding">🟢 오후 승차</span>
              <div className="kpi-value kpi-value-sm" title={kpiData.weekend.pm_boarding?.역명 ?? '-'}>
                {kpiData.weekend.pm_boarding?.역명 ?? '-'}
              </div>
              <span className="kpi-sub">{fmt(kpiData.weekend.pm_boarding?.값)}명</span>
            </div>

            <div className="kpi-divider" />

            <div className="kpi-section">
              <span className="kpi-section-label alighting">🔴 오후 하차</span>
              <div className="kpi-value kpi-value-sm" title={kpiData.weekend.pm_alighting?.역명 ?? '-'}>
                {kpiData.weekend.pm_alighting?.역명 ?? '-'}
              </div>
              <span className="kpi-sub">{fmt(kpiData.weekend.pm_alighting?.값)}명</span>
            </div>
          </div>
        </div>
      </div>

         {/* 18. 지도 영역
         - 선택 연도를 Maps에 전달
         - 로딩 중 overlay 표시 */}
      <div className="box map-section">
        <Maps year={selectedYear}>
          {loading && <div className="loading-overlay">데이터 분석 중...</div>}
        </Maps>
      </div>

         {/* 19. 지도 아래 분석 설명 바 */}
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

         {/* 20. 광고 전략 영역
         - 평일 직장인 타겟 산점도
         - 주말 여가/쇼핑 타겟 노선 랭킹 */}
      <div className="box ad-plan-container">

           {/* 20-1. 평일 직장인 타겟 광고 */}
        <div className="plan-section">
          <div className="plan-card">
            <h4>(평일) 직장인 타겟 광고</h4>

            <div className="weekday-scatter-wrap">
              <div className="weekday-scatter-title">직장인 이동 패턴 산점도</div>

              <div className="scatter-chart-box">
                <ResponsiveContainer width="100%" height={380}>
                  <ScatterChart margin={{ top: 18, right: 24, bottom: 26, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="x"
                      name="출근 하차"
                      type="number"
                      domain={[0, MAX]}
                      ticks={[0, 2000000, 4000000, 6000000, 8000000]}
                      tickFormatter={(v) => Number(v).toLocaleString()}
                      label={{ value: '출근 하차합', position: 'insideBottom', offset: -4 }}
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      dataKey="y"
                      name="퇴근 승차"
                      domain={[0, MAX]}
                      ticks={[0, 2000000, 4000000, 6000000, 8000000]}
                      tickFormatter={(v) => Number(v).toLocaleString()}
                      tick={{ fontSize: 12 }}
                      label={{
                        value: '퇴근 승차합',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 14,
                        style: { textAnchor: 'middle' },
                      }}
                    />

                    {/* 4등분 배경 */}
                    <ReferenceArea x1={MID} x2={MAX} y1={MID} y2={MAX} fill="#fcc1c1" fillOpacity={0.4} />
                    <ReferenceArea x1={0} x2={MID} y1={MID} y2={MAX} fill="#ffe476" fillOpacity={0.4} />
                    <ReferenceArea x1={0} x2={MID} y1={0} y2={MID} fill="#72b9ff" fillOpacity={0.4} />
                    <ReferenceArea x1={MID} x2={MAX} y1={0} y2={MID} fill="#7bffa9" fillOpacity={0.4} />

                    {/* 중앙 기준선 */}
                    <ReferenceLine
                      x={MID}
                      stroke="red"
                      strokeDasharray="4 4"
                      label={{ value: '중앙점', position: 'top', fill: '#64748b', fontSize: 12 }}
                    />
                    <ReferenceLine
                      y={MID}
                      stroke="blue"
                      strokeDasharray="4 4"
                      label={{ value: '중앙점', position: 'right', fill: '#64748b', fontSize: 12 }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Scatter name="역" data={data} fill="#6366f1" opacity={0.72} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <ScatterLegend />
            </div>
          </div>
        </div>

           {/* 20-2. 주말 여가/쇼핑 타겟 광고
           - hover 구조는 그대로 유지
           - 같은 호선 재hover 시 캐시 사용 */}
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
                    onMouseEnter={() => handleLineHover(item.호선)}
                    onMouseLeave={handleLineLeave}
                  >
                    <div className="line-rank-header">
                      <span className="line-rank-title">
                        {item.rn}위 {item.호선}호선
                      </span>
                      <span className="line-rank-value">최고점 {fmt(item.weekend_peak)}</span>
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
                                <span>{fmt(station.weekend_peak)}</span>
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
      </div>

         {/* 21. 하단 도움말 툴팁 */}
      <ReactTooltip id="tt-pattern" place="top" className="custom-tooltip" style={{ zIndex: 9999 }}>
        <div>[주거 지수] (출근 승차 수 + 퇴근 하차 수) / 전체</div>
        <div>[업무 지수] (출근 하차 수 + 퇴근 승차 수) / 전체</div>
        <div>[여가 지수] (평일 오후 하차 수 + 주말 하차 수) / 전체</div>
      </ReactTooltip>

      <ReactTooltip id="tt-norm" place="top" className="custom-tooltip" style={{ zIndex: 9999 }}>
        <div>특정 성격 지수 / (주거+업무+여가 지수 합계)</div>
        <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
          * 해당 역 정체성의 상대적 지분을 나타냅니다.
        </div>
      </ReactTooltip>
    </div>
  );
};

export default Card;