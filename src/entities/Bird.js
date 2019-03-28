import Phaser from 'phaser';

const hsv = Phaser.Display.Color.HSVColorWheel();
// const gravity = 2000;

const Bird = (game, group, index) => {
    const sprite = group.create(300, 300, 'bird');
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
        sprite.body.setVelocityY(-400 + Math.random() * 30 * (index + 1));
    };

    game.input.keyboard.on('keydown_SPACE', sprite.flap);

    sprite.alive = true;

    sprite.kill = () => {
        sprite.body.enable = false;
        sprite.visible = false;

        sprite.alive = false;
    };

    sprite.resurrect = () => {
        sprite.x = 300;
        sprite.y = 300;
        sprite.body.setVelocity(0, 0);
        sprite.body.enable = true;
        sprite.visible = true;

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

    return sprite;
};

export default Bird;
