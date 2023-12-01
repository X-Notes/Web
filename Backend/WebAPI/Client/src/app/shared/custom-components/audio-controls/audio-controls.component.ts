import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioService } from 'src/app/content/notes/audio.service';
import { showDropdown } from '../../services/personalization.service';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from '../../enums/theme.enum';
import { AudioModel } from 'src/app/editor/entities/contents/audios-collection';
import { audioControlsId } from 'src/app/core/defaults/component-sizes';

@Component({
  selector: 'app-audio-controls',
  templateUrl: './audio-controls.component.html',
  styleUrls: ['./audio-controls.component.scss'],
  animations: [showDropdown],
})
export class AudioControlsComponent implements OnInit, OnDestroy {
  @Select(UserStore.getUserTheme)
  public theme$?: Observable<ThemeENUM>;

  idAudioControls = audioControlsId;

  isOpen = false;

  themeE = ThemeENUM;

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'start',
        originY: 'top',
      },
      { overlayX: 'start', overlayY: 'bottom' },
      0,
      1,
    ),
  ];

  constructor(public audioService: AudioService, private apiBrowser: ApiBrowserTextService) {}

  get isFirstPlaying() {
    return (
      this.audioService.playlist.findIndex(
        (x) => x.fileId === this.audioService.currentFile.fileId,
      ) === 0
    );
  }

  get isLastPlaying() {
    return (
      this.audioService.playlist.findIndex(
        (x) => x.fileId === this.audioService.currentFile.fileId,
      ) ===
      this.audioService.playlist.length - 1
    );
  }

  // eslint-disable-next-line consistent-return
  get volumeIcon(): string | null {
    const volume = this.audioService.getState()?.currentVolume;
    if(!volume) return null;
    if (volume === 0) {
      return 'volume_off';
    }
    if (volume < 0.5 && volume !== 0) {
      return 'volume_down';
    }
    if (volume >= 0.5) {
      return 'volume_up';
    }
    return null;
  }

  get audioName() {
    return this.audioService.currentFile?.name;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  openFile(item: AudioModel) {
    this.audioService.currentFile = item;
    this.audioService.runAudio(item.audioPath, item.fileId);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }

  play2(audio: AudioModel) {
    this.isOpen = false;
    if (this.audioService.currentFile?.fileId !== audio.fileId) {
      this.openFile(audio);
    }
    this.audioService.play();
  }

  loop() {
    this.audioService.loop();
  }

  mute() {
    this.audioService.mute();
  }

  reset(): void {
    this.apiBrowser.removeAllRanges();
    this.audioService.resetCurrent();
  }

  next() {
    let index = this.audioService.playlist.findIndex(
      (x) => x.fileId === this.audioService.currentFile.fileId,
    );
    index += 1;
    if (this.audioService.playlist[index]) {
      const file = this.audioService.playlist[index];
      this.openFile(file);
    } else {
      throw new Error('index doest not exist');
    }
  }

  previous() {
    let index = this.audioService.playlist.findIndex(
      (x) => x.fileId === this.audioService.currentFile.fileId,
    );
    index -= 1;
    if (this.audioService.playlist[index]) {
      const file = this.audioService.playlist[index];
      this.openFile(file);
    } else {
      throw new Error('index doest not exist');
    }
  }

  onSliderChangeEnd(value: number) {
    this.audioService.seekTo(value);
  }

  input($event: Event): void {
    const value = ($event.target as HTMLInputElement).value;
    this.audioService.seekToVolume(value);
  }

  onSliderVolumeChangeEnd(value: number) {}
}
