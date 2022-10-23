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
const success = pos => {
  console.log(pos);
  const { latitude, longitude } = pos.coords;
  console.log('lat', latitude, '\n long', longitude);
  const coords = [latitude, longitude];
  const map = L.map('map').setView(coords, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker(coords)
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        maxHeight: 200,
        autoClose: false,
        keepInView: true,
        closeOnClick: false,

        className: 'running-popup',
      })
    )
    .setPopupContent('<p>Hello world!<br />This is a nice popup.</p>')
    .openPopup();
  L.tooltip({ permanent: true });
  let mapCoords = 'data';
  map.on('click', function (mapEvent) {
    form.classList.remove('hidden');

    const { lat, lng } = mapEvent.latlng;
    mapCoords = [lat, lng];
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
  });
  class Workout {
    constructor(type, distance, duration, cadence, elevationGain) {
      this.type = type;
      this.distance = distance;
      this.duration = duration;
      this.cadence = cadence;
      this.elevationGain = elevationGain;
    }
  }
  const actions = ['change', 'load'];
  actions.forEach(action => {
    inputType.addEventListener(action, e =>
      e.target.value !== 'running'
        ? (inputElevation.parentElement.classList.remove('form__row--hidden'),
          inputCadence.parentElement.classList.add('form__row--hidden'))
        : (inputElevation.parentElement.classList.add('form__row--hidden'),
          inputCadence.parentElement.classList.remove('form__row--hidden'))
    );
  });
  // inputType.addEventListener(, e => console.log(e.target.value));
  form.addEventListener('submit', e => {
    e.preventDefault();

    const inputs = [...e.target.querySelectorAll('.form__input')];
    let inputsValues = [];
    inputs.forEach(input => {
      inputsValues = [...inputsValues, input.value];
    });
    const newWorkout = new Workout();
    console.log(inputsValues);
    console.log(mapCoords);
  });
};
const error = error => {
  const { code } = error;
  console.log(error);
  code === 1 && console.log('user denied GPS');
};
navigator.geolocation
  ? navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    })
  : console.log('geo location not supported');
//Using geolocation API
//LECTURE
