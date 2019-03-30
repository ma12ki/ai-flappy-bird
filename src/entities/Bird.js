import Phaser from 'phaser';

const hsv = Phaser.Display.Color.HSVColorWheel();
// const gravity = 2000;
const startX = 200;
const startY = 300;

const Bird = (game, group, brain, position) => {
    const sprite = group.create(startX, startY, 'bird');
    let hsvAngle = Phaser.Math.Between(0, 359);
    let velocity = [0, 0];

    sprite.setTint(hsv[hsvAngle].color);
    sprite.hsvAngle = hsvAngle;
    sprite.setAlpha(0.8);

    sprite.setCollideWorldBounds(true);
    sprite.setGravityY(2000);
    sprite.body.onCollide = true;
    sprite.body.onWorldBounds = true;
    sprite.body.velocity.setTo(...velocity);
    sprite.body.immovable = true;

    // const debugLine = game.add.line(startX, startY, 0, 0, 140, 0, hsv[hsvAngle].color);

    // extra attrs

    sprite.flap = () => {
        if (!game.paused) {
            sprite.body.setVelocityY(-400);
        }
    };

    sprite.flapRandom = () => {
        if (!game.paused) {
            sprite.body.setVelocityY(-400 + Math.random() * 50);
        }
    };

    game.input.keyboard.on('keydown_SPACE', sprite.flapRandom);

    sprite.score = 0;
    sprite.alive = true;
    sprite.position = position;

    sprite.incrementScore = score => {
        sprite.score++;
        sprite.brain.score++;
    };

    sprite.setScore = score => {
        sprite.score = score;
        sprite.brain.score = score;
    };

    sprite.kill = () => {
        sprite.x = startX;
        sprite.y = startY;
        sprite.body.enable = false;
        sprite.visible = false;
        sprite.body.setVelocity(0, 0);

        // sprite.setScore(score);
        sprite.alive = false;
    };

    sprite.resurrect = () => {
        sprite.x = startX;
        sprite.y = startY;
        sprite.body.setVelocity(0, 0);
        sprite.body.enable = true;
        sprite.visible = true;

        sprite.setScore(0);
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
            x: wallCoords.x - sprite.x,
            y: wallCoords.y - sprite.y,
        };

        if (sprite.brain.shouldFlap(distance, sprite.y)) {
            sprite.flap();
        }
    };

    return sprite;
};

Bird.startX = startX;
Bird.startY = startY;

export default Bird;
