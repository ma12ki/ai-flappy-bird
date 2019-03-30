import * as tf from '@tensorflow/tfjs';

import { WINNERS_SIZE } from './config';

let counter = 1;
let brains = [];

const brain = () => {
    const id = counter++;
    let score = 0;
    let model = makeModel();

    const shouldFlap = ({ x, y }) => {
        return model.predict(tf.tensor([x, y], [1, 2])).dataSync()[0] > 0.5;
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
            inputShape: [2],
            units: 6,
            activation: 'sigmoid',
            useBias: true,
        }),
    );
    model.add(
        tf.layers.dense({
            units: 1,
            activation: 'sigmoid',
        }),
    );

    model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
    });

    return model;
};

const evolveBrains = () => {
    const { winners, losers, all } = groupWinnersAndLosers();

    all.forEach((brain, i) => {
        switch (i) {
            case 0: {
                // best brain moves on unchanged
                return;
            }
            case 1: {
                brain.model = mutateWeights(brain.model, 0.05);
                return;
            }
            case 2: {
                brain.model = mutateWeights(brain.model, 0.1);
                return;
            }
            case 3:
            case 4: {
                brain.model = mutateWeights(
                    combineWeights(
                        winners[0].model,
                        randomArrayElem(winners).model,
                    ),
                    0.1,
                );
                return;
            }
            case 5:
            case 6: {
                brain.model = mutateWeights(
                    combineWeights(
                        randomArrayElem(winners).model,
                        randomArrayElem(winners).model,
                    ),
                    0.2,
                );
                return;
            }
            case 7:
            case 8: {
                brain.model = mutateWeights(
                    combineWeights(
                        randomArrayElem(winners).model,
                        randomArrayElem(losers).model,
                    ),
                    0.4,
                );
                return;
            }
            default: {
                brain.model = makeModel();
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

const brainsByScore = () => brains.sort((a, b) => a.score - b.score);

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

export default { brain, evolveBrains };
