import React from 'react';
import {Series} from 'remotion';
import {SceneA, SceneB, SceneC, SceneD, SceneE} from './scenes';

export const FPS = 30;
const LENS = {a: 22 * FPS, b: 34 * FPS, c: 42 * FPS, d: 40 * FPS, e: 20 * FPS};
export const TOTAL_FRAMES = LENS.a + LENS.b + LENS.c + LENS.d + LENS.e;

export const Status: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={LENS.a}><SceneA len={LENS.a} /></Series.Sequence>
    <Series.Sequence durationInFrames={LENS.b}><SceneB len={LENS.b} /></Series.Sequence>
    <Series.Sequence durationInFrames={LENS.c}><SceneC len={LENS.c} /></Series.Sequence>
    <Series.Sequence durationInFrames={LENS.d}><SceneD len={LENS.d} /></Series.Sequence>
    <Series.Sequence durationInFrames={LENS.e}><SceneE len={LENS.e} /></Series.Sequence>
  </Series>
);
