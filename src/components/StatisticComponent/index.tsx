interface StatisticComponentProps {
  title: string;
  value: React.ReactNode;
}

export default function StatisticComponent({
  title,
  value,
}: StatisticComponentProps) {
  return (
    <div className="ant-statistic css-dev-only-do-not-override-m8h0qu">
      <div className="ant-statistic-title">{title}</div>
      <div className="ant-statistic-content">
        <span className="ant-statistic-content-value" style={{ width: '100%' }}>
          {value}
        </span>
      </div>
    </div>
  );
}
