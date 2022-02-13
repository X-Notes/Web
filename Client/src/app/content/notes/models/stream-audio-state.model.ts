export interface StreamAudioState {
  id: string;
  playing: boolean;
  readableCurrentTime: string | undefined;
  currentTime: number | undefined;
  currentVolume: number | undefined;
  loop: boolean;
  canplay: boolean;
  error: boolean;
}
