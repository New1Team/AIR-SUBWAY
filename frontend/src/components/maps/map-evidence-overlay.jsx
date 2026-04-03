import { useEffect, useRef, useState } from "react";


// 이 항목 자체가 필요 없을 듯
const ZoomableReferenceImage = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const handleWheelNative = (e) => {
      e.preventDefault();
      e.stopPropagation();

      setScale((prev) => {
        const next = Math.min(Math.max(prev + (e.deltaY < 0 ? 0.15 : -0.15), 1), 5);

        if (next === 1) {
          setPosition({ x: 0, y: 0 });
        }

        return next;
      });
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    lastPositionRef.current = position;
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    setPosition({
      x: lastPositionRef.current.x + dx,
      y: lastPositionRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  return (
    <div className="map-evidence-image-wrap">
      <div
        ref={wrapRef}
        className="map-evidence-image-zoom-shell"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={src}
          alt={alt}
          className="map-evidence-image"
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            transition: isDragging ? "none" : "transform 0.15s ease",
          }}
        />
      </div>

      <div className="map-evidence-helper">
        마우스 휠 확대/축소 · 더블클릭 확대/원복 · 드래그 이동
      </div>

      <button
        type="button"
        className="map-evidence-reset-btn"
        onClick={handleReset}
      >
        원래 크기
      </button>
    </div>
  );
};

// const MapEvidenceOverlay = ({
//   imageSrc,
//   imageAlt,
//   title = "분석 비교 참고 이미지",
//   caption = "실제 지역 구조와 분석 결과를 비교하기 위한 참고 이미지입니다.",
// }) => {
//   return (
//     <div className="map-evidence-overlay">
//       <div className="map-evidence-header">
//         <span className="map-evidence-title">{title}</span>
//       </div>

//       <div className="map-evidence-compare-labels">
//         <span className="compare-label compare-label-map">현재 분석 지도</span>
//         <span className="compare-label compare-label-image">참고 이미지</span>
//       </div>

//       <ZoomableReferenceImage src={imageSrc} alt={imageAlt} />

//       <p className="map-evidence-caption">{caption}</p>
//     </div>
//   );
// };

// export default MapEvidenceOverlay;