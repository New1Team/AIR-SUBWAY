import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import ScatterTooltip from './scatter-tooltip';
import ScatterLegend from './scatter-legend';
import useWindowSize  from '@/hooks/useWindowSize';



const ScatterSection = ({ data, max, mid }) => {
   const { width } = useWindowSize();

  // 브레이크포인트 기준 정의
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // 화면 크기에 따라 차트 너비 비율 조정
  const chartWidth = isMobile ? '100%' : isTablet ? '75%' : '50%';

  // 화면 크기에 따라 차트 높이 조정
  const chartHeight = isMobile ? 260 : isTablet ? 320 : 380;

  // 화면 크기에 따라 여백 조정
  const chartMargin = isMobile
    ? { top: 10, right: 10, bottom: 40, left: 10 }
    : { top: 18, right: 24, bottom: 26, left: 8 };

  // 라벨 폰트 크기 조정
  const labelFontSize = isMobile ? 10 : 12;
  return (
    <div className="plan-section">
      <div className="plan-card">
        <h4>(평일) 직장인 타겟 광고</h4>

        <div className="weekday-scatter-wrap">
          <div className="weekday-scatter-title">직장인 이동 패턴 산점도</div>

          <div className="scatter-chart-box" style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="50%" height={380}>
              <ScatterChart margin={{ top: 18, right: 24, bottom: 26, left: 8 }}
              style = {{outline : 'none'}}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="x"
                  name="출근 하차"
                  type="number"
                  domain={[0, max]}
                  ticks={[0, '', '', '', '']}
                  tickFormatter={(v) => Number(v).toLocaleString()}
                  label={{ value: '출근 하차합', position: 'insideBottom', offset: isMobile ? -10 : -4, fontSize: labelFontSize}}
                  tick={{ fontSize: labelFontSize }}
                />

                <YAxis
                  dataKey="y"
                  name="퇴근 승차"
                  domain={[0, max]}
                  ticks={[0, '', '', '', '']}
                  tickFormatter={(v) => Number(v).toLocaleString()}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: '퇴근 승차합',
                    angle: -90,
                    position: 'insideLeft',
                    offset: isMobile ? 18 : 14,
                    style: { textAnchor: 'middle' },
                  }}
                  width={isMobile ? 40 : 60} // 모바일에서 Y축 너비 축소
                />

                <ReferenceArea x1={mid} x2={max} y1={mid} y2={max} fill="#fcc1c1" fillOpacity={0.4} />
                <ReferenceArea x1={0} x2={mid} y1={mid} y2={max} fill="#ffe476" fillOpacity={0.4} />
                <ReferenceArea x1={0} x2={mid} y1={0} y2={mid} fill="#72b9ff" fillOpacity={0.4} />
                <ReferenceArea x1={mid} x2={max} y1={0} y2={mid} fill="#7bffa9" fillOpacity={0.4} />

                <ReferenceLine
                  x={mid}
                  stroke="red"
                  strokeDasharray="4 4"
                  label={
                    isMobile
                    ? null
                     :{ value: '중앙점', position: 'top', fill: '#64748b', fontSize: 12 }}
                />
                <ReferenceLine
                  y={mid}
                  stroke="blue"
                  strokeDasharray="4 4"
                  label={{ value: '', position: 'right', fill: '#64748b', fontSize: 12 }}
                />

                <Tooltip content={<ScatterTooltip />} />
                <Scatter name="역" data={data} fill="#6366f1" opacity={0.72} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <ScatterLegend />
        </div>
      </div>
    </div>
  );
};

export default ScatterSection;