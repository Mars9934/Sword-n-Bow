import "phaser";
import { CoinScene } from "./scenes/coinScene";
import GameConfig = Phaser.Types.Core.GameConfig;
import {WelcomeScene} from "./scenes/welcomeScene";
import {ContinueScene} from "./scenes/continueScene";
import {FirstLevelScene} from "./scenes/firstLevelScene";
const config: GameConfig = {
    title: "Sword n Bow",
    width: 1376,
    height: 768,
    parent: "game",
    scene: [FirstLevelScene, WelcomeScene, ContinueScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    backgroundColor: "#ADD8E6"
};

export class NineRooms extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
};

window.onload = () => {
    var game = new NineRooms(config);
};