// let _id = 0;

const velocityX = -140;
const halfWallHeight = 400;
const halfGapHeight = 60;
const halfWallWidth = 30;

const WallPair = (game, group, x, y = getRandomCenterY()) => {
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

            x = getRandomX(validWallMaxX);
            y = getRandomCenterY();

            top.x = x;
            bottom.x = x;
            top.y = calcTopPartY(y);
            bottom.y = calcBottomPartY(y);
        }
    };

    const getGapCenterCoords = () => {
        return { x: top.x, y };
    };

    const pause = () => {
        top.body.setVelocityX(0);
        bottom.body.setVelocityX(0);
    };

    const unpause = () => {
        top.body.setVelocityX(velocityX);
        bottom.body.setVelocityX(velocityX);
    };

    return { top, bottom, update, getGapCenterCoords, pause, unpause };
};

const getRandomCenterY = () => {
    const vCenter = 300;
    const shift = Math.floor(Math.random() * 220);

    return Math.random() > 0.5 ? vCenter + shift : vCenter - shift;
};
const calcTopPartY = centerY => centerY - halfWallHeight - halfGapHeight;
const calcBottomPartY = centerY => centerY + halfWallHeight + halfGapHeight;
const isValidX = (x, minX = -160) => x > minX && x < 1800;
const getRandomX = lowerBound =>
    lowerBound + Math.floor(400 + Math.random() * 100);

WallPair.halfWallWidth = halfWallWidth;

export default WallPair;
