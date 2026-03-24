import { useMemo, useState } from "react";
import useMapMarkers from "../hooks/useMapMarkers";
import SubwayMap from "../components/maps/SubwayMap";
import "../assets/Maps.css";

const Maps = ({ year = 2021 }) => {
  const [map, setMap] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [currCategory, setCurrCategory] = useState("전체");

  const markers = useMapMarkers(year, currCategory);

  const center = { lat: 37.5547, lng: 126.9707 };

  const avgData = useMemo(() => {
    if (!markers.length) {
      return {
        home: 0,
        work: 0,
        culture: 0,
      };
    }

    const sum = markers.reduce(
      (acc, cur) => {
        acc.home += Number(cur.homeRatio) || 0;
        acc.work += Number(cur.workRatio) || 0;
        acc.culture += Number(cur.cultureRatio) || 0;
        return acc;
      },
      { home: 0, work: 0, culture: 0 }
    );

    return {
      home: sum.home / markers.length,
      work: sum.work / markers.length,
      culture: sum.culture / markers.length,
    };
  }, [markers]);

  return (
    <div className="maps-page">
      <div className="map-card">
        <div className="map-header">
          <div className="map-category-buttons">
            {["전체", "주거지", "산업지", "문화권"].map((category) => (
              <button
                key={category}
                className={`map-category-btn ${
                  currCategory === category ? "active" : ""
                }`}
                onClick={() => {
                  setHoveredMarkerId(null);
                  setCurrCategory(category);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <SubwayMap
          map={map}
          setMap={setMap}
          center={center}
          markers={markers}
          hoveredMarkerId={hoveredMarkerId}
          setHoveredMarkerId={setHoveredMarkerId}
          avgData={avgData}
        />

        <div className="analysis-info-box">
          <div className="analysis-info-title">분석 지표</div>
          <div className="analysis-info-desc">
            역별 전체 이용 패턴 대비 성격별 100% 환산 상대적 점유 비중
          </div>

          <div className="analysis-legend">
            <div className="legend-row">
              <span className="dot focus" />
              집중지역
            </div>
            <div className="legend-row">
              <span className="dot dominant" />
              우세지역
            </div>
            <div className="legend-row">
              <span className="dot mixed" />
              복합지역
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maps;