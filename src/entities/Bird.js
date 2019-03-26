// import Phaser from 'phaser';

const Bird = (game, group, index) => {
    const sprite = group.create(300, 300, 'bird');

    sprite.setCollideWorldBounds(true);
    sprite.setGravityY(2000);
    sprite.body.onCollide = true;
    sprite.body.onWorldBounds = true;
    sprite.body.velocity.setTo(0, 0);

    game.input.keyboard.on('keydown_SPACE', event => {
        sprite.body.setVelocityY(-400 + Math.random() * 30 * (index + 1));
    });

    return sprite;
};

export default Bird;
