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

const ScatterSection = ({ data, max, mid }) => {
  return (
    <div className="plan-section">
      <div className="plan-card">
        <h4>(평일) 직장인 타겟 광고</h4>

        <div className="weekday-scatter-wrap">
          <div className="weekday-scatter-title">직장인 이동 패턴 산점도</div>

          <div className="scatter-chart-box">
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 18, right: 24, bottom: 26, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="x"
                  name="출근 하차"
                  type="number"
                  domain={[0, max]}
                  ticks={[0, 2000000, 4000000, 6000000, 8000000]}
                  tickFormatter={(v) => Number(v).toLocaleString()}
                  label={{ value: '출근 하차합', position: 'insideBottom', offset: -4 }}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  dataKey="y"
                  name="퇴근 승차"
                  domain={[0, max]}
                  ticks={[0, 2000000, 4000000, 6000000, 8000000]}
                  tickFormatter={(v) => Number(v).toLocaleString()}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: '퇴근 승차합',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 14,
                    style: { textAnchor: 'middle' },
                  }}
                />

                <ReferenceArea x1={mid} x2={max} y1={mid} y2={max} fill="#fcc1c1" fillOpacity={0.4} />
                <ReferenceArea x1={0} x2={mid} y1={mid} y2={max} fill="#ffe476" fillOpacity={0.4} />
                <ReferenceArea x1={0} x2={mid} y1={0} y2={mid} fill="#72b9ff" fillOpacity={0.4} />
                <ReferenceArea x1={mid} x2={max} y1={0} y2={mid} fill="#7bffa9" fillOpacity={0.4} />

                <ReferenceLine
                  x={mid}
                  stroke="red"
                  strokeDasharray="4 4"
                  label={{ value: '중앙점', position: 'top', fill: '#64748b', fontSize: 12 }}
                />
                <ReferenceLine
                  y={mid}
                  stroke="blue"
                  strokeDasharray="4 4"
                  label={{ value: '중앙점', position: 'right', fill: '#64748b', fontSize: 12 }}
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