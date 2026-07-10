import { cx } from '@/utils';

interface BarChartProps {
  data: { label: string; value: number }[];
  max?: number;
  tone?: 'brand' | 'accent';
  className?: string;
  valueSuffix?: string;
}

export function BarChart({ data, max, tone = 'brand', className, valueSuffix = '' }: BarChartProps) {
  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cx('flex items-end justify-between gap-2', className)}>
      {data.map((d) => {
        const h = Math.max(2, (d.value / maxVal) * 100);
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-ink-400">{d.value}{valueSuffix}</span>
            <div className="flex h-24 w-full items-end justify-center">
              <div
                className={cx(
                  'w-full max-w-[28px] rounded-t-md transition-all duration-700 ease-out',
                  tone === 'brand' ? 'bg-brand-400' : 'bg-accent-400',
                )}
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-ink-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

interface RingProgressProps {
  value: number;
  max?: number;
  size?: number;
  tone?: 'brand' | 'accent' | 'success';
  label?: string;
  sublabel?: string;
  className?: string;
}

export function RingProgress({ value, max = 100, size = 120, tone = 'brand', label, sublabel, className }: RingProgressProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const colors = { brand: '#2f87ff', accent: '#06c976', success: '#16a34a' };
  return (
    <div className={cx('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors[tone]}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl font-semibold text-ink-900">{label ?? `${pct}%`}</span>
        {sublabel && <span className="text-[10px] text-ink-400">{sublabel}</span>}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  className?: string;
  tone?: 'brand' | 'accent';
}

export function LineChart({ data, className, tone = 'brand' }: LineChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const w = 100;
  const h = 100;
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w;
    const y = h - (d.value / maxVal) * h;
    return `${x},${y}`;
  });
  const path = `M ${points.join(' L ')}`;
  const areaPath = `${path} L ${w},${h} L 0,${h} Z`;
  const color = tone === 'brand' ? '#2f87ff' : '#06c976';
  return (
    <div className={cx('w-full', className)}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-32 w-full">
        <path d={areaPath} fill={color} opacity={0.08} />
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => {
          const x = (i / Math.max(data.length - 1, 1)) * w;
          const y = h - (d.value / maxVal) * h;
          return <circle key={i} cx={x} cy={y} r={1.5} fill={color} vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <div className="mt-1.5 flex justify-between text-[10px] text-ink-400">
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>
    </div>
  );
}
