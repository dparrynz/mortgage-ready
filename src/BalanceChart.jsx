import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// "Loan balance over time" chart for the Quick Repay calculator. Kept in its
// own file and loaded only when that calculator shows results, so the chart
// library (the largest part of the site's code) isn't downloaded on every page.
export default function BalanceChart({ data, height, colors, fmtNZD }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
        <XAxis dataKey="year" type="number" domain={[0, 'dataMax']} tickCount={7} label={{ value: 'Years', position: 'insideBottom', offset: -10 }} />
        <YAxis width={56} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={v => `$${fmtNZD(v)}`} labelFormatter={y => `Year ${y}`} />
        <Legend verticalAlign="top" height={30} />
        <Line type="monotone" dataKey="original" stroke={colors.original} name="Original" dot={false} strokeDasharray="5 5" isAnimationActive={false} connectNulls={false} />
        <Line type="monotone" dataKey="withExtra" stroke={colors.withExtra} name="With extra" dot={false} strokeWidth={2.5} isAnimationActive={false} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
