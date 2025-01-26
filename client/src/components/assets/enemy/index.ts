import frontIdle from './front-idle.png';
import leftIdle from './left-idle.png';
import rightIdle from './right-idle.png';
import behindIdle from './back-idle.png';
import behindStep1 from './back-step-1.png';
import behindStep2 from './back-step-2.png';
import frontStep1 from './front-step-1.png';
import frontStep2 from './front-step-2.png';
import leftStep1 from './left-step-1.png';
import leftStep2 from './left-step-2.png';
import rightStep1 from './right-step-1.png';
import rightStep2 from './right-step-2.png';
import frontHit from './hit.png';
import leftHit from './left-hit.png';
import rightHit from './right-hit.png';

const enemyAvatarData = {
  front: {
    idle: frontIdle,
    hit: frontHit,
    step: [frontStep1, frontStep2],
  },
  left: {
    idle: leftIdle,
    hit: leftHit,
    step: [leftStep1, leftStep2],
  },
  right: {
    idle: rightIdle,
    hit: rightHit,
    step: [rightStep1, rightStep2],
  },
  behind: {
    idle: behindIdle,
    step: [behindStep1, behindStep2],
  },
};

export default enemyAvatarData