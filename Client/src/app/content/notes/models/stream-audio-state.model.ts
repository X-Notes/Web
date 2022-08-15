import dayjs from 'dayjs';

export class StreamAudioState {
  id: string;

  playing: boolean;

  currentTime: number | undefined;

  currentVolume: number | undefined;

  loop: boolean;

  canplay: boolean;

  error: boolean;

  constructor(currentVolume: number) {
    this.currentVolume = currentVolume;
  }

  get readableCurrentTime(): string | undefined {
    const format = 'mm:ss';
    const momentTime = this.currentTime * 1000;
    return dayjs(momentTime).format(format);
  }
}
