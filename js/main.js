import LocalStorageMediator from './data/LocalStorageMediator.js';
import StateMachine from './logic/StateMachine.js';
import nextController from './logic/controller/nextController.js';

import { VERSION_MAJOR, VERSION_MINOR, PATCH } from './const/version.js';
console.log(`%cSamogłoskop v${VERSION_MAJOR}.${VERSION_MINOR}.${PATCH}`,
     "font-size: 3rem; font-weight: bold;");

const lsm = LocalStorageMediator.getInstance();
lsm.load();

const sm = StateMachine.getInstance();
sm.state = lsm.state;
sm.lsm = lsm;

nextController({sm, lsm});