import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig} from 'remotion';
import {C, FONT} from './theme';

export const Scene: React.FC<{title: string; kicker?: string; children: React.ReactNode; len: number}> = ({title, kicker, children, len}) => {
  const f = useCurrentFrame();
  const fade = Math.min(interpolate(f, [0, 15], [0, 1], {extrapolateRight: 'clamp'}), interpolate(f, [len - 15, len], [1, 0], {extrapolateLeft: 'clamp'}));
  return (
    <AbsoluteFill style={{background: `linear-gradient(135deg, ${C.bg}, ${C.bg2})`, fontFamily: FONT, color: C.text, opacity: fade, padding: '70px 110px'}}>
      {kicker && <div style={{color: C.accent, fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10}}>{kicker}</div>}
      <div style={{fontSize: 68, fontWeight: 700, marginBottom: 36}}>{title}</div>
      {children}
    </AbsoluteFill>
  );
};

export const useIn = (delay: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 200}});
};

export const Appear: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay, children, style}) => {
  const p = useIn(delay);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * 30}px)`, ...style}}>{children}</div>;
};

export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: C.card, borderRadius: 20, padding: '26px 34px', ...style}}>{children}</div>
);

export const Count: React.FC<{to: number; delay: number; dur?: number}> = ({to, delay, dur = 45}) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [delay, delay + dur], [0, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return <>{v.toLocaleString('de-DE')}</>;
};
