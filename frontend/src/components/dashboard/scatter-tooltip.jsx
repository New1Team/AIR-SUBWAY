const ScatterTooltip = ({ active, payload }) => {
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

export default ScatterTooltip;