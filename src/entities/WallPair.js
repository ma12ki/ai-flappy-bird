// let _id = 0;

const velocityX = -140;

const WallPair = (game, group, x, y = getRandomY()) => {
    const top = group.create(x, calcTopPartY(y), 'wall');
    const bottom = group.create(x, calcBottomPartY(y), 'wall');

    top.body.setVelocityX(velocityX);
    bottom.body.setVelocityX(velocityX);

    top.body.immovable = true;
    bottom.body.immovable = true;

    // let id = _id++;

    // const topLabel = game.add.text(x, 280).setText(`TOP ${id}`);
    // const bottomLabel = game.add.text(x, 320).setText(`BOTTOM ${id}`);

    // extra attrs

    const update = (minX = -160) => {
        // topLabel.x = top.x;
        // bottomLabel.x = bottom.x;

        if (!isValidX(top.x, minX)) {
            const validWallMaxX = game.walls
                .filter(wall => isValidX(wall.x, minX))
                .reduce((max, wall) => Math.max(max, wall.x), 0);

            const newX = getRandomX(validWallMaxX);
            const newY = getRandomY();

            top.x = newX;
            bottom.x = newX;
            top.y = calcTopPartY(newY);
            bottom.y = calcBottomPartY(newY);
        }
    };

    const pause = () => {
        top.body.setVelocityX(0);
        bottom.body.setVelocityX(0);
    };

    const unpause = () => {
        top.body.setVelocityX(velocityX);
        bottom.body.setVelocityX(velocityX);
    };

    return { top, bottom, update, pause, unpause };
};

const getRandomY = () => Math.floor(Math.random() * 500 + 100);
const calcTopPartY = centerY => centerY - 450 - 60;
const calcBottomPartY = centerY => centerY - 450 + 800 + 60;
const isValidX = (x, minX = -160) => x > minX && x < 1800;
const getRandomX = lowerBound =>
    lowerBound + Math.floor(400 + Math.random() * 100);

export default WallPair;
