import { useEffect, useRef } from "react"
import { AudioListener, AudioLoader, Vector3, PositionalAudio } from "three";
import hit1 from '../components/assets/audio/hit-1.mp3';
import hit2 from '../components/assets/audio/hit-2.mp3';
import hit3 from '../components/assets/audio/hit-3.mp3';
import hit4 from '../components/assets/audio/hit-4.mp3';
import walk1 from '../components/assets/audio/walk-1.mp3';
import walk2 from '../components/assets/audio/walk-2.mp3';
import walk3 from '../components/assets/audio/walk-3.mp3';
import walk4 from '../components/assets/audio/walk-4.mp3';
import punch1 from '../components/assets/audio/punch-1.mp3';
import punch2 from '../components/assets/audio/punch-2.mp3';
import punch3 from '../components/assets/audio/punch-3.mp3';
import punch4 from '../components/assets/audio/punch-4.mp3';
import { Enemy, Player } from "../types";

const hitNoises = [hit1, hit2, hit3, hit4];
const walkNoises = [walk1, walk2, walk3, walk4];
const punchNoises = [punch1, punch2, punch3, punch4];

const audioCache = new Map<string, AudioBuffer>();

type SoundProps = {
  target: Player | Enemy;
  targetId: string;
  curPlayer: Player;
}

const Sounds = ({ target, curPlayer, targetId }: SoundProps) => {
  const targetRef = useRef(target);
  targetRef.current = target;
  const curPlayerRef = useRef(curPlayer);
  curPlayerRef.current = curPlayer;
  const targetIdRef = useRef(targetId)
  targetIdRef.current = targetId;

  const audioLoaderRef = useRef(new AudioLoader());
  const audioLoader = audioLoaderRef.current;

  const loadAudio = (audioClip: string) => {
    return new Promise<AudioBuffer>((resolve, reject) => {
      if (audioCache.has(audioClip)) {
        resolve(audioCache.get(audioClip)!);
      } else {
        audioLoader.load(audioClip, (buffer) => {
          audioCache.set(audioClip, buffer);
          resolve(buffer);
        }, undefined, reject);
      }
    });
  };

  const playSound = useRef(async (audioClip, scale = 0.5) => {
    const listener = new AudioListener();
    const sound = new PositionalAudio(listener);
    
    const myPosition = [curPlayerRef.current.x, 0, curPlayerRef.current.z];
    const otherPosition = [targetRef.current?.x, 0, targetRef.current.z];

    const otherPos = new Vector3(...otherPosition);
    const myPos = new Vector3(...myPosition);
    const distance = otherPos.distanceTo(myPos);
    const volume = Math.min(1 / Math.pow(distance, 4), 1) * scale;

    if (volume < 0.02) {
      return;
    }
    try {
      const buffer = await loadAudio(audioClip);
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(volume);
      sound.setDistanceModel('linear')
      sound.play();
    } catch (err) {
      console.error(`Failed to load audio: ${audioClip}`, err);
    }
  })

  useEffect(() => {
    const handleDamageTaken = (event: CustomEvent) => {
      if (event.detail.enemyId === targetIdRef.current) {
        playSound.current(hitNoises[Math.floor(Math.random() * hitNoises.length)], 1);
      }
    }
    // @ts-ignore
    window.addEventListener('damageTaken', handleDamageTaken);

    const handleFire = (event: CustomEvent) => {
      if (event.detail.clientId === targetIdRef.current) {
        playSound.current(punchNoises[Math.floor(Math.random() * punchNoises.length)], 0.5);
      }
    }
    // @ts-ignore
    window.addEventListener('fire', handleFire);

    return () => {
      // @ts-ignore
      window.removeEventListener('damageTaken', handleDamageTaken);
      // @ts-ignore
      window.removeEventListener('fire', handleFire);
    }
  }, [])

  useEffect(() => {
    const playWalkSound = () => {
      playSound.current(walkNoises[Math.floor(Math.random() * walkNoises.length)], 0.5);
    }
    let interval;
    if (target.moving) {
      interval = setInterval(playWalkSound, 250); // Play sound every 0.5 seconds
    }

    return () => clearInterval(interval);
  }, [target.moving]);

  return null;
}

export default Sounds;