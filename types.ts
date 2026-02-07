
export interface JointRotation {
  x: number;
  y: number;
  z: number;
}

export interface Pose {
  name: string;
  hips: JointRotation;
  spine: JointRotation;
  head: JointRotation;
  armL: JointRotation;
  armR: JointRotation;
  legL: JointRotation;
  legR: JointRotation;
}

export interface ChoreographyStep {
  timestamp: number;
  poseName: string;
}

export interface AudioAnalysis {
  bpm: number;
  energy: number[];
  duration: number;
  name: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  CHOREOGRAPHING = 'CHOREOGRAPHING',
  READY = 'READY',
  PLAYING = 'PLAYING'
}
