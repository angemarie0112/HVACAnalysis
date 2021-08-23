// extracting the data for training the model
async function getData(linkExtension) {
    const hvacRqst = await 
    fetch('datasets/'+linkExtension)
    const hvac2Data = await hvacRqst.json();
    const finalData = hvac2Data.map(hvac => ({
        comfort: Number(hvac.thermalComfort),
        indoorTemp: Number(hvac.indoorTemperature),
        country: hvac.country,
        season: seasonChange(hvac.season),
        thermalPreference: pref(hvac.thermalPreference),
        cStrategy: coolStrat(hvac.coolingStrategy),
    }));
    console.log(finalData);
    const cleanedData = missingValues(finalData);

    return cleanedData;
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

    if(preference === "warmer") {
        g = 2;
    }
    if(preference === "cooler") {
        g = 3;
    }
    return g;
}

// converting the cooling strategies to integers
function coolStrat(strategy) {
    let v = 1;

    if(strategy === "Air Conditioned") {
        v = 2;
    }
    if(strategy === "Mixed mode") {
        v = 3;
    }
    return v;
}

function missingValues (data) {
    // get the indoor temperature thermalComfort into two seperate arrays
    const intmp = [];

    data.forEach(val => {
        if(isNaN(val.indoorTemp)) {
            intmp.push(0);
        } else {
            intmp.push(val.indoorTemp);
        }
    })

    // calculate the indoor temperature mean
    const tmpMean = jStat.mean(intmp);

    // replace missing values with the mean
    data.forEach(value => {
        if (isNaN(value.indoorTemp)) {
            value.indoorTemp = tmpMean;
        }
        if (isNaN(value.comfort)) {
            value.comfort = 3;
        }   
    });

    // returned the cleaned data with any missing values
    return data;
}
// end missingData Treatement

// plotting the graph of the ******
function displayData(plotdata) {
    const temp = [];
    const ranges = [];

    plotdata.forEach(val => {
        temp.push(val.indoorTemp);
    })

    // get the min and max values of the temperature
    const maxTemp = jStat.max(temp);
    const minTemp = jStat.min(temp);

    const range = maxTemp - minTemp;
    const noOfClasses = 5
    const classSize = Math.round(range/noOfClasses);

    let tmp = Math.round(minTemp/1);

    // get the ranges
    for(let i = 0; i < 5; i++) {
        tmp += classSize;
        ranges.push(tmp);
    }

    const range1 = [0,0,0,0];
    const range2 = [0,0,0,0];
    const range3 = [0,0,0,0];
    const range4 = [0,0,0,0];
    const range5 = [0,0,0,0];

    plotdata.forEach(val => {
        if(val.indoorTemp <= ranges[0]) {
            switch(val.season){
                case 1: 
                    range1[0] += 1; 
                    break;
                case 2: 
                    range1[1] += 1;
                    break;
                case 3: 
                    range1[2] += 1;
                    break;
                case 4: 
                    range1[3] += 1;
                    break;
            }
        } else if(val.indoorTemp <= ranges[1]) {
            switch(val.season){
                case 1: 
                    range2[0]++; 
                    break;
                case 2: 
                    range2[1]++;
                    break;
                case 3: 
                    range2[2]++;
                    break;
                case 4: 
                    range2[3]++;
                    break;
            }
        } else if(val.indoorTemp <= ranges[2]) {
            switch(val.season) {
                case 1: 
                    range3[0]++; 
                    break;
                case 2: 
                    range3[1]++;
                    break;
                case 3: 
                    range3[2]++;
                    break;
                case 4: 
                    range3[3]++;
                    break;
            }
        } else if(val.indoorTemp <= ranges[3]) {
            switch(val.season) {
                case 1: range4[0]++; 
                break;
                case 2: range4[1]++;
                break;
                case 3: range4[2]++;
                break;
                case 4: range4[3]++;
                break;
            }
        } else {
            switch(val.season) {
                case 1: range5[0]++; 
                break;
                case 2: range5[1]++;
                break;
                case 3: range5[2]++;
                break;
                case 4: range5[3]++;
                break;
            }
        }
    });   

    const data = {
        values: [range1, range2, range3, range4, range5],
        xTickLabels: ['Temp <= '+ranges[0], 'Temp <= '+ranges[1], 'Temp <= '+ranges[2], 'Temp <= '+ranges[3], 'Temp <= '+ranges[4]],
        yTickLabels: ['Summer', 'Winter', 'Spring', 'Autumn'],
      }
      
      // Render to visor
      const surface = { name: 'Season VS Indoor Temperature Changes', tab: 'Charts' };
      tfvis.render.heatmap(surface, data);
  }
  // end display data

// plotting the graph of the regression, upper and lower bound of the ci band
function displayComfort(plotdata) {
    const temp = [];
    const ranges = [];

    // extract the temperature from the plot data
    plotdata.forEach(val => {
        temp.push(val.indoorTemp);
    })

    // get the min and max values of the temperature
    const maxTemp = jStat.max(temp);
    const minTemp = jStat.min(temp);

    // compute the range for the temperature distribution and class size
    const range = maxTemp - minTemp;
    const noOfClasses = 5
    const classSize = Math.round(range/noOfClasses);

    let tmp = Math.round(minTemp/1);

    // get the ranges
    for(let i = 0; i < 5; i++) {
        tmp += classSize;
        ranges.push(tmp);
    }

    const range1 = [0,0,0,0,0,0];
    const range2 = [0,0,0,0,0,0];
    const range3 = [0,0,0,0,0,0];
    const range4 = [0,0,0,0,0,0];
    const range5 = [0,0,0,0,0,0];

    // counting the number of records for each range
    plotdata.forEach(val => {
        if(val.indoorTemp <= ranges[0]) {
            switch(val.thermalComfort){
                case 1: range1[0] += 1; 
                    break;
                case 2: range1[1] += 1;
                    break;
                case 3: range1[2] += 1;
                    break;
                case 4: range1[3] += 1;
                    break;
                case 5: range1[4] += 1;
                    break;
                case 6: range1[5] += 1;
                    break;
            }
        } else if(val.indoorTemp <= ranges[1]) {
            switch(val.thermalComfort){
                case 1: range2[0] += 1; 
                    break;
                case 2: range2[1] =+ 1;
                    break;
                case 3: range2[2] += 1;
                    break;
                case 4: range2[3] += 1;
                    break;
                case 5: range2[4] += 1;
                    break;
                case 6: range2[5] += 1;
                    break;
            }
        } else if(val.indoorTemp <= ranges[2]) {
            switch(val.comfort) {
                case 1: range3[0] += 1; 
                break;
                case 2: range3[1] += 1;
                break;
                case 3: range3[2] += 1;
                break;
                case 4: range3[3] += 1;
                break;
                case 5: range3[4] += 1;
                break;
                case 6: range3[5] += 1;
                break;
            }
        } else if(val.indoorTemp <= ranges[3]) {
            switch(val.comfort) {
                case 1: range4[0] += 1; 
                break;
                case 2: range4[1] += 1;
                break;
                case 3: range4[2] += 1;
                break;
                case 4: range4[3] += 1;
                break;
                case 5: range4[4] += 1;
                break;
                case 6: range4[5] += 1;
                break;
            }
        } else {
            switch(val.comfort) {
                case 1: range5[0] += 1; 
                break;
                case 2: range5[1] += 1;
                break;
                case 3: range5[2] += 1;
                break;
                case 4: range5[3] += 1;
                break;
                case 5: range5[4] += 1;
                break;
                case 6: range5[5] += 1;
                break;
            }
        }
    });   

    const data = {
        values: [range1, range2, range3, range4, range5],
        xTickLabels: ['Temp <= '+ranges[0], 'Temp <= '+ranges[1], 'Temp <= '+ranges[2], 'Temp <= '+ranges[3], 'Temp <= '+ranges[4]],
        yTickLabels: ['comfort1', 'comfort2', 'comfort3', 'comfort4', 'comfort5', 'comfort6'],
      }
      
      // Render to visor
      const surface = { name: 'Thermal Comfort VS Indoor Temperature Changes', tab: 'Confort' };
      tfvis.render.heatmap(surface, data);
  }
  // end display data

// plotting the graph of the regression, upper and lower bound of the ci band
function displayPreferences(plotdata) {
    const temp = [];
    const ranges = [];

    // extract the temperature from the plot data
    plotdata.forEach(val => {
        temp.push(val.indoorTemp);
    })

    // get the min and max values of the temperature
    const maxTemp = jStat.max(temp);
    const minTemp = jStat.min(temp);

    // compute the range for the temperature distribution and class size
    const range = maxTemp - minTemp;
    const noOfClasses = 5
    const classSize = Math.round(range/noOfClasses);

    let tmp = Math.round(minTemp/1);

    // get the ranges
    for(let i = 0; i < 5; i++) {
        tmp += classSize;
        ranges.push(tmp);
    }

    const range1 = [0,0,0];
    const range2 = [0,0,0];
    const range3 = [0,0,0];
    const range4 = [0,0,0];
    const range5 = [0,0,0];

    // counting the number of records for each range
    plotdata.forEach(val => {
        if(val.season == 2) {
            if(val.indoorTemp <= ranges[0]) {
                switch(val.thermalPreference){
                    case 0: range1[0] += 1; 
                        break;
                    case 1: range1[1] += 1;
                        break;
                    case 2: range1[2] += 1;
                        break;
                }
            } else if(val.indoorTemp <= ranges[1]) {
                switch(val.thermalPreference){
                    case 0: range2[0] += 1; 
                        break;
                    case 1: range2[1] =+ 1;
                        break;
                    case 2: range2[2] += 1;
                        break;
                }
            } else if(val.indoorTemp <= ranges[2]) {
                switch(val.thermalPreference) {
                    case 0: range3[0] += 1; 
                    break;
                    case 1: range3[1] += 1;
                    break;
                    case 2: range3[2] += 1;
                    break;
                }
            } else if(val.indoorTemp <= ranges[3]) {
                switch(val.thermalPreference) {
                    case 0: range4[0] += 1; 
                    break;
                    case 1: range4[1] += 1;
                    break;
                    case 2: range4[2] += 1;
                    break;
                }
            } else {
                switch(val.thermalPreference) {
                    case 0: range5[0] += 1; 
                    break;
                    case 1: range5[1] += 1;
                    break;
                    case 2: range5[2] += 1;
                    break;
                }
            }
        }
    });   

    const data = [
        { index: 0, value: range1[0] },
        { index: 1, value: range2[0] },
        { index: 2, value: range3[0] },
        { index: 3, value: range4[0] },
        { index: 4, value: range5[0] },
       ];
      
      // Render to visor
      const surface = { name: 'No Change Preferencs with Temperature Variations for Winter', tab: 'Pref' };
      tfvis.render.barchart(surface, data);
  }
// end display data


// plotting the graph of the thermal Preferences 
function displayTable(plotdata) {
    const temp = [];
    const ranges = [];

    // extract the temperature from the plot data
    plotdata.forEach(val => {
        temp.push(val.indoorTemp);
    })

    // get the min and max values of the temperature
    const maxTemp = jStat.max(temp);
    const minTemp = jStat.min(temp);

    // compute the range for the temperature distribution and class size
    const range = maxTemp - minTemp;
    const noOfClasses = 5
    const classSize = Math.round(range/noOfClasses);

    let tmp = Math.round(minTemp/1);

    // get the ranges
    for(let i = 0; i < 5; i++) {
        tmp += classSize;
        ranges.push(tmp);
    }

    const range1 = [0,0,0];
    const range2 = [0,0,0];
    const range3 = [0,0,0];
    const range4 = [0,0,0];
    const range5 = [0,0,0];

    // counting the number of records for each range
    plotdata.forEach(val => {
        if (val.season == 4) {
            if(val.indoorTemp <= ranges[0]) {
                switch(val.thermalPreference){
                    case 0: range1[0] += 1; 
                        break;
                    case 1: range1[1] += 1;
                        break;
                    case 2: range1[2] += 1;
                        break;
                }
            } else if(val.indoorTemp <= ranges[1]) {
                switch(val.thermalPreference){
                    case 0: range2[0] += 1; 
                        break;
                    case 1: range2[1] =+ 1;
                        break;
                    case 2: range2[2] += 1;
                        break;
                }
            } else if(val.indoorTemp <= ranges[2]) {
                switch(val.thermalPreference) {
                    case 0: range3[0] += 1; 
                    break;
                    case 1: range3[1] += 1;
                    break;
                    case 2: range3[2] += 1;
                    break;
                }
            } else if(val.indoorTemp <= ranges[3]) {
                switch(val.thermalPreference) {
                    case 0: range4[0] += 1; 
                    break;
                    case 1: range4[1] += 1;
                    break;
                    case 2: range4[2] += 1;
                    break;
                }
            } else {
                switch(val.thermalPreference) {
                    case 0: range5[0] += 1; 
                    break;
                    case 1: range5[1] += 1;
                    break;
                    case 2: range5[2] += 1;
                    break;
                }
            }
        }
    });  

    const headers = [
        'Range',
        'No Change',
        'Warmer',
        'Cooler',        
       ];
       
       const values = [
        ['Temp <= '+ranges[0], range1[0], range1[1], range1[2]],
        ['Temp <= '+ranges[1], range2[0], range2[1], range2[2]],
        ['Temp <= '+ranges[2], range3[0], range3[1], range3[2]],
        ['Temp <= '+ranges[3], range4[0], range4[1], range4[2]],
        ['Temp <= '+ranges[4], range5[0], range5[1], range5[2]],
       ];
       
       const surface = { name: 'Thermal Preferences at Different Temperture Ranges in Autumn', tab: 'Pref' };
       tfvis.render.table(surface, { headers, values });
  }
// end display data

// creating the topology of the model
function createModel() {
    // creating a sequential model
    const model = tf.sequential();

    // adding input layer
    model.add(tf.layers.dense({
        inputShape: [3],
        units: 50,
        useBias: true,
        activation: 'relu'
    }));

    // adding hidden layers
    model.add(tf.layers.dense({
        units: 30,
        useBias: true,
        activation: 'relu'
    }))
    model.add(tf.layers.dense({
        units: 20,
        useBias: true,
        activation: 'tanh'
    }))
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
        const inputs = data.map(d => [d.indoorTemp, d.season, d.comfort]);
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

// compute the accuracy of the model at the end of the traning
async function evaluateModel(model, inputs, labels) {
  const result = await model.evaluate(inputs, labels, {batchSize: 50});
  console.log('Accuracy is:')
  result[1].print();
}

// seperate the data for the three countries (USA, India, and Australia) in the dataset
function seperateCountries(countryData) {
    // create an empty array for each country
    const usaData = [];
    const indiaData = [];
    const australiaData = [];

    // load the country arrays using the country data
    countryData.forEach(value => {
        if(value.country == 'USA') {
            usaData.push(value);
        }
        if(value.country == 'India') {
            indiaData.push(value);
        }
        if(value.country == 'Australia') {
            australiaData.push(value);
        }
    })

    // return the loaded country arrays
    return {
        usa: usaData,
        india: indiaData,
        australia: australiaData
    }
}
// end seperate country

function separateSeasons(data) {

    //create an empty array for each season.
    const summ = [];
    const autu = [];
    const wint = [];
    const spri = [];
 
    data.forEach(value => {
        if(value.season == 1){
            summ.push(value)
        }
        if(value.season == 4){
            autu.push(value)
        }
        if(value.season == 2){
            wint.push(value)
        }
        if(value.season == 3){
            spri.push(value)
        }
    })

    return{
        summer: summ,
        autumn: autu,
        winter: wint,
        spring: spri
    }
}
// end separateSeasons

// displaying the graph of the temperature changes of each country
function displayCountryTemp(countryData, countryName) {
    // seperating the seasons for each country
    const countrySeason = separateSeasons(countryData);
    const {summer, autumn, winter, spring} = countrySeason;

    const summ = addOccurence(summer);
    const wint = addOccurence(winter);
    const spri = addOccurence(spring);
    const autu = addOccurence(autumn);
    
    const Summer = summ.map(d => ({
        x: d.occurance,
        y: d.indoorTemp,
      }));
  
      const Winter = wint.map(e => ({
          x: e.occurance,
          y: e.indoorTemp,
      }));
  
      const Spring = spri.map(f => ({
          x: f.occurance,
          y: f.indoorTemp,
      })); 

      const Autumn = autu.map(f => ({
        x: f.occurance,
        y: f.indoorTemp,
    }));
  
      const series = ['Summer', 'Winter', 'Spring', 'Autumn'];
      const data = { values: [Summer, Winter, Spring, Autumn], series }
  
      const surface = { name: 'Temperature change per season for '+countryName, tab: 'country' };
  
      tfvis.render.linechart(surface, data);

}

// adding a time/occurance variable to our dataset
function addOccurence(data) {
    // seperate the data into its various components
    const comft = [];
    const intmp = [];
    const cnty = [];
    const ssn = [];
    const pref = [];
    const cs = [];
    const occ = [];
    let count = 0;

    // create the marge data
    const marge = [];

    // load the data into their respective arrays
    data.forEach(vals => {
        comft.push(vals.comfort);
        intmp.push(vals.indoorTemp);
        cnty.push(vals.country);
        ssn.push(vals.season);
        pref.push(vals.thermalPreference);
        cs.push(vals.cStrategy);
        occ.push(count++);
    })

    // merge the seperated arrays into one dataset again
    for (let i = 0; i < data.length; i++) {
        const cft = comft[i];
        const itmp = intmp[i];
        const cn = cnty[i];
        const ss = ssn[i];
        const prf = pref[i];
        const c = cs[i];
        const oc = occ[i];

        const mrg = {
            comfort: cft,
            indoorTemp: itmp,
            country: cn,
            season: ss,
            thermalPreference: prf,
            cStrategy: c,
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

function extractComfort(data) {
    const comfort1 = [];
    const comfort2 = [];
    const comfort3 = [];
    const comfort4 = [];
    const comfort5 = [];
    const comfort6 = [];

    data.forEach(val => {
        if(val.country == 'USA') {
            if(val.season == 1) {
                    switch(val.comfort) {
                    case 1:
                        comfort1.push(val.indoorTemp);
                        break;
                    case 2:
                        comfort2.push(val.indoorTemp);
                        break;
                    case 3:
                        comfort3.push(val.indoorTemp);
                        break;
                    case 4:
                        comfort4.push(val.indoorTemp);
                        break;
                    case 5:
                        comfort5.push(val.indoorTemp);
                        break;
                    case 6:
                        comfort6.push(val.indoorTemp);
                        break;
                    default:
                        break;
                }  
            }
        }
        
    })

    const modeComfort1 = jStat.mode(comfort1);
    const modeComfort2 = jStat.mode(comfort2);
    const modeComfort3 = jStat.mode(comfort3);
    const modeComfort4 = jStat.mode(comfort4);
    const modeComfort5 = jStat.mode(comfort5);
    const modeComfort6 = jStat.mode(comfort6);

    console.log(modeComfort1);
    console.log(modeComfort2);
    console.log(modeComfort3);
    console.log(modeComfort4);
    console.log(modeComfort5);
    console.log(modeComfort6);
}

async function run() {
    const data = await getData('Final.json');

    // extracting the comfort levels
    extractComfort(data);

    displayData(data);
    displayComfort(data);

    displayTable(data);
    displayPreferences(data);

    // seperating the data for each country in our dataset
    const countryData = seperateCountries(data);
    const {usa, india, australia} = countryData;

    // display the temperature changes for each country according to the seasons
    displayCountryTemp(usa, 'USA');
    displayCountryTemp(india, 'India');
    displayCountryTemp(australia, 'Australia');

    // add occurence to the main dataset
    // const mainData = addOccurence(data);
    const mainData = addOccurence(india);
    console.log(mainData);

    // seperating the data into training and test set
    const seperateData = trainTest(mainData, 70);
    const {training, testing} = seperateData;
    console.log(training, testing);``

    // create the model
    const model = createModel();

    // converting the training data to tensors
    const tensorData = convertToTensor(training);
    const {inputs, labels} = tensorData;

    // train the model
    await trainModel(model, inputs, labels);
    console.log('Done training')

    // save the model
    // await model.save('downloads://my-model');

    // test the model with the test data
    const testPreds = await makePrediction(model, testing);

    // display the confusion matrix of the test result
    displayConfucion(testPreds);

    // valuating the model
    await evaluateModel(model, inputs, labels);
}

document.addEventListener('DOMContentLoaded', run);