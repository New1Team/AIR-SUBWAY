import React from "react";
import { Map, CustomOverlayMap } from "react-kakao-maps-sdk";

const SubwayMap = ({
  map,
  setMap,
  center,
  zoomLevel,
  markers,
  hoveredMarkerId,
  setHoveredMarkerId,
  avgData,
}) => {
  const getAnchor = (markerLat) => {
    if (!map) return 1.2;

    const bounds = map.getBounds();
    const ne = bounds.getNorthEast().getLat();
    const sw = bounds.getSouthWest().getLat();
    const threshold = ne - (ne - sw) * 0.5;

    return markerLat > threshold ? -0.1 : 1.2;
  };

  const getStrategyClass = (strategy = "") => {
    if (strategy.includes("집중")) return "focus";
    if (strategy.includes("우세")) return "dominant";
    return "mixed";
  };

  return (
    <div className="map-section">
      <Map
        center={center}
        level={zoomLevel}
        style={{ width: "100%", height: "100%" }}
        onCreate={setMap}
      >
        {markers.map((marker) => {
          const strategyClass = getStrategyClass(marker.strategy);
          const isHovered = hoveredMarkerId === marker.id;

          return (
            <React.Fragment key={marker.id}>
              <CustomOverlayMap
                position={{ lat: marker.lat, lng: marker.lng }}
                yAnchor={0.5}
                zIndex={10}
              >
                <div
                  className="map-marker-wrap"
                  onMouseEnter={() => setHoveredMarkerId(marker.id)}
                  onMouseLeave={() => setHoveredMarkerId(null)}
                >
                  <div className={`map-marker-dot ${strategyClass}`} />
                </div>
              </CustomOverlayMap>

              {isHovered && (
                <CustomOverlayMap
                  position={{ lat: marker.lat, lng: marker.lng }}
                  yAnchor={getAnchor(marker.lat)}
                  zIndex={1000}
                >
                  <div className="map-hover-box">
                    <div className="map-hover-title">{marker.title}</div>

                    <div className="map-hover-subtitle">
                      {marker.category} | {marker.strategy}
                    </div>

                    <div className="map-hover-chart-container">
                      {[
                        {
                          label: "주거",
                          my: marker.homeRatio,
                          avg: avgData.home,
                        },
                        {
                          label: "산업",
                          my: marker.workRatio,
                          avg: avgData.work,
                        },
                        {
                          label: "문화",
                          my: marker.cultureRatio,
                          avg: avgData.culture,
                        },
                      ].map((d) => (
                        <div className="bar-group" key={d.label}>
                          <div className="bar-stack">
                            <div className="bar-column">
                              <span className="v-tip my">
                                {(d.my * 100).toFixed(1)}
                              </span>
                              <div
                                className="bar-item my"
                                style={{ height: `${d.my * 100}%` }}
                              />
                            </div>

                            <div className="bar-column">
                              <span className="v-tip avg">
                                {(d.avg * 100).toFixed(1)}
                              </span>
                              <div
                                className="bar-item avg"
                                style={{ height: `${d.avg * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="bar-label">{d.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-dot my" />
                        해당역(%)
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot avg" />
                        평균(%)
                      </div>
                    </div>
                  </div>
                </CustomOverlayMap>
              )}
            </React.Fragment>
          );
        })}
      </Map>
    </div>
  );
};

export default SubwayMap;