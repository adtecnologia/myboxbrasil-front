interface KpiComponentProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export default function KpiComponent({
  title,
  value,
  icon,
  color,
}: KpiComponentProps) {
  return (
    <div
      className={`flex min-h-[160px] flex-col rounded-lg ${color} p-4 shadow-lg`}
    >
      <h2 className="mt-2 font-bold text-3xl opacity-75">{title}</h2>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-semibold text-4xl opacity-75">{value}</span>
        <img alt="icones" className="mr-4 h-16 w-16 opacity-70" src={icon} />
      </div>
    </div>
  );
}
