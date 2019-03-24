import 'phaser';
// import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
// import TitleScene from './scenes/TitleScene';

const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    type: Phaser.WEBGL,
    pixelArt: true,
    roundPixels: true,
    parent: 'content',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0,
            },
            checkCollision: {
                up: true,
                down: true,
                left: false,
                right: false,
            },
            debug: true,
        },
    },
    scene: GameScene,
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
