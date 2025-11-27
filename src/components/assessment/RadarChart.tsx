import { useEffect, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { AuraScores } from '../../types/aura';

interface RadarChartComponentProps {
  scores: AuraScores;
}

/** Tiny hook to detect mobile screens */
function useIsMobile(breakpoint = 420) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile('matches' in e ? e.matches : (e as MediaQueryList).matches);
    onChange(mq);
    mq.addEventListener?.('change', onChange as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener?.('change', onChange as (e: MediaQueryListEvent) => void);
  }, [breakpoint]);
  return isMobile;
}

export default function RadarChartComponent({ scores }: RadarChartComponentProps) {
  const isMobile = useIsMobile();

  // Shorter labels on mobile to avoid clipping
  const data = [
    { pillar: isMobile ? 'Aware' : 'Awareness',         score: scores.awareness,     fullMark: 100 },
    { pillar: isMobile ? 'Understand' : 'Understanding', score: scores.understanding, fullMark: 100 },
    { pillar: isMobile ? 'Regulate' : 'Regulation',      score: scores.regulation,    fullMark: 100 },
    { pillar: isMobile ? 'Align' : 'Alignment',          score: scores.alignment,     fullMark: 100 },
  ];

  const chartHeight = isMobile ? 260 : 350;
  const outerRadius = isMobile ? 85 : 120;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <RadarChart
        data={data}
        outerRadius={outerRadius}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }} // breathing room so labels don’t cut off
      >
        <defs>
          <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#096b17" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#096b17" stopOpacity={0.6} />
          </linearGradient>
        </defs>

        <PolarGrid stroke="#e5e7eb" strokeWidth={1.1} />
        <PolarAngleAxis
          dataKey="pillar"
          tick={{ fill: '#475569', fontSize: isMobile ? 10 : 13, fontWeight: 500, dy: 10 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }}
          tickCount={isMobile ? 3 : 5}
          stroke="#e5e7eb"
        />
        <Radar
          name="Your Score"
          dataKey="score"
          stroke="#096b17"
          fill="url(#radarGradient)"
          fillOpacity={0.75}
          strokeWidth={2.2}
          dot={{ fill: '#096b17', strokeWidth: 1.2, r: isMobile ? 3 : 4 }}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
