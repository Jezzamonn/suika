const frequency = 1500;

class MusicClass {
    audio: HTMLAudioElement;
    audioContext: AudioContext;
    source: MediaElementAudioSourceNode;
    filter: BiquadFilterNode;

    filtering = false;

    constructor() {
        this.audio = new Audio('music/suika-slowest.mp3');
        this.audio.volume = 0.5;
        this.audio.loop = true;

        this.audioContext = new AudioContext();
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.audioContext.destination);

        this.filter = this.audioContext.createBiquadFilter();
        this.filter.type = 'highpass';
        this.filter.frequency.setValueAtTime(frequency, 0);
    }

    start() {
        this.audio.play();
    }

    addLowPassFilter() {
        if (this.filtering) {
            return;
        }
        this.source.disconnect(this.audioContext.destination);
        this.source.connect(this.filter);
        this.filter.connect(this.audioContext.destination);
        this.filtering = true;
    }

    clearLowPassFilter() {
        if (!this.filtering) {
            return;
        }
        this.source.disconnect(this.filter);
        this.filter.disconnect(this.audioContext.destination);
        this.source.connect(this.audioContext.destination);
        this.filtering = false;
    }
}

export const music = new MusicClass();
