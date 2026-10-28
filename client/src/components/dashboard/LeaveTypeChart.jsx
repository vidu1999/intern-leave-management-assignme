import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { LEAVE_TYPE_COLORS } from '../../utils/constants.js';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-popover">
      <span className="font-medium text-ink">{item.name}</span>
      <span className="ml-2 text-muted">{item.value} request(s)</span>
    </div>
  );
}

/** Donut chart of leave requests grouped by leave type (right dashboard panel). */
export default function LeaveTypeChart({ data = [], loading }) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Card title="Leave Requests by Type" subtitle="Distribution of all submitted requests">
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-6" aria-hidden="true">
          <div className="h-40 w-40 animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={PieChartIcon}
          title="No leave data yet"
          description="Once leave requests are submitted, this chart shows how they break down by leave type."
          className="py-8"
        />
      ) : (
        <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-center">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter((entry) => entry.count > 0)}
                  dataKey="count"
                  nameKey="leaveType"
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data
                    .filter((entry) => entry.count > 0)
                    .map((entry) => (
                      <Cell key={entry.leaveType} fill={LEAVE_TYPE_COLORS[entry.leaveType]} />
                    ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold leading-none text-ink tabular-nums">{total}</span>
              <span className="mt-1 text-[11px] uppercase tracking-wide text-muted">Total</span>
            </div>
          </div>

          <ul className="w-full space-y-3">
            {data.map((entry) => {
              const percentage = total ? Math.round((entry.count / total) * 100) : 0;
              return (
                <li key={entry.leaveType} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[13px] text-ink">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: LEAVE_TYPE_COLORS[entry.leaveType] }}
                      aria-hidden="true"
                    />
                    {entry.leaveType}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-ink tabular-nums">{entry.count}</span>
                    <span className="w-9 text-right text-xs text-muted tabular-nums">{percentage}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
