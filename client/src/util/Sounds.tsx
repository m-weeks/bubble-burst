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
import shot from '../components/assets/audio/shot.mp3';
import reload from '../components/assets/audio/reload.mp3';
import { Player } from "../types";

const hitNoises = [hit1, hit2, hit3, hit4];
const walkNoises = [walk1, walk2, walk3, walk4];

const audioCache = new Map<string, AudioBuffer>();

const Sounds = ({ player, curPlayer, playerId }: { player: Player, playerId: string, curPlayer: Player }) => {
  const playerRef = useRef(player);
  playerRef.current = player;
  const curPlayerRef = useRef(curPlayer);
  curPlayerRef.current = curPlayer;
  const playerIdRef = useRef(playerId)
  playerIdRef.current = playerId;

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
    const playerPosition = [playerRef.current.x, 0, playerRef.current.z];

    const playerPos = new Vector3(...playerPosition);
    const myPos = new Vector3(...myPosition);
    const distance = playerPos.distanceTo(myPos);
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
    const handleReload = () => {
      playSound.current(reload, 0.5);
    }
    window.addEventListener('reloaded', handleReload);

    const handleDamageTaken = (event: CustomEvent) => {
      if (event.detail.playerId === playerIdRef.current) {
        playSound.current(hitNoises[Math.floor(Math.random() * hitNoises.length)], 1);
      }
    }
    // @ts-ignore
    window.addEventListener('damageTaken', handleDamageTaken);

    const handleFire = (event: CustomEvent) => {
      if (event.detail.clientId === playerIdRef.current) {
        playSound.current(shot, 0.5);
      }
    }
    // @ts-ignore
    window.addEventListener('fire', handleFire);

    return () => {
      window.removeEventListener('reloaded', handleReload);
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
    if (player.moving) {
      interval = setInterval(playWalkSound, 250); // Play sound every 0.5 seconds
    }

    return () => clearInterval(interval);
  }, [player.moving]);

  return null;
}

export default Sounds;