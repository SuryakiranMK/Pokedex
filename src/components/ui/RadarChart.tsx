import React from 'react'
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface RadarChartProps {
  data: any[]
  dataKeys: string[]
  colors: string[]
  height?: number
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  dataKeys,
  colors,
  height = 350,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: 'rgba(240, 240, 255, 0.6)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
        />
        {dataKeys.map((key, i) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.15}
            strokeWidth={2.5}
            activeDot={{ r: 4 }}
          />
        ))}
        <Legend 
          wrapperStyle={{ paddingTop: 10, fontSize: 12, fontFamily: 'var(--font-display)' }}
          formatter={(v) => <span className="text-[#f0f0ff] opacity-80 capitalize">{v}</span>}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}

export default RadarChart
