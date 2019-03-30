import Phaser from 'phaser';

import WallPair from './WallPair';

const hsv = Phaser.Display.Color.HSVColorWheel();
// const gravity = 2000;
const startX = 300;
const startY = 300;

const Bird = (game, group, brain, index) => {
    const sprite = group.create(startX, startY, 'bird');
    let hsvAngle = Phaser.Math.Between(0, 359);
    let velocity = [0, 0];

    sprite.setTint(hsv[hsvAngle].color);

    sprite.setCollideWorldBounds(true);
    sprite.setGravityY(2000);
    sprite.body.onCollide = true;
    sprite.body.onWorldBounds = true;
    sprite.body.velocity.setTo(...velocity);

    // extra attrs

    sprite.flap = () => {
        sprite.body.setVelocityY(-400);
    };

    sprite.flapRandom = () => {
        sprite.body.setVelocityY(-400 + Math.random() * 50);
    };

    game.input.keyboard.on('keydown_SPACE', sprite.flapRandom);

    sprite.alive = true;

    sprite.kill = score => {
        sprite.body.enable = false;
        sprite.visible = false;

        sprite.score = score;
        sprite.brain.score = score;
        sprite.alive = false;
    };

    sprite.resurrect = () => {
        sprite.x = 300;
        sprite.y = 300;
        sprite.body.setVelocity(0, 0);
        sprite.body.enable = true;
        sprite.visible = true;

        sprite.score = 0;
        sprite.alive = true;
    };

    sprite.pause = () => {
        velocity = [sprite.body.velocity.x, sprite.body.velocity.y];
        sprite.body.velocity.setTo(0, 0);
        sprite.body.allowGravity = false;
    };

    sprite.unpause = () => {
        sprite.body.velocity.setTo(...velocity);
        sprite.body.allowGravity = true;
    };

    // AI

    sprite.brain = brain;

    sprite.aiMove = wallCoords => {
        if (!sprite.alive) {
            return;
        }
        const distance = {
            x: wallCoords.x - sprite.x + WallPair.halfWallWidth,
            y: wallCoords.y - sprite.y,
        };

        if (sprite.brain.shouldFlap(distance)) {
            sprite.flap();
        }
    };

    sprite.swapBrain = brain => {
        sprite.brain = brain;
    };

    return sprite;
};

Bird.startX = startX;

export default Bird;
