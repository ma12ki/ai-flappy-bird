const Stats = game => {
    // const shape = game.add.rectangle(600, 300, 200, 600, 0x000000);
    // shape.setAlpha(0.2);
    // console.log(shape);

    let iterations = 0;
    let highScore = 0;
    let score = 0;

    const iterationsLabel = game.add
        .text(622, 30)
        .setText('Iterations: 0')
        .setScrollFactor(0);

    const highScoreLabel = game.add
        .text(622, 50)
        .setText('High Score: 0')
        .setScrollFactor(0);

    const scoreLabel = game.add
        .text(670, 70)
        .setText('Score: 0')
        .setScrollFactor(0);

    const incrementScore = () => {
        score++;
        updateScore();
    };

    const resetScore = () => {
        score = 0;
        updateScore();
    };

    const updateScore = () => {
        scoreLabel.setText(`Score: ${score}`);
    };

    const updateIterationsAndHighScore = () => {
        iterations++;
        highScore = Math.max(highScore, score);
        highScoreLabel.setText(`High Score: ${highScore}`);
        iterationsLabel.setText(`Iterations: ${iterations}`);
        resetScore();
    };

    return {
        get iterations() {
            return iterations;
        },
        get highScore() {
            return highScore;
        },
        get score() {
            return score;
        },
        incrementScore,
        resetScore,
        updateIterationsAndHighScore,
    };
};

export default Stats;
