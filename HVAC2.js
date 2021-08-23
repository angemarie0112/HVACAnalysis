// extracting the data for training the model
async function getData(linkExtension) {
    const hvacRqst = await 
    fetch('datasets/'+linkExtension)
    const hvac2Data = await hvacRqst.json();
    const finalData = hvac2Data.map(hvac => ({
        comfort: Number(hvac.thermalComfort),
        indoorTemp: Number(hvac.temperature),
        season: seasonChange(hvac.season),
        thermalPreference: pref(hvac.thermalPref),
        month: hvac.month,
        day: hvac.day,
        hour: hvac.hour
    }));
    console.log(finalData);

    return finalData;
}
// end

function seasonChange(season) {
    let n = 1;

    if(season === "Winter") {
        n = 2;
    }
    if(season === "Spring") {
        n = 3;
    }
    if(season === "Autumn") {
        n = 4;
    }
    return n;
}

// converting the thermal preferences to integers
function pref(preference) {
    let g = 1;

    if(preference === "Warmer") {
        g = 2;
    }
    if(preference === "Cooler") {
        g = 3;
    }
    return g;
}

// creating the topology of the model
function createModel() {
    // creating a sequential model
    const model = tf.sequential();

    // adding input layer
    model.add(tf.layers.dense({
        inputShape: [6],
        units: 50,
        useBias: true,
        activation: 'relu'
    }));

    // adding hidden layers
    model.add(tf.layers.dense({
        units: 70,
        useBias: true,
        activation: 'tanh'
    }))

    // adding the output layer
    model.add(tf.layers.dense({
        units: 3,
        useBias: true,
        activation: 'softmax'
    }));

    return model;
}
// end createModel

// converting the data to tensors for training
function convertToTensor(data) {

    return tf.tidy(() => {
        // step 1. shuffle the data
        tf.util.shuffle(data);

        // step 2. convert data to tensor
        const inputs = data.map(d => [d.indoorTemp, d.season, d.comfort, d.month, d.day, d.hour]);
        const labels = data.map(d => d.thermalPreference);

        const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
        const labelTensor = tf.oneHot(tf.tensor1d(labels, 'int32'), 3);

        // step 3. normalize the data to the range 0 - 1 using min max scaling
        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const labelMax = labelTensor.max();
        const labelMin = labelTensor.min();

        const normalizedInputs = 
        inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedLabels = 
        labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        return {
            // the inputs and outputs of the supplied data
            inputs: normalizedInputs,
            labels: labelTensor,

            // returning min and max bounds for later use
            inputMax,
            inputMin,
            labelMax,
            labelMin,
        }
    });
}
// end convertToTensor

// training the model using the training data, and the created model
async function trainModel(model, inputs, labels) {
    // Prepareing the model for training
    model.compile({
        optimizer: tf.train.adam(),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    const batchSize = 60;
    const epochs = 100;

    return await model.fit(inputs, labels, {
        batchSize,
        epochs,
        shuffle: true,
        callbacks: tfvis.show.fitCallbacks(
            { name: 'Thermal Comfort Model Training Performance' },
            [ 'loss', 'accuracy'],
            { height: 200, callbacks: ['onEpochEnd'] }
        )
    });
}
// end trainModel

// adding a time/occurance variable to our dataset
function addOccurence(data) {
    // seperate the data into its various components
    const comft = [];
    const intmp = [];
    const ssn = [];
    const pref = [];
    const occ = [];
    let count = 0;

    // create the marge data
    const marge = [];

    // load the data into their respective arrays
    data.forEach(vals => {
        comft.push(vals.comfort);
        intmp.push(vals.indoorTemp);
        ssn.push(vals.season);
        pref.push(vals.thermalPreference);
        occ.push(count++);
    })

    // merge the seperated arrays into one dataset again
    for (let i = 0; i < data.length; i++) {
        const cft = comft[i];
        const itmp = intmp[i];
        const ss = ssn[i];
        const prf = pref[i];
        const oc = occ[i];

        const mrg = {
            comfort: cft,
            indoorTemp: itmp,
            season: ss,
            thermalPreference: prf,
            occurance: oc
        }

        marge.unshift(mrg);
    }
    // return the merged dataset
    return marge;
}

// seperate the data into training and test set
function trainTest(data, trainPcnt) {
    // calculate the length of the training and testing data
    const dataLength = data.length;
    const trainLength = Math.round((trainPcnt/100) * dataLength);
    const testLength = dataLength - trainLength;

    // create the training and testing data holders
    const trainingData = [];
    const testingData = [];

    // populate the resting data placeholder by randomly selecting indeces from the main data 
    for(let i = 0; i < testLength; i++) {
        const temp = Math.round(dataLength * (Math.random()));
        const tmpData = data[temp];
        let report = 0;
        // console.log(tmpData.occurance);

        testingData.forEach(val => {
            if(val.occurance == tmpData.occurance) {
                report = 1;
            }
        })

        if(report == 0) {
            testingData.push(tmpData);
        }
    }

    // populate the training data placeholder using values in the main data that are not in the testing placeholder
    data.forEach(dval => {
        let report = 0;
        testingData.forEach(vals => {
            if(vals.occurance == dval.occurance) {
                report = 1;
            }
        })

        if(report == 0) {
            trainingData.push(dval);
        }
    })

    // return the training and testing data
    return {
        training: trainingData,
        testing: testingData,
    }   
}
// end TrainTest

// make predictions after trainiing
function makePrediction(model, testData) {
    const trueValues = [];
    const count = [];
    let cnt = 0;

    // extracting the true labels from the test dataset
    testData.forEach(val => {
        trueValues.push(val.thermalPreference);
        count.push(cnt++);
    });

    // normalizing the testingData
    const testNorms = convertToTensor(testData);
    const {inputs, labelMax, labelMin} = testNorms;
    
    // make the prediction using the model and unnormalize the result from the model
    const preds = model.predict(inputs, {batchSize: 64});
    const rslt = preds.arraySync();

    const arranged = [];

    // get the isolated arrays into integer elements
    rslt.forEach(arr => {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.round(arr[i]);
        }
        arranged.push(arr);
    })

    // get the one hot encoded integers back
    const predValues = [];

    arranged.forEach(v => {
        if(v[0] == 0 && v[1] == 0 && v[2] == 0){
            predValues.push(1);
        } else if(v[0] == 0 && v[1] == 1 && v[2] == 0){
            predValues.push(2);
        } else{
            predValues.push(3);        
        }
    })
    // print out the true values and predicted value
    const all = [];
        
    for(let i = 0; i < testData.length; i++) {
        const t = trueValues[i];
        const p = predValues[i];
        const c = count[i];

        const mrg = {trueValue: t, predValue: p, counts: c};
        all.push(mrg);
    }
    return all;    
}
// end testModel

// crearte the confucion matrice
function displayConfucion(testResults) {
    // create empty arrays for the three categories
    const cat1 = [0, 0, 0];
    const cat2 = [0, 0, 0];
    const cat3 = [0, 0, 0];

    // count the categories occurence for each class
    testResults.forEach(vals => {
        if(vals.trueValue == 1 && vals.predValue == 1) {
            cat1[0] += 1;
        } else if (vals.trueValue == 1 && vals.predValue == 2) {
            cat1[1] += 1;
        } else if (vals.trueValue == 1 && vals.predValue == 3) {
            cat1[2] += 1;
        } // end col 1
        else if (vals.trueValue == 2 && vals.predValue == 1) {
            cat2[0] += 1;
        } else if (vals.trueValue == 2 && vals.predValue == 2) {
            cat2[1] += 1;
        } else if (vals.trueValue == 2 && vals.predValue == 3) {
            cat2[2] += 1;
        } // end col 2
        else if (vals.trueValue == 3 && vals.predValue == 1) {
            cat3[0] += 1;
        } else if (vals.trueValue == 3 && vals.predValue == 2) {
            cat3[1] += 1;
        } else if (vals.trueValue == 3 && vals.predValue == 3) {
            cat3[2] += 1;
        } // end col 3
    });

    const matrix = [cat1, cat2, cat3];

    const data = {values: [cat1, cat2, cat3]};
    const surface = {name: 'Model two confusion matrix', tab: 'CF'};
    tfvis.render.confusionMatrix(surface, data);

    console.log(matrix);
} // end display confucion matrix

async function run() {
    const data = await getData('ashareAnge.json');

    // const mainData = addOccurence(data);
    // console.log(mainData);

    // seperating the data into training and test set
    // const seperateData = trainTest(mainData, 70);
    // const {training, testing} = seperateData;
    // console.log(training, testing);

    // create the model
    const model = createModel();

    // converting the training data to tensors
    const tensorData = convertToTensor(data);
    const {inputs, labels} = tensorData;

    // train the model
    await trainModel(model, inputs, labels);
    console.log('Done training')

    // save the model
    await model.save('downloads://my-model');

    // test the model with the test data
    const testPreds = await makePrediction(model, data);

    // display the confusion matrix of the test result
    displayConfucion(testPreds);
}

document.addEventListener('DOMContentLoaded', run);