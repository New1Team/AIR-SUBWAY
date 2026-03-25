const KpiCard = ({ title, columns = 'kpi-2col', items = [], fmt }) => {
  return (
    <div className="box kpi-card">
      <span className="kpi-title">{title}</span>

      <div className={`kpi-card-body ${columns}`}>
        {items.map((item, idx) => (
          <div key={`${title}-${idx}`} style={{ display: 'contents' }}>
            <div className="kpi-section">
              <span className={`kpi-section-label ${item.labelClass || ''}`}>
                {item.label}
              </span>

              <div
                className={`kpi-value ${item.valueClass || ''}`}
                title={item.name ?? '-'}
              >
                {item.name ?? '-'}
              </div>

              <span className="kpi-sub">{fmt(item.value)}명</span>
            </div>

            {idx !== items.length - 1 && <div className="kpi-divider" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KpiCard;