import Phaser from 'phaser';

import Bird from '../entities/Bird';
import WallPair from '../entities/WallPair';
import Stats from '../entities/Stats';

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
        this.paused = false;

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
        this.stats = Stats(this);

        // colliders
        this.physics.add.collider(this.birdGroup, this.wallGroup);

        // collision event listeners
        this.physics.world.on('collide', this.killBird.bind(this));
        this.physics.world.on('worldbounds', this.killBird.bind(this));

        // camera
        this.cameras.main.startFollow(this.birds[0], true, 1, 0);

        // pause listener
        this.input.keyboard.on('keydown_P', this.togglePause.bind(this));
        // this.pauseGame();
    }

    update(time, delta) {
        if (!this.paused) {
            this.updateWalls();
            this.stats.incrementScore();
        }
    }

    updateWalls(minX = -160) {
        this.wallPairs.forEach(pair => pair.update(minX));
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
        this.stats.updateIterationsAndHighScore();
        this.updateWalls(600);
        this.resetBirds();
    }

    resetBirds() {
        this.birds.forEach(bird => bird.resurrect());
    }

    togglePause() {
        if (this.paused) {
            this.unpauseGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        this.birds.forEach(bird => bird.pause());
        this.wallPairs.forEach(pair => pair.pause());
        this.paused = true;
    }

    unpauseGame() {
        this.birds.forEach(bird => bird.unpause());
        this.wallPairs.forEach(pair => pair.unpause());
        this.paused = false;
    }
}

export default GameScene;
