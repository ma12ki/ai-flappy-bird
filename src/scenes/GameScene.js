import Phaser from 'phaser';

import Bird from '../entities/Bird';
import WallPair from '../entities/WallPair';

class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene',
        });
    }

    get birds() {
        return this.birdGroup.children.entries;
    }

    get walls() {
        return this.wallGroup.children.entries;
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
        this.wallGroup = this.physics.add.group();
        this.wallPairs = [
            WallPair(
                this,
                this.wallGroup,
                Math.floor(600 + Math.random() * 100),
            ),
            WallPair(
                this,
                this.wallGroup,
                Math.floor(1000 + Math.random() * 200),
            ),
            WallPair(
                this,
                this.wallGroup,
                Math.floor(1500 + Math.random() * 300),
            ),
        ];

        // birds
        this.birdGroup = this.physics.add.group();
        new Array(3).fill(0).map((_, i) => Bird(this, this.birdGroup, i));

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
        this.physics.add.collider(this.birdGroup, this.wallGroup);

        // collision event listeners
        this.physics.world.on('collide', this.killBird.bind(this));
        this.physics.world.on('worldbounds', this.killBird.bind(this));

        // camera
        this.cameras.main.startFollow(this.birds[0], true, 1, 0);
    }

    update(time, delta) {
        this.updateWalls();
        this.updateScore();
    }

    updateWalls(minX = -160) {
        this.wallPairs.forEach(pair => pair.update(minX));
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

    killBird(object1, object2) {
        let hasAliveBirds = false;

        this.birds.forEach(bird => {
            if (!bird.alive) {
                return;
            }
            if (
                bird === object1 ||
                bird === object2 ||
                (object1.gameObject && object1.gameObject === bird)
            ) {
                bird.kill();
                return;
            }

            hasAliveBirds = true;
        });

        if (!hasAliveBirds) {
            this.resetGame();
        }
    }

    resetGame() {
        this.updateIterations();
        this.updateHighScore();
        this.score.pts = 0;
        this.updateScore();
        this.updateWalls(600);
        this.resetBirds();
    }

    resetBirds() {
        this.birds.forEach(bird => bird.resurrect());
    }
}

export default GameScene;
