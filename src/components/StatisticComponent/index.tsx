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
      <div
        className="ant-statistic-title"
        style={{ color: 'rgba(0,0,0,0.45)' }}
      >
        {title}
      </div>
      <div className="ant-statistic-content">
        <span
          className="ant-statistic-content-value"
          style={{
            width: '100%',
            fontWeight: 'normal',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'inline-block',
          }}
          title={value as string}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
