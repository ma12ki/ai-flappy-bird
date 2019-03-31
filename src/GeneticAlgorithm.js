import * as tf from '@tensorflow/tfjs';

import {
    WINNERS_SIZE,
    // SCENE_WIDTH,
    SCENE_HEIGHT,
} from './config';

const BRAIN_ORIGIN = Object.freeze({
    NEW: 'new',
    MVP: 'mvp',
    BEST: 'best ever',
    MUTATED: 'mutated',
    OFFSPRING: 'offspring',
});

let counter = 1;
let brains = [];

let bestModel;
let bestScore = 0;

const brain = () => {
    const id = counter++;
    let score = 0;
    let model = makeModel();
    let origin = BRAIN_ORIGIN.NEW;
    let ancestors = [];

    const shouldFlap = ({ x, y }, birdY) => {
        // const normX = normalize(x, SCENE_WIDTH) * 100;
        const normY = normalize(y, SCENE_HEIGHT) * 100;
        // const normBirdY = normalize(birdY, SCENE_HEIGHT) * 100;

        const prediction = model
            .predict(tf.tensor([normY], [1, 1]))
            .dataSync()[0];

        return prediction > 0.5;
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
        get origin() {
            return origin;
        },
        set origin(newOrigin) {
            if (newOrigin === BRAIN_ORIGIN.NEW) {
                ancestors = [];
            } else {
                ancestors.push(origin);
            }
            origin = newOrigin;
        },
        get ancestors() {
            return ancestors;
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
            inputShape: [1],
            units: 10,
            activation: 'sigmoid',
            kernelInitializer: 'randomUniform',
            biasInitializer: 'randomUniform',
            useBias: true,
        }),
    );
    model.add(
        tf.layers.dense({
            units: 1,
        }),
    );

    model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
    });

    // printLayers(model);

    return model;
};

const evolveBrains = () => {
    const { winners, all } = groupWinnersAndLosers();
    const highestScore = winners[0].score;

    // if the generation could not even get a few points, create new population from scratch
    if (
        highestScore < 100 ||
        all.every(brain => brain.score === highestScore)
    ) {
        return all.forEach(brain => {
            brain.model = bestModel
                ? Math.random() > 0.7
                    ? bestModel
                    : makeModel()
                : makeModel();
            brain.origin = BRAIN_ORIGIN.NEW;
        });
    }

    all.forEach((brain, i) => {
        switch (i) {
            case 0: {
                if (brain.score > bestScore) {
                    bestScore = brain.score;
                    bestModel = copyModel(brain.model);
                }
                // best brain moves on unchanged
                brain.origin = BRAIN_ORIGIN.MVP;
                return;
            }
            case 1: {
                if (bestModel === winners[0].model) {
                    brain.model = mutateWeights(winners[0].model, 0.02);
                    brain.origin = BRAIN_ORIGIN.MUTATED;
                } else {
                    brain.model = bestModel;
                    brain.origin = BRAIN_ORIGIN.BEST;
                }
                return;
            }
            case 2: {
                brain.model = mutateWeights(winners[0].model, 0.02);
                brain.origin = BRAIN_ORIGIN.MUTATED;
                return;
            }
            case 3: {
                brain.model = mutateWeights(winners[0].model, 0.05);
                brain.origin = BRAIN_ORIGIN.MUTATED;
                return;
            }
            case 4: {
                brain.model = mutateWeights(winners[0].model, 0.1);
                brain.origin = BRAIN_ORIGIN.MUTATED;
                return;
            }
            case 5:
            case 6: {
                brain.model = mutateWeights(
                    combineWeights(
                        winners[0].model,
                        randomArrayElem(winners).model,
                    ),
                    0.1,
                );
                brain.origin = BRAIN_ORIGIN.OFFSPRING;
                return;
            }
            case 7:
            case 8: {
                brain.model = mutateWeights(
                    combineWeights(
                        randomArrayElem(winners).model,
                        randomArrayElem(winners).model,
                    ),
                    0.1,
                );
                brain.origin = BRAIN_ORIGIN.OFFSPRING;
                return;
            }
            default: {
                brain.model = makeModel();
                brain.origin = BRAIN_ORIGIN.NEW;
            }
        }
    });

    // all.forEach(brain => console.log(brain.ancestors));
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

const mutateWeights = (model, rate = 0.01) => {
    model.layers.forEach(layer => {
        const [weights, biases] = layer.getWeights();
        const newWeights = tf.tidy(() =>
            tf
                .randomNormal(weights.shape, 0, rate)
                .add(tf.scalar(1))
                .mul(weights)
                .clipByValue(-1, 1),
        );
        let newBiases;
        if (biases) {
            newBiases = tf.tidy(() =>
                tf
                    .randomNormal(biases.shape, 0, rate)
                    .add(tf.scalar(1))
                    .mul(biases)
                    .clipByValue(-1, 1),
            );
        }

        layer.setWeights([newWeights, newBiases]);
    });

    return model;
};

const combineWeights = (model1, model2) => {
    const model = makeModel();
    const layerCount = model.layers.length;

    for (let i = 0; i < layerCount; i++) {
        const [weights1, biases1] = model1.layers[i].getWeights();
        const [weights2, biases2] = model2.layers[i].getWeights();
        const newWeights = tf.tidy(() =>
            tf
                .clone(weights1)
                .add(weights2)
                .div(tf.scalar(2))
                .clipByValue(-1, 1),
        );
        let newBiases;
        if (biases1) {
            newBiases = tf.tidy(() =>
                tf
                    .clone(biases1)
                    .add(biases2)
                    .div(tf.scalar(2))
                    .clipByValue(-1, 1),
            );
        }

        model.layers[i].setWeights([newWeights, newBiases]);
    }

    return model;
};

// const printLayers = model =>
//     model.layers.forEach(layer => {
//         const [weights, biases] = layer.getWeights();
//         weights.print();
//         if (biases) {
//             biases.print();
//         }
//     });

const copyModel = model => {
    const copy = makeModel();

    model.layers.forEach((layer, i) => {
        const [weights, biases] = layer.getWeights();

        copy.layers[i].setWeights([weights, biases]);
    });

    return copy;
};

const normalize = (value, max) => {
    if (value < -max) {
        value = -max;
    }
    if (value > max) {
        value = max;
    }
    return value / max;
};

export default { brain, evolveBrains };
