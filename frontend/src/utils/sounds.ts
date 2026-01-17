import { Howl } from 'howler';

const sounds = {
  beep: new Howl({ src: ['/sounds/beep.wav'], volume: 0.3 }),
  success: new Howl({ src: ['/sounds/success.wav'], volume: 0.4 }),
  error: new Howl({ src: ['/sounds/error.wav'], volume: 0.3 }),
  click: new Howl({ src: ['/sounds/click.wav'], volume: 0.2 }),
  digitalLoop: new Howl({ src: ['/sounds/digital-loop.mp3'], loop: true, volume: 0.2 }),
};

export const playSound = (soundName: keyof typeof sounds) => {
  try {
    sounds[soundName]?.play();
  } catch (error) {
    console.log('Sound not available:', soundName);
  }
};

export const stopSound = (soundName: keyof typeof sounds) => {
  try {
    sounds[soundName]?.stop();
  } catch (error) {
    console.log('Sound not available:', soundName);
  }
};

export default sounds;
