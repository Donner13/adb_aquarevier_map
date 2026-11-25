import React from 'react';
import {Composition} from 'remotion';
import {Status, TOTAL_FRAMES, FPS} from './Status';

export const Root: React.FC = () => (
  <Composition
    id="Status"
    component={Status}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
