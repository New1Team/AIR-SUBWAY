import Maps from "@pages/Maps";
import MapEvidenceOverlay from "@components/maps/map-evidence-overlay";

const MapCompareSection = ({
  compareMode,
  setCompareMode,
  selectedYear,
  imageSrc,
  imageAlt = "서울 지역별 업무지구와 주거지구 참고 이미지",
}) => {
  return (
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
                imageSrc={imageSrc}
                imageAlt={imageAlt}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCompareSection;