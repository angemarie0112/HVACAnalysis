function generate_data(month, upper, lower, ssn, day) {
    const data = [];
    const mid = (upper + lower) / 2;

    for (let i = 1; i <= day; i++) {
        for (let j = 0; j < 24; j++) {
            const mnt = month;
            const dy = i;
            const hr = j;
            let temp = 0;
            
            if (hr <= 7) {
                temp = Math.floor(Math.random() * (mid - lower)) + lower;
            } else if (hr <= 17)  {
                temp = Math.floor(Math.random() * (upper - mid)) + mid;
            } else {
                temp = Math.floor(Math.random() * (mid - lower)) + lower;
            }

            const comf = setThermalComfort(ssn, temp);
            const pref = setThermalPreference(ssn, temp);

            const temp_data = {month: mnt, day: dy, hour: hr, season: ssn, temperature: temp, thermalComfort: comf, thermalPref: pref};
            data.push(temp_data);
        }
    }

    return data;
}

function setThermalComfort(dSeason, inTemp) {
    let comfort = 0;

    if (dSeason === 'Winter') {
      if (inTemp < 0 || inTemp > 33) {
          comfort = 1;
      } else if (inTemp >= 0 && inTemp < 10) {
          comfort = 2;
      } else if ((inTemp >= 10 && inTemp < 15) || (inTemp >= 28.5 && inTemp <= 33)) {
          comfort = 3;
      } else if ((inTemp >= 15 && inTemp < 19.5) || (inTemp >= 24 && inTemp <= 28.5)) {
          comfort = 4;
      } else if (inTemp >= 19.5 && inTemp < 21.5) {
          comfort = 5;
      } else if (inTemp >= 21.5 && inTemp <= 24) {
          comfort = 6;
      } else {
          comfort = 2;
      }

  } else if (dSeason === 'Summer') {
      if (inTemp < 10 || inTemp > 33) {
          comfort = 1;
      } else if (inTemp >= 10 && inTemp < 19) {
          comfort = 2;
      } else if ((inTemp >= 19 && inTemp < 22) || (inTemp >= 30 && inTemp <= 33)) {
          comfort = 3;
      } else if ((inTemp >= 22 && inTemp < 25) || (inTemp > 28 && inTemp < 30)) {
          comfort = 4;
      } else if (inTemp >= 25 && inTemp < 26) {
          comfort = 5;
      } else if (inTemp >= 26 && inTemp <= 28) {
          comfort = 6;
      } else {
          comfort = 2;
      }

  } else if (dSeason === 'Spring') {
      if (inTemp < 7 || inTemp > 33) {
          comfort = 1;
      } else if (inTemp >= 7 && inTemp < 14) {
          comfort = 2;
      } else if ((inTemp >= 14 && inTemp < 18) || (inTemp >= 29 && inTemp <= 32)) {
          comfort = 3;
      } else if ((inTemp >= 18 && inTemp < 22) || (inTemp > 28 && inTemp <= 30)) {
          comfort = 4;
      } else if (inTemp >= 22 && inTemp <= 23) {
          comfort = 5;
      } else if (inTemp >= 24 && inTemp <= 25) {
          comfort = 6;
      } else {
          comfort = 2;
      }

  } else if (dSeason === 'Autumn') {
      if (inTemp < 9 || inTemp > 33) {
          comfort = 1;
      } else if (inTemp >= 9 && inTemp < 19) {
          comfort = 2;
      } else if ((inTemp >= 19 && inTemp < 22) || (inTemp > 30 && inTemp <= 33)) {
          comfort = 3;
      } else if ((inTemp >= 22 && inTemp < 24) || (inTemp > 28 && inTemp <= 30)) {
          comfort = 4;
      } else if (inTemp >= 24 && inTemp <= 25) {
          comfort = 5;
      } else if (inTemp >= 26 && inTemp <= 27) {
          comfort = 6;
      } else {
          comfort = 2;
      }

  }

    return comfort;
} // end set thermalComfort

function sendData(data, url) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
    }

    xhttp.open('POST', url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("data=" + data);
}

function setThermalPreference(dSeason, temp) {
    let pref = '';

    switch (dSeason) {
        case 'Winter':
            if (temp <= 19) {
                pref = 'Warmer';
            } else if (temp >= 28) {
                pref = 'Cooler';
            } else {
                pref = 'No change'
            }
            break;
        case 'Summer':
            if (temp < 18) {
                pref = 'Warmer';
            } else if (temp > 28) {
                pref = 'Cooler';
            } else {
                pref = 'No change'
            }
            break;
        case 'Autumn':
            if (temp < 20) {
                pref = 'Warmer';
            } else if (temp >= 28) {
                pref = 'Cooler';
            } else {
                pref = 'No change'
            }
            break;
        default:
            if (temp < 18) {
                pref = 'Warmer';
            } else if (temp > 25) {
                pref = 'Cooler';
            } else {
                pref = 'No change'
            }
            break;
    }

    return pref;
}

function randomizeData(dataset) {
    const randomData = [];
    let randLength = 1;
    const dlength = dataset.length;

    const randomIndices = [];

    for (let i = 0; i < dlength; i++) {
        const rand = Math.floor(Math.random() * dlength);
        randomData.push(dataset[rand]);
    }

    return randomData;

}

function run() {
    const temperatureData = [];

    const june_data = generate_data(6, 20.6, 8.6, 'Winter', 30);
    const july_data = generate_data(7, 20.5, 7.1, 'Winter', 31);
    const august_data = generate_data(8, 25, 8.1, 'Winter', 31);

    const december_data = generate_data(12, 26.7, 17.5, 'Summer', 31);
    const january_data = generate_data(1, 40.4, 18.8, 'Summer', 31);
    const february_data = generate_data(2, 35.3, 19, 'Summer', 28);

    const march_data = generate_data(3, 33.2, 17.5, 'Autumn', 31);
    const april_data = generate_data(4, 40.9, 14.1, 'Autumn', 30);
    const may_data = generate_data(5, 35.6, 10.9, 'Autumn', 31);

    const september_data = generate_data(9, 20.5, 10.3, 'Spring', 30);
    const october_data = generate_data(10, 22.5, 13.1, 'Spring', 31);
    const november_data = generate_data(11, 24, 15.3, 'Spring', 30);

    june_data.forEach(val => {
        temperatureData.push(val);
    });
    july_data.forEach(val => {
        temperatureData.push(val);
    });
    august_data.forEach(val => {
        temperatureData.push(val);
    });
    september_data.forEach(val => {
        temperatureData.push(val);
    });
    october_data.forEach(val => {
        temperatureData.push(val);
    });
    november_data.forEach(val => {
        temperatureData.push(val);
    });
    december_data.forEach(val => {
        temperatureData.push(val);
    });
    january_data.forEach(val => {
        temperatureData.push(val);
    });
    february_data.forEach(val => {
        temperatureData.push(val);
    });
    march_data.forEach(val => {
        temperatureData.push(val);
    });
    april_data.forEach(val => {
        temperatureData.push(val);
    });
    may_data.forEach(val => {
        temperatureData.push(val);
    });

    // checking and correcting the dataset
    const cooler = [];
    const warmer = [];
    const noChange = [];

    const neData = randomizeData(temperatureData);
    console.log(neData);

    sendData(JSON.stringify(temperatureData), 'dataset.php');
}
document.addEventListener('DOMContentLoaded', run);