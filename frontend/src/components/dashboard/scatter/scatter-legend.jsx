import '@assets/ScatterLegend.css';

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

const ScatterLegend = () => {
  return (
    <div className="scatter-info-bar">
      <div className="info-group">
        <div className="type-tags">
          {Object.entries(INSIGHTS).map(([key, info]) => (
            <div key={key} className="type-tag group">
              <span className={`dot ${key}`} />
              <span className="type-name">{info.title}</span>

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

export default ScatterLegend;