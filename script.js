'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
//LECTURE
//Using geolocation API
//LECTURE
//REFACTORING FOR PROJECT ARCHITECTURE

// map.on('click', function (mapEvent) {
//   form.classList.remove('hidden');
//   inputDistance.focus();
//   const { lat, lng } = mapEvent.latlng;
//   mapCoords = [lat, lng];
//   // const mp = new L.Marker([lat, lng]);
//   // mp.addTo(map)
//   //   .bindPopup(
//   //     L.popup({
//   //       maxWidth: 250,
//   //       maxHeight: 200,
//   //       autoClose: false,
//   //       keepInView: true,
//   //       closeOnClick: false,

//   //       className: 'running-popup',
//   //     })
//   //   )
//   //   .setPopupContent('<p>Hello world!<br />This is a nice popup.</p>')
//   //   .openPopup();

//   // .tooltip({ permanent: true });
// });

// actions.forEach(action => {
//   inputType.addEventListener(action, e =>
//     e.target.value !== 'running'
//       ? (inputElevation.parentElement.classList.remove('form__row--hidden'),
//         inputCadence.parentElement.classList.add('form__row--hidden'))
//       : (inputElevation.parentElement.classList.add('form__row--hidden'),
//         inputCadence.parentElement.classList.remove('form__row--hidden'))
//   );
// });
// inputType.addEventListener(, e => console.log(e.target.value));
const error = error => {
  const { code } = error;
  console.log(error);
  code === 1 && console.log('user denied GPS');
};
class Workout {
  #type;
  #distance;
  #duration;
  #date;
  constructor(type, distance, duration) {
    this.#type = type;
    this.#distance = Number(distance);
    this.#duration = Number(duration);
    this.#date = new Date();
  }
}
class Running extends Workout {
  #cadence;
  #pace;
  constructor(type, distance, duration, cadence) {
    super(type, distance, duration);
    this.#cadence = Number(cadence);
    this.#pace;
  }
}
class Cycling extends Workout {
  #elevation;
  #speed;
  constructor(type, distance, duration, elevation) {
    super(type, distance, duration);
    this.#elevation = Number(elevation);
    this.#speed;
  }
}
let newWorkout;
class App {
  #mapCoords;
  #map;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    ['change', 'load'].forEach(action => {
      inputType.addEventListener(action, this._toggleElevationField);
    });
  }

  _getPosition() {
    return navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(
          this._loadMap.bind(this),
          error,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        )
      : console.log('geo location not supported');
  }
  _loadMap(pos) {
    console.log(pos);
    const { latitude, longitude } = pos.coords;
    console.log('lat', latitude, '\n long', longitude);

    this.#mapCoords = [latitude, longitude];
    console.log(this.#mapCoords);
    this.#map = L.map('map').setView(this.#mapCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // L.marker(coords)
    //   .addTo(map)
    //   .bindPopup(
    //     L.popup({
    //       maxWidth: 250,
    //       maxHeight: 200,
    //       autoClose: false,
    //       keepInView: true,
    //       closeOnClick: false,

    //       className: 'running-popup',
    //     })
    //   )
    //   .setPopupContent('<p>Hello world!<br />This is a nice popup.</p>')
    //   .openPopup();
    // L.tooltip({ permanent: true });
    this.#map.on('click', mapEvent => this._showForm.call(this, mapEvent));
  }
  _showForm(mapEvent) {
    form.classList.remove('hidden');
    inputDistance.focus();
    const { lat, lng } = mapEvent.latlng;
    this.#mapCoords = [lat, lng];
    // const mp = new L.Marker([lat, lng]);
    // mp.addTo(map)
    //   .bindPopup(
    //     L.popup({
    //       maxWidth: 250,
    //       maxHeight: 200,
    //       autoClose: false,
    //       keepInView: true,
    //       closeOnClick: false,

    //       className: 'running-popup',
    //     })
    //   )
    //   .setPopupContent('<p>Hello world!<br />This is a nice popup.</p>')
    //   .openPopup();

    // .tooltip({ permanent: true });
  }
  _toggleElevationField() {
    this.value !== 'running'
      ? (inputElevation.parentElement.classList.remove('form__row--hidden'),
        inputCadence.parentElement.classList.add('form__row--hidden'))
      : (inputElevation.parentElement.classList.add('form__row--hidden'),
        inputCadence.parentElement.classList.remove('form__row--hidden'));
  }
  _newWorkout(e) {
    e.preventDefault();

    const inputs = [...e.target.querySelectorAll('.form__input')];
    let inputsValues = {};
    inputs.forEach(input => {
      const propName = [input['className'].split(' ')[1].split('-').slice(-1)];
      inputsValues = {
        ...inputsValues,
        [propName]: input.value,
      };
    });
    const { type, distance, duration, cadence, elevation } = inputsValues;
    newWorkout =
      type === 'running'
        ? new Running(type, distance, duration, cadence)
        : new Cycling(type, distance, duration, elevation);
    // console.log(mapCoords);
    // console.log(newWorkout);
    var myIcon = L.icon({
      iconUrl: 'icon.png',
      iconSize: [38, 38],
    });
    const mp = new L.Marker(this.#mapCoords, { icon: myIcon });
    mp.addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 200,
          autoClose: false,
          keepInView: true,
          closeOnClick: false,

          className: `${newWorkout.type}`,
        })
      )
      .setPopupContent('<p>Hello world!<br />This is a nice popup.</p>')
      .openPopup();
    e.target.reset();
    form.classList.add('hidden');
  }
}
//REFACTORING FOR PROJECT ARCHITECTURE
//LECTURE

// navigator.geolocation
//   ? navigator.geolocation.getCurrentPosition(success, error, {
//       enableHighAccuracy: true,
//       timeout: 5000,
//       maximumAge: 0,
//     })
//   : console.log('geo location not supported');
//Using geolocation API
const app = new App();

//LECTURE

// form.addEventListener('submit', e => {
//   e.preventDefault();

//   const inputs = [...e.target.querySelectorAll('.form__input')];
//   let inputsValues = {};
//   inputs.forEach(input => {
//     const propName = [input['className'].split(' ')[1].split('-').slice(-1)];
//     inputsValues = {
//       ...inputsValues,
//       [propName]: input.value,
//     };
//   });
//   const { type, distance, duration, cadence, elevation } = inputsValues;
//   newWorkout =
//     type === 'running'
//       ? new Running(type, distance, duration, cadence)
//       : new Cycling(type, distance, duration, elevation);
//   console.log(mapCoords);
//   console.log(newWorkout);
//   var myIcon = L.icon({
//     iconUrl: 'icon.png',
//     iconSize: [38, 38],
//   });
//   const mp = new L.Marker(mapCoords, { icon: myIcon });
//   mp.addTo(map)
//     .bindPopup(
//       L.popup({
//         maxWidth: 250,
//         maxHeight: 200,
//         autoClose: false,
//         keepInView: true,
//         closeOnClick: false,

//         className: `${newWorkout.type}`,
//       })
//     )
//     .setPopupContent('<p>Hello world!<br />This is a nice popup.</p>')
//     .openPopup();
//   e.target.reset();
//   form.classList.add('hidden');
// });
