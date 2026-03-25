const LoadingOverlay = ({ show }) => {
  if (!show) return null;

  return (
    <div className="page-loading-overlay">
      <div className="page-loading-content">
        <div className="page-loading-donut" />
        <div className="page-loading-text">로딩중</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;