import KpiCard from './kpi-card';

const KpiSection = ({ kpiData, fmt }) => {
  return (
    <div className="kpi-grid-3">
      <KpiCard
        title="출근시간 최대 승하차"
        columns="kpi-2col"
        fmt={fmt}
        items={[
          {
            label: '🟢 승차',
            labelClass: 'boarding',
            name: kpiData.commute.boarding?.역명,
            value: kpiData.commute.boarding?.값,
          },
          {
            label: '🔴 하차',
            labelClass: 'alighting',
            name: kpiData.commute.alighting?.역명,
            value: kpiData.commute.alighting?.값,
          },
        ]}
      />

      <KpiCard
        title="퇴근시간 최대 승하차"
        columns="kpi-2col"
        fmt={fmt}
        items={[
          {
            label: '🟢 승차',
            labelClass: 'boarding',
            name: kpiData.weekday.boarding?.역명,
            value: kpiData.weekday.boarding?.값,
          },
          {
            label: '🔴 하차',
            labelClass: 'alighting',
            name: kpiData.weekday.alighting?.역명,
            value: kpiData.weekday.alighting?.값,
          },
        ]}
      />

      <KpiCard
        title="주말 최대 승하차"
        columns="kpi-4col"
        fmt={fmt}
        items={[
          {
            label: '🟢 오전 승차',
            labelClass: 'boarding',
            valueClass: 'kpi-value-sm',
            name: kpiData.weekend.am_boarding?.역명,
            value: kpiData.weekend.am_boarding?.값,
          },
          {
            label: '🔴 오전 하차',
            labelClass: 'alighting',
            valueClass: 'kpi-value-sm',
            name: kpiData.weekend.am_alighting?.역명,
            value: kpiData.weekend.am_alighting?.값,
          },
          {
            label: '🟢 오후 승차',
            labelClass: 'boarding',
            valueClass: 'kpi-value-sm',
            name: kpiData.weekend.pm_boarding?.역명,
            value: kpiData.weekend.pm_boarding?.값,
          },
          {
            label: '🔴 오후 하차',
            labelClass: 'alighting',
            valueClass: 'kpi-value-sm',
            name: kpiData.weekend.pm_alighting?.역명,
            value: kpiData.weekend.pm_alighting?.값,
          },
        ]}
      />
    </div>
  );
};

export default KpiSection;