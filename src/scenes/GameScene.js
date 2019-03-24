import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'GameScene',
        });
    }

    preload() {
        this.load.image('bg', 'assets/images/bg.png');
        this.load.image('bird', 'assets/images/bird.png');
        this.load.image('wall', 'assets/images/wall.png');
    }

    create() {
        // background
        this.add.image(400, 300, 'bg').setScrollFactor(0);

        // walls
        this.walls = this.physics.add.group();
        this.wallArray = [
            this.createWall(Math.floor(700 + Math.random() * 100)),
            this.createWall(Math.floor(1100 + Math.random() * 200)),
            this.createWall(Math.floor(1700 + Math.random() * 300)),
        ];

        // bird
        this.bird = this.physics.add.sprite(300, 300, 'bird');
        this.bird.setCollideWorldBounds(true);
        this.bird.setGravityY(2000);
        this.bird.body.onCollide = true;
        this.bird.body.onWorldBounds = true;
        this.bird.body.velocity.setTo(0, 0);
        this.input.keyboard.on('keydown_SPACE', event => {
            this.bird.body.setVelocityY(-400);
        });

        // stats
        this.iterations = {
            count: 0,
            text: this.add
                .text(622, 30)
                .setText('Iterations: 0')
                .setScrollFactor(0),
        };
        this.highScore = {
            pts: 0,
            text: this.add
                .text(622, 50)
                .setText('High Score: 0')
                .setScrollFactor(0),
        };
        this.score = {
            pts: 0,
            text: this.add
                .text(670, 70)
                .setText('Score: 0')
                .setScrollFactor(0),
        };

        // colliders
        this.physics.add.collider(this.bird, this.walls);

        // collision event listeners
        this.physics.world.on('collide', this.resetGame.bind(this));
        this.physics.world.on('worldbounds', this.resetGame.bind(this));

        // camera
        this.cameras.main.startFollow(this.bird, true, 1, 0);
    }

    createWall(x, y = Math.floor(Math.random() * 500 + 100)) {
        const [yTop, yBottom] = this.calcWallPartsY(y);
        const top = this.walls.create(x, yTop, 'wall');
        top.body.setVelocityX(-140);
        top.body.immovable = true;
        const bottom = this.walls.create(x, yBottom, 'wall');
        bottom.body.setVelocityX(-140);
        bottom.body.immovable = true;
        return { top, bottom };
    }

    calcWallPartsY(yCenter = Math.floor(Math.random() * 500 + 100)) {
        return [yCenter - 450 - 60, yCenter - 450 + 800 + 60];
    }

    update(time, delta) {
        this.updateWalls();
        this.updateScore();
    }

    updateWalls(minX = -160) {
        const updateCondition = ({ top }) => top.x < minX || top.x > 1800;
        const wallsToUpdate = this.wallArray.filter(updateCondition);
        this.wallArray = this.wallArray.filter(
            walls => !updateCondition(walls),
        );

        wallsToUpdate.forEach(walls => {
            const x = this.calcNextWallX();
            const [yTop, yBottom] = this.calcWallPartsY();
            walls.top.x = x;
            walls.top.y = yTop;
            walls.bottom.x = x;
            walls.bottom.y = yBottom;
            this.wallArray.push(walls);
        });
    }

    calcNextWallX() {
        const maxX = this.wallArray.reduce(
            (max, { top }) => Math.max(top.x, max),
            0,
        );

        return maxX + Math.floor(400 + Math.random() * 200);
    }

    updateScore() {
        this.score.text.setText(`Score: ${this.score.pts++}`);
    }

    updateHighScore() {
        this.highScore.pts = Math.max(this.score.pts, this.highScore.pts);
        this.highScore.text.setText(`High Score: ${this.highScore.pts}`);
    }

    updateIterations() {
        this.iterations.count++;
        this.iterations.text.setText(`Iterations: ${this.iterations.count}`);
    }

    resetGame() {
        this.updateIterations();
        this.updateHighScore();
        this.score.pts = 0;
        this.updateScore();
        this.updateWalls(600);
        this.resetBird();
    }

    resetBird() {
        this.bird.x = 300;
        this.bird.y = 300;
        this.bird.body.setVelocity(0, 0);
    }
}

export default GameScene;
