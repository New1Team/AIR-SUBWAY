import { useState } from 'react';

const MapEvidenceOverlay = ({
  imageSrc,
  imageAlt,
  title = '분석 비교 참고 이미지',
  caption = '실제 지역 구조와 분석 결과를 비교하기 위한 참고 이미지입니다.',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="map-evidence-toolbar">
        <button
          type="button"
          className="map-evidence-toggle-btn"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? '근거 이미지 닫기' : '근거 이미지 비교'}
        </button>
      </div>

      {open && (
        <div className="map-evidence-overlay">
          <div className="map-evidence-header">
            <span className="map-evidence-title">{title}</span>

            <button
              type="button"
              className="map-evidence-close-btn"
              onClick={() => setOpen(false)}
            >
              닫기
            </button>
          </div>

          <div className="map-evidence-compare-labels">
            <span className="compare-label compare-label-map">현재 분석 지도</span>
            <span className="compare-label compare-label-image">참고 이미지</span>
          </div>

          <div className="map-evidence-image-wrap">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="map-evidence-image"
            />
          </div>

          <p className="map-evidence-caption">{caption}</p>
        </div>
      )}
    </>
  );
};

export default MapEvidenceOverlay;