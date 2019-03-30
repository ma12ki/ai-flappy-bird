import * as tf from '@tensorflow/tfjs';

import { WINNERS_SIZE, SCENE_WIDTH, SCENE_HEIGHT } from './config';

const BRAIN_STATUS = Object.freeze({
    NEW: 'new',
    MVP: 'mvp',
    MUTATED: 'mutated',
    OFFSPRING: 'offspring',
});

let counter = 1;
let brains = [];

// let bestModel;
// let bestScore = 0;

const brain = () => {
    const id = counter++;
    let score = 0;
    let model = makeModel();
    let status = BRAIN_STATUS.NEW;

    const shouldFlap = ({ x, y }, birdY) => {
        const normX = normalize(x, -SCENE_WIDTH, SCENE_WIDTH);
        const normY = normalize(y, -SCENE_HEIGHT, SCENE_HEIGHT);
        const normBirdY = normalize(birdY, -SCENE_HEIGHT, SCENE_HEIGHT);
        // const normX = x;
        // const normY = y;
        // const normBirdY = birdY;

        // console.log(x, y, birdY, normX, normY, normBirdY);

        return (
            model
                .predict(tf.tensor([normX, normY, normBirdY], [1, 3]))
                .dataSync()[0] > 0.5
        );
    };

    const constructedBrain = {
        get id() {
            return id;
        },
        get score() {
            return score;
        },
        set score(newScore) {
            score = newScore;
        },
        get status() {
            return status;
        },
        set status(newStatus) {
            status = newStatus;
        },
        get model() {
            return model;
        },
        set model(newModel) {
            score = 0;
            model = newModel;
        },
        shouldFlap,
    };

    brains.push(constructedBrain);

    return constructedBrain;
};

const makeModel = () => {
    const model = tf.sequential();

    model.add(
        tf.layers.dense({
            inputShape: [3],
            units: 6,
            activation: 'relu',
            useBias: true,
        }),
    );
    model.add(
        tf.layers.dense({
            units: 1,
            activation: 'relu',
        }),
    );

    model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
    });

    return model;
};

const evolveBrains = () => {
    const { winners, all } = groupWinnersAndLosers();
    console.log(all.map(b => b.score));
    const highestScore = winners[0].score;

    if (highestScore < 100) {
        console.log('The whole population sucks. Resetting...');
        return all.forEach(brain => {
            brain.model = makeModel();
            brain.status = BRAIN_STATUS.NEW;
        });
    }

    all.forEach((brain, i) => {
        switch (i) {
            case 0: {
                // if (brain.score > bestScore) {
                //     bestModel = makeModel;
                // }
                console.log(brain.score);
                // best brain moves on unchanged
                brain.status = BRAIN_STATUS.MVP;
                return;
            }
            case 1: {
                brain.model = mutateWeights(winners[0].model, 0.05);
                brain.status = BRAIN_STATUS.MUTATED;
                return;
            }
            case 2: {
                brain.model = mutateWeights(winners[0].model, 0.1);
                brain.status = BRAIN_STATUS.MUTATED;
                return;
            }
            case 3: {
                brain.model = mutateWeights(winners[0].model, 0.2);
                brain.status = BRAIN_STATUS.MUTATED;
                return;
            }
            case 4:
            case 5: {
                brain.model = mutateWeights(
                    combineWeights(
                        winners[0].model,
                        randomArrayElem(winners).model,
                    ),
                    0.2,
                );
                brain.status = BRAIN_STATUS.OFFSPRING;
                return;
            }
            case 6:
            case 7: {
                brain.model = mutateWeights(
                    combineWeights(
                        randomArrayElem(winners).model,
                        randomArrayElem(winners).model,
                    ),
                    0.3,
                );
                brain.status = BRAIN_STATUS.OFFSPRING;
                return;
            }
            default: {
                brain.model = makeModel();
                brain.status = BRAIN_STATUS.NEW;
            }
        }
    });
};

const groupWinnersAndLosers = () => {
    const sortedBrains = brainsByScore();

    const winners = sortedBrains.slice(0, WINNERS_SIZE);
    const losers = sortedBrains.slice(WINNERS_SIZE);

    return {
        winners,
        losers,
        all: sortedBrains,
    };
};

const brainsByScore = () => brains.sort((a, b) => b.score - a.score);

const randomArrayElem = array =>
    array[Math.floor(Math.random() * array.length)];

const mutateWeights = (model, rate = 0.1) => {
    model.layers.forEach(layer => {
        const [weights, biases] = layer.getWeights();
        const newWeights = tf.tidy(() =>
            tf
                .randomNormal(weights.shape, 0, rate)
                .add(weights)
                .clipByValue(-1, 1),
        );

        layer.setWeights([newWeights, biases]);
    });

    return model;
};

const combineWeights = (model1, model2) => {
    const model = makeModel();
    const layerCount = model.layers.length;

    for (let i = 0; i < layerCount; i++) {
        // eslint-disable-next-line no-unused-vars
        const [_, biases] = model.layers[i].getWeights();
        const [weights1] = model1.layers[i].getWeights();
        const [weights2] = model2.layers[i].getWeights();
        const newWeights = tf.tidy(() =>
            tf
                .clone(weights1)
                .add(weights2)
                .div(tf.scalar(2))
                .clipByValue(-1, 1),
        );

        model.layers[i].setWeights([newWeights, biases]);
    }

    return model;
};

// const copyModel = model => {
//     const copy = makeModel();

//     model.layers.forEach((layer, i) => {
//         const [weights, biases] = layer.getWeights();

//         copy.layers[i].setWeights([weights, biases]);
//     });

//     return copy;
// };

const normalize = (value, min, max) => {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }
    return (value / max) * 100;
};

export default { brain, evolveBrains };
