// extracting the data for training the model
async function getData(linkExtension) {
    const hvacRqst = await 
    fetch('datasets/'+linkExtension)
    const hvacData = await hvacRqst.json();
    const finalData = hvacData.map(hvac => ({
        date: hvac.date + ' ' + hvac.time,
        room: hvac.room_temp,
        outdoor: hvac.outdoor_temp
    }));

    const cleanedData = missingValues(finalData);

    return cleanedData;
}
// end

function missingValues (data) {
    // get the indoor and outdoor temperature into two seperate arrays
    const roomData = [];
    const outdoorData = [];

    data.forEach(val => {
        roomData.push(val.room);
        outdoorData.push(val.outdoor);
    })

    // calculate the indoor and outdoor means
    const indoorMean = jStat.mean(roomData);
    const outdoorMean = jStat.mean(outdoorData);

    // replace missing values with the means
    data.forEach(value => {
        if (value.outdoor == null) {
            value.outdoor = outdoorMean;
        }

        if (value.room == null) {
            value.room = indoorMean;
        }        
    });

    // returned the cleaned data with any missing values
    return data;
}
// end missingData Treatement

// split the time and data into its necessary componentes
function explodeData(data) {
    const counter = [];
    let count = 0;

    const time_stamp = [];

    const hours = [];
    const minutes = [];

    const date = [];
    const time = [];

    const day = [];
    const month = [];
    const year = [];


    const indoorTemp = [];
    const outdoorTemp = [];

    const marge = [];


    // extracting time_stamp, indoor and outdoor temperature
    data.forEach(val => {
        indoorTemp.push(Number(val.room)); // extract the indoor temperature value from the dataset
        outdoorTemp.push(Number(val.outdoor)); // extract the outdoor temperature form the dataset
        time_stamp.push(val.date) // extract the timestamp
        counter.push(count ++);
    });

    // seperating the date from the time in the time stamp
    time_stamp.forEach(val => {
        const sData = val.split(' ');
        date.push(sData[0]);  // extracting the hours from the time array
        time.push(sData[1]);    // extracting the minutes from the time array
    });

    // seperate the date into day, month and year
    date.forEach(dt => {
        const ddate = dt.split('/');
        day.push(Number(ddate[0]));
        month.push(Number(ddate[1]));
        year.push(Number(ddate[2]));
    });

    // seperating the hours and minutes from the time array
    time.forEach(val => {
        const sData = val.split(':');
        hours.push(Number(sData[0]));  // extracting the hours from the time array
        minutes.push(Number(sData[1]));    // extracting the minutes from the time array
    });

    // combine all the extracted values into one json dataset
    for (let i = 0; i < data.length; i++) {
        const hr = hours[i];
        const mi = minutes[i];
        const d = day[i];
        const m = month[i];
        const y = year[i];
        const inT = indoorTemp[i];
        const outT = outdoorTemp[i];
        const c = counter[i];

        const mrg = {
            hours: hr,
            minutes: mi,
            day: d,
            month: m,
            year: y,
            indoorTemp: inT,
            outdoorTemp: outT,
            counter: c
        }

        marge.unshift(mrg);
    }

    return marge;
}
//end

// splitting the data into training and test set
function splitting(data, trainP) {
    const testDataset = [];
    const trainDataset = [];

    const length = data.length;
    const trainLength = Math.round(((trainP/100) * length));

    for(let i = 0; i < length; i++) {
        if(i <= trainLength ){
            trainDataset.push(data[i]);
        } else {
            testDataset.push(data[i]);
        }        
    }

    return {
        train: trainDataset,
        test: testDataset
    }

}

// plotting the graph of the regression, upper and lower bound of the ci band
function displayData(plotdata) {
    const indoor = plotdata.map(d => ({
      x: d.counter,
      y: d.indoorTemp,
    }));

    const outdoor = plotdata.map(e => ({
        x: e.counter,
        y: e.outdoorTemp,
    }));

    /*
    const lowerBound = plotdata.map(f => ({
        x: f.input,
        y: f.predLower,
    })); */

    const series = ['indoor temp', 'outdoor temp'];
    const data = { values: [indoor, outdoor], series }

    const surface = { name: 'Indoor and Outdoor Temperature', tab: 'HVAC ' };

    tfvis.render.linechart(surface, data);
  }
  // end display data


  function displayPredicted(plotdata) {
    const trueValue = plotdata.map(d => ({
      x: d.counts,
      y: d.trueValue,
    }));

    const predictValue = plotdata.map(e => ({
        x: e.counts,
        y: e.predValue,
    }));

    const series = ['trueValue', 'predictedValue'];
    const data = { values: [trueValue, predictValue], series }

    const surface = { name: 'True vs Predicted values', tab: 'HV                                               ' };

    tfvis.render.linechart(surface, data);
  }
  // end display data

  // plotting the graph of the regression, upper and lower bound of the ci band
function displayScatter(plotdata) {
    const indoor = plotdata.map(d => ({
      x: d.counter,
      y: d.indoorTemp,
    }));

    const outdoor = plotdata.map(e => ({
        x: e.counter,
        y: e.outdoorTemp,
    }));

    /*
    const lowerBound = plotdata.map(f => ({
        x: f.input,
        y: f.predLower,
    })); */

    const series = ['indoor temp', 'outdoor temp'];
    const data = { values: [indoor, outdoor], series }

    const surface = { name: 'Indoor and Outdoor Temperature', tab: 'HV' };

    tfvis.render.scatterplot(surface, data);
  }
  // end display data

  // creating the topology of the model
function createModel() {
    // creating a sequential model
    const model = tf.sequential();

    // adding input layer
    model.add(tf.layers.dense({
        inputShape: [5],
        units: 20,
        useBias: true,
        activation: 'sigmoid'
    }));

    // adding hidden layers
    model.add(tf.layers.dense({
        units: 30,
        useBias: true,
        activation: 'sigmoid'
    }))

    // adding the output layer
    model.add(tf.layers.dense({
        units: 1,
        useBias: true,
        activation: 'sigmoid'
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
        const inputs = data.map(d => [d.hours, d.minutes, d.day, d.month, d.outdoorTemp]);
        const labels = data.map(d => d.indoorTemp);

        const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

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
            labels: normalizedLabels,

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
        loss: tf.losses.meanSquaredError,
        matrices: ['mse'],
    });

    const batchSize = 50;
    const epochs = 100;

    return await model.fit(inputs, labels, {
        batchSize,
        epochs,
        shuffle: true,
        callbacks: tfvis.show.fitCallbacks(
            { name: 'Indoor Outdoor Model Training Performance' },
            [ 'loss', 'mse'],
            { height: 200, callbacks: ['onEpochEnd'] }
        )
    });
}
// end trainModel

// creating the test function for testing the trained model
function makePrediction(model, test) {
    const trueValues = [];
    const count = [];
    let cnt = 0;

    test.forEach(val => {
        trueValues.push(val.indoorTemp);
        count.push(cnt++);
    });

    const testNorms = convertToTensor(test);
    const {inputs, labelMax, labelMin} = testNorms;
    
    const preds = model.predict(inputs, {batchSize: 50});
    const unormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin);
    unormPreds.data().then(val => { 
        const temp = val;
        const all = [];
        
        for(let i = 0; i < test.length; i++) {
            const t = trueValues[i];
            const p = temp[i];
            const c = count[i];

            const mrg = {trueValue: t, predValue: p, counts: c};
            all.push(mrg);
        }
        displayPredicted(all);
        console.log(all);
    });
}
// end testModle

async function run() {
    // get the training data
    const ourData = await getData('model1data.json');

    // extract more input fields from the training data
    const expData = explodeData(ourData);
    console.log(expData);

    // visualize the data and observe relationships between features
    displayData(expData);
    displayScatter(expData);

    // splitting te data into training and testing
    const seperatData = splitting(expData, 80);
    const { train, test } = seperatData;
    console.log(test);

    // create the model
    const model = createModel();

    // visualize the model structure
    tfvis.show.modelSummary(
        { name: 'Model Summary' },
        model
        );

    // convert the training data to tensor
    const tensorData = convertToTensor(train);

    // get the inputs and labels from the converted tensor data
    const { inputs, labels } = tensorData;

    // train the model with the converted data
    await trainModel(model, inputs, labels);
    console.log('Training Done!!!');

    // save the model
    // await model.save('downloads://my-model');

    // making predictions for our model
    await makePrediction(model, test);
}

document.addEventListener('DOMContentLoaded', run);