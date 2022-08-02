export interface StreamAudioState {
  id: string;
  playing: boolean;
  readableCurrentTime?: string;
  currentTime?: number;
  currentVolume?: number;
  loop: boolean;
  canplay: boolean;
  error: boolean;
}
