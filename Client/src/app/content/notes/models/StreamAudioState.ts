export interface StreamAudioState {
  playing: boolean;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number | undefined;
  currentTime: number | undefined;
  currentVolume: number | undefined;
  loop: boolean;
  canplay: boolean;
  error: boolean;
}
