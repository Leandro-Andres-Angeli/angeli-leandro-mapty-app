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

const error = error => {
  const { code } = error;
  console.log(error);
  code === 1 && console.log('user denied GPS');
};
class Workout {
  //CAN'T JSON.STRINGIFY PRIVATE FIELDS
  type;
  distance;
  duration;
  id;
  date = new Date();
  coords;
  //CAN'T JSON.STRINGIFY PRIVATE FIELDS
  constructor(type, distance, duration, coords) {
    this.type = type;
    this.distance = Number(distance);
    this.duration = Number(duration);
    // this.id = Math.trunc(this.date.getMilliseconds() * Math.random() * 10000);
    this.id = Date.now();

    this.coords = coords;
  }

  get getType() {
    return this.type;
  }
  get getDate() {
    return this.date;
  }
  get getDistance() {
    return this.distance;
  }
  get getDuration() {
    return this.duration;
  }
}
class Running extends Workout {
  cadence;
  pace;
  constructor(type, distance, duration, cadence, coords) {
    super(type, distance, duration, coords);
    this.cadence = Number(cadence);
    this.calcPace();
  }
  calcPace() {
    console.log(this.getDuration);
    return (this.pace = this.getDuration / this.getDistance);
  }
}
class Cycling extends Workout {
  elevantionGain;
  speed;
  constructor(type, distance, duration, elevationGain, coords) {
    super(type, distance, duration, coords);
    this.elevantionGain = Number(elevationGain);

    this.calcSpeed();
  }
  calcSpeed() {
    return (this.speed = this.getDistance / (this.getDuration / 60));
  }
}

class App {
  #mapCoords;
  #workoutsList;
  #map;
  constructor() {
    // (() => {

    // })();
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    ['change'].forEach(action => {
      inputType.addEventListener(action, this._toggleElevationField);
    });
    this._getLocalStorage();
    this._setLocalStorage();

    // this.#workoutsList = JSON.parse(localStorage.getItem('workouts'));
    // (!localStorage.getItem('workouts') &&
    //   localStorage.setItem('workouts', JSON.stringify([]))) ||
    // localStorage.getItem('workouts', JSON.stringify([]));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }
  _moveToPopup(e) {
    if (e.target.closest('li') !== null) {
      // console.log(
      //   this._getWorkouts().find(
      //     workout => workout.id == e.target.closest('li').dataset.id
      //   )
      // );
      const { coords } = this._getWorkouts().find(
        workout => workout.id == e.target.closest('li').dataset.id
      );
      this.#map.setView(coords, 30, { pan: { animate: true, duration: 2 } });
      console.log('el coords', coords);
    }
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
  _getWorkouts() {
    return this.#workoutsList;
  }
  _saveWorkout(workout) {
    console.log(this);
    this.#workoutsList = [...this._getWorkouts(), workout];

    localStorage.setItem('workouts', this._getWorkouts());
  }
  get getMapCoords() {
    return this.#mapCoords;
  }
  _loadMap(pos) {
    console.log(pos);
    const { latitude, longitude } = pos.coords;

    this.#mapCoords = [latitude, longitude];

    this.#map = L.map('map').setView(this.#mapCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', mapEvent => this._showForm.call(this, mapEvent));
    // let markers = [];
    // for (const workout of this._getWorkouts()) {
    //   markers = [...markers, this._renderWorkoutMarker(workout)];
    // }
    this._getWorkouts()?.forEach(workout => this._renderWorkoutMarker(workout));
  }
  _showForm(mapEvent) {
    form.classList.remove('hidden');
    inputDistance.focus();
    const { lat, lng } = mapEvent.latlng;
    this.#mapCoords = [lat, lng];
  }
  _toggleElevationField() {
    document.querySelector('select').value !== 'running'
      ? (inputElevation.parentElement.classList.remove('form__row--hidden'),
        inputCadence.parentElement.classList.add('form__row--hidden'))
      : (inputElevation.parentElement.classList.add('form__row--hidden'),
        inputCadence.parentElement.classList.remove('form__row--hidden'));
  }
  _renderWorkoutMarker(newWorkout) {
    var myIcon = L.icon({
      iconUrl: 'icon.png',
      iconSize: [38, 38],
    });
    const mp = new L.Marker(newWorkout.coords, { icon: myIcon });
    mp.addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 200,
          autoClose: false,
          keepInView: true,
          closeOnClick: true,

          className: `${newWorkout.type}-popup `,
        })
      )
      .setPopupContent(
        `${(newWorkout.type === 'running' && '🏃‍♂️') || '🚴‍♀️'}  ${
          newWorkout.type.slice(0, 1).toUpperCase() + newWorkout.type.slice(1)
        } on
        ${new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
        }).format(new Date(newWorkout.date))}
      `
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    const html = ` <li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
    <h2 class="workout__title">  ${
      workout.type.slice(0, 1).toUpperCase() + workout.type.slice(1)
    } on ${new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(workout.getDate)} 
 </h2>
    <div class="workout__details">
      <span class="workout__icon"> ${
        (workout.type === 'running' && '🏃‍♂️') || '🚴‍♀️'
      } </span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">${
        (workout.type === 'running' && 'min') || 'km/h'
      }</span>
    </div>
    <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${
      // (workout.type === 'running' &&)
      workout.pace?.toFixed(2) || workout.speed?.toFixed(2)
    }</span>
    <span class="workout__unit"> ${
      (workout.type === 'running' && 'min/km') || 'km/h'
    }</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">
    ${(workout.type === 'running' && '🦶') || '⛰'}
    
    </span>
    <span class="workout__value"> ${
      workout.cadence?.toFixed(2) || workout.elevantionGain?.toFixed(2)
    }</span>
    <span class="workout__unit">m</span>
  </div>
    </li>`;
    document.querySelector('.workouts').insertAdjacentHTML('beforeend', html);
  }
  _renderWorkouts() {
    this._getWorkouts().length > 0 &&
      this._getWorkouts().forEach(workout => {
        this._renderWorkout(workout);
        // var myIcon = L.icon({
        //   iconUrl: 'icon.png',
        //   iconSize: [38, 38],
        // });
        // const mp = new L.Marker(workout.coords, { icon: myIcon });
        // mp.addTo(this.#map)
        //   .bindPopup(
        //     L.popup({
        //       maxWidth: 250,
        //       maxHeight: 200,
        //       autoClose: false,
        //       keepInView: true,
        //       closeOnClick: true,

        //       className: `${workout.type}-popup }`,
        //     })
        //   )
        //   .setPopupContent(
        //     `${(workout.getType === 'running' && '🏃‍♂️') || '🚴‍♀️'}  ${
        //       workout.getType.slice(0, 1).toUpperCase() +
        //       workout.getType.slice(1)
        //     } on ${new Intl.DateTimeFormat('en-US', {
        //       year: 'numeric',
        //       month: 'long',
        //     }).format(workout.getDate)} `
        //   )
        //   .openPopup();
      });
  }
  _hideform(form) {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => {
        console.log(inp);
        return Number.isFinite(inp) && Number(inp) > 0;
      });
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

    const newWorkout =
      type === 'running'
        ? !validInputs(Number(distance), Number(duration), Number(cadence))
          ? alert('NOT VALID DATA ❌ .DATA SUPPORTED : ONLY POSITIVE NUMBERS')
          : new Running(type, distance, duration, cadence, this.#mapCoords)
        : !validInputs(Number(distance), Number(duration), Number(elevation))
        ? alert('NOT VALID DATA ❌ .DATA SUPPORTED : ONLY POSITIVE NUMBERS')
        : new Cycling(type, distance, duration, elevation, this.#mapCoords);

    this._saveWorkout(newWorkout);

    if (newWorkout) {
      this._renderWorkoutMarker(newWorkout);
      this._hideform(form);
    }
    e.target.reset();
    this._toggleElevationField();
    localStorage.setItem('workouts', JSON.stringify(this._getWorkouts()));
    this._renderWorkout(newWorkout);
  }
  _setLocalStorage() {
    const data = this.#workoutsList;
    localStorage.setItem('workouts', JSON.stringify(data) || '[]');
  }
  _getLocalStorage() {
    const data = localStorage.getItem('workouts');
    if (!data) return;
    this.#workoutsList = JSON.parse(data);
    this._renderWorkouts();
  }
}
//REFACTORING FOR PROJECT ARCHITECTURE
//LECTURE

const app = new App();

//LECTURE
