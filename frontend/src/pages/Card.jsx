import { useState, useEffect, useRef } from "react";
import { api } from "@utils/network";

import "@assets/Dashboard.css";
import "@assets/Maps.css";

import Maps from "@pages/Maps";

import InfoBar from "@components/maps/info-bar";
import MapEvidenceOverlay from "@components/maps/map-evidence-overlay";

import KpiSection from "@components/dashboard/kpi/kpi-section";
import DashboardTooltip from "@components/dashboard/tooltip/tooltip";
import ScatterSection from "@components/dashboard/scatter/scatter-section";
import WeekendLineSection from "@components/dashboard/weekend/weekend-line-section";

import LoadingOverlay from "@components/common/loading-overlay";

import seoulZoningReference from "@assets/images/seoul-zoning-reference.png";

const Card = () => {
  const MAX = 8000000;
  const MID = MAX / 2;

  const [selectedYear, setSelectedYear] = useState(2021);

  /* =========================================================
     전체 페이지 로딩
  ========================================================= */
  const [mainLoading, setMainLoading] = useState(true);
  const [weekendLoading, setWeekendLoading] = useState(true);
  const loading = mainLoading || weekendLoading;

  /* =========================================================
     비교 모드 on/off
  ========================================================= */
  const [compareMode, setCompareMode] = useState(false);

  const [data, setData] = useState([]);
  const [avg, setAvg] = useState({ x: 0, y: 0 });

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

  const [weekendLines, setWeekendLines] = useState([]);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [hoverStations, setHoverStations] = useState([]);
  const [hoverLoading, setHoverLoading] = useState(false);

  const [lineStationsCache, setLineStationsCache] = useState({});
  const [loadingLine, setLoadingLine] = useState(null);

  const fmt = (n) => Number(n ?? 0).toLocaleString();

  /* =========================================================
     KPI + 산점도 데이터
  ========================================================= */
  useEffect(() => {
    const fetchData = async () => {
      setMainLoading(true);

      try {
        const [kpiRes, scatterRes] = await Promise.all([
          api.get("/data/kpi", {
            params: { year: selectedYear },
          }),
          api.get("/data/scatter", {
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
        console.error("데이터 로드 실패:", error);
        setData([]);
        setAvg({ x: 0, y: 0 });
      } finally {
        setMainLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  /* =========================================================
     주말 노선 데이터
  ========================================================= */
  useEffect(() => {
    const fetchWeekendLines = async () => {
      setWeekendLoading(true);

      try {
        const res = await api.get("/data/weekend-lines", {
          params: { year: selectedYear },
        });

        setWeekendLines(res.data?.items || []);
      } catch (error) {
        console.error("주말 노선 데이터 로드 실패:", error);
        setWeekendLines([]);
      } finally {
        setWeekendLoading(false);
      }
    };

    fetchWeekendLines();
  }, [selectedYear]);

  /* =========================================================
     연도 변경 시 hover 캐시 초기화
  ========================================================= */
  useEffect(() => {
    setHoveredLine(null);
    setHoverStations([]);
    setHoverLoading(false);
    setLoadingLine(null);
    setLineStationsCache({});
  }, [selectedYear]);

  /* =========================================================
     주말 노선 hover
  ========================================================= */
  const handleLineHover = async (line) => {
    setHoveredLine(line);

    if (lineStationsCache[line]) {
      setHoverStations(lineStationsCache[line]);
      setHoverLoading(false);
      return;
    }

    if (loadingLine === line) {
      return;
    }

    try {
      setLoadingLine(line);
      setHoverLoading(true);

      const res = await api.get("/data/weekend-line-stations", {
        params: {
          year: selectedYear,
          line,
        },
      });

      const items = res.data?.items || [];

      setHoverStations(items);

      setLineStationsCache((prev) => ({
        ...prev,
        [line]: items,
      }));
    } catch (error) {
      if (axios.isCancel?.(error)) return;

      console.error("호선별 역 순위 데이터 로드 실패:", error);
      setHoverStations([]);
    } finally {
      setLoadingLine(null);
      setHoverLoading(false);
    }
  };

  const handleLineLeave = () => {
    setHoveredLine(null);
    setHoverStations([]);
    setHoverLoading(false);
  };

  return (
    <div className="dashboard-wrapper">
      <LoadingOverlay show={loading} />

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

      <KpiSection kpiData={kpiData} fmt={fmt} />

      {/* =====================================================
         지도 / 비교 모드 영역
      ====================================================== */}
      <div className={`box map-section ${compareMode ? "compare-mode" : ""}`}>
        <button
          type="button"
          className="map-compare-toggle-btn map-compare-toggle-btn--floating"
          onClick={() => setCompareMode((prev) => !prev)}
        >
          {compareMode ? "비교 모드 끄기" : "근거 이미지 비교"}
        </button>

        {!compareMode ? (
          <div className="map-single-view">
            <Maps year={selectedYear} compareMode={false} />
          </div>
        ) : (
          <div className="map-compare-layout">
            <div className="map-compare-panel">
              <div className="map-compare-panel-title">현재 분석 지도</div>
              <div className="map-compare-map">
                <Maps year={selectedYear} compareMode />
              </div>
            </div>

            <div className="map-compare-panel">
              <div className="map-compare-panel-title">참고 이미지</div>
              <div className="map-compare-image-wrap">
                <MapEvidenceOverlay
                  imageSrc={seoulZoningReference}
                  imageAlt="서울 지역별 업무지구와 주거지구 참고 이미지"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <InfoBar />

      <div className="box ad-plan-container">
        <ScatterSection data={data} max={MAX} mid={MID} />

        <WeekendLineSection
          selectedYear={selectedYear}
          weekendLines={weekendLines}
          hoveredLine={hoveredLine}
          hoverStations={hoverStations}
          hoverLoading={hoverLoading}
          onLineHover={handleLineHover}
          onLineLeave={handleLineLeave}
          fmt={fmt}
        />
      </div>

      <DashboardTooltip />
    </div>
  );
};

export default Card;