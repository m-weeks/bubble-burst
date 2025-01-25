import frontIdle from './front-idle.png';
import frontShoot from './shoot.png';
import leftIdle from './left-idle.png';
import rightIdle from './right-idle.png';
import leftShoot from './left-shoot.png';
import rightShoot from './right-shoot.png';
import behindIdle from './back-idle.png';
import behindStep1 from './back-step-1.png';
import behindStep2 from './back-step-2.png';
import frontStep1 from './front-step-1.png';
import frontStep2 from './front-step-2.png';
import leftStep1 from './left-step.png';
import rightStep1 from './right-step.png';

const avatarData = {
  front: {
    idle: frontIdle,
    shoot: frontShoot,
    step: [frontStep1, frontStep2],
  },
  left: {
    idle: leftIdle,
    shoot: leftShoot,
    step: [leftStep1, leftIdle],
  },
  right: {
    idle: rightIdle,
    shoot: rightShoot,
    step: [rightStep1, rightIdle],
  },
  behind: {
    idle: behindIdle,
    step: [behindStep1, behindStep2],
  },
};

export default avatarData