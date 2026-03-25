import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const DashboardTooltip = () => {
  return (
    <>
      <ReactTooltip id="tt-pattern" place="top" className="custom-tooltip" style={{ zIndex: 9999 }}>
        <div>[주거 지수] (출근 승차 수 + 퇴근 하차 수) / 전체</div>
        <div>[업무 지수] (출근 하차 수 + 퇴근 승차 수) / 전체</div>
        <div>[여가 지수] (평일 오후 하차 수 + 주말 하차 수) / 전체</div>
      </ReactTooltip>

      <ReactTooltip id="tt-norm" place="top" className="custom-tooltip" style={{ zIndex: 9999 }}>
        <div>특정 성격 지수 / (주거+업무+여가 지수 합계)</div>
        <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
          * 해당 역 정체성의 상대적 지분을 나타냅니다.
        </div>
      </ReactTooltip>
    </>
  );
};

export default DashboardTooltip;