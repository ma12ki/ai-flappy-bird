import Phaser from 'phaser';

const hsv = Phaser.Display.Color.HSVColorWheel();

const containerX = 720;

const Stats = game => {
    const bg = game.add.rectangle(containerX, 300, 160, 600, 0x0000ff);
    bg.setAlpha(0.2);

    let generation = 1;
    let highScore = 0;
    let score = 0;
    const items = game.birds.map(bird => StatsItem(game, bird));

    const generationLabel = game.add
        .text(containerX - 60, 20, 'Generation: 0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
        })
        .setScrollFactor(0);

    const highScoreLabel = game.add
        .text(containerX - 60, 40, 'Best Score: 0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
        })
        .setScrollFactor(0);

    // const scoreLabel = game.add
    //     .text(670, 70)
    //     .setText('Score: 0')
    //     .setScrollFactor(0);

    // const incrementScore = () => {
    //     score++;
    //     updateScore();
    // };

    // const resetScore = () => {
    //     score = 0;
    //     updateScore();
    // };

    // const updateScore = () => {
    //     scoreLabel.setText(`Score: ${score}`);
    // };

    const updateGenerationAndHighScore = currentHighScore => {
        generation++;
        highScore = Math.max(highScore, currentHighScore);
        highScoreLabel.setText(`Best Score: ${highScore}`);
        generationLabel.setText(`Generation: ${generation}`);
        // resetScore();
    };

    const updatePositions = () => {
        items.forEach(item => item.updatePosition());
    };
    const updateScores = () => {
        items.forEach(item => item.updateScore());
    };
    const updateStatuses = () => {
        items.forEach(item => item.updateStatus());
    };

    return {
        get generation() {
            return generation;
        },
        get highScore() {
            return highScore;
        },
        get score() {
            return score;
        },
        // incrementScore,
        // resetScore,
        updateGenerationAndHighScore,
        updatePositions,
        updateScores,
        updateStatuses,
    };
};

const StatsItem = (game, bird) => {
    const bg = game.add.rectangle(
        containerX - 50,
        40 + bird.position * 50,
        25,
        30,
        hsv[bird.hsvAngle].color,
    );
    bg.setAlpha(0.6);

    let position = bird.position;
    let score = bird.brain.score;

    const positionLabel = game.add
        .text(containerX - 55, 35 + position * 50, position, {
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
        })
        .setScrollFactor(0);

    const scoreLabel = game.add
        .text(containerX - 30, 20 + position * 50, 'Score: 0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
        })
        .setScrollFactor(0);

    const statusLabel = game.add
        .text(
            containerX - 30,
            40 + position * 50,
            `Status: ${bird.brain.status}`,
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: 12,
            },
        )
        .setScrollFactor(0);

    const updatePosition = () => {
        if (bird.position !== position) {
            position = bird.position;
            bg.y = 40 + bird.position * 50;
            positionLabel.setText(position);
            positionLabel.y = 35 + position * 50;
            scoreLabel.y = 25 + position * 50;
            statusLabel.y = 40 + position * 50;
        }
    };
    const updateScore = () => {
        if (bird.brain.score !== score) {
            score = bird.brain.score;
            scoreLabel.setText(`Score: ${score}`);
        }
    };
    const updateStatus = () => {
        statusLabel.setText(bird.brain.status);
    };

    return {
        updatePosition,
        updateScore,
        updateStatus,
    };
};

export default Stats;
