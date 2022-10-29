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
const btnReset = document.querySelector('.btn-reset');
//   <h2 class="workout__title">  ${
//     workout.type.slice(0, 1).toUpperCase() + workoutToEditData.type.slice(1)
//   } on ${new Intl.DateTimeFormat('en-US', {
//     year: 'numeric',
//     month: 'long',
//   }).format(workoutToEditData.getDate)}
// </h2>
//   <div class="workout__details">
//     <span class="workout__icon"> ${
//       (workoutToEditData.type === 'running' && '🏃‍♂️') || '🚴‍♀️'
//     } </span>
//     <span class="workout__value">${workoutToEditData.distance}</span>
//     <span class="workout__unit">km</span>
//   </div>
//   <div class="workout__details">
//     <span class="workout__icon">⏱</span>
//     <span class="workout__value">${workoutToEditData.duration}</span>
//     <span class="workout__unit">${
//       (workoutToEditData.type === 'running' && 'min') || 'km/h'
//     }</span>
//   </div>
//   <div class="workout__details">
//   <span class="workout__icon">⚡️</span>
//   <span class="workout__value">${
//     // (workout.type === 'running' &&)
//     workoutToEditData.pace?.toFixed(2) || workoutToEditData.speed?.toFixed(2)
//   }</span>
//   <span class="workout__unit"> ${
//     (workoutToEditData.type === 'running' && 'min/km') || 'km/h'
//   }</span>
// </div>
// <div class="workout__details">
//   <span class="workout__icon">
//   ${(workoutToEditData.type === 'running' && '🦶') || '⛰'}

//   </span>
//   <span class="workout__value"> ${
//     workoutToEditData.cadence?.toFixed(2) ||
//     workoutToEditData.elevantionGain?.toFixed(2)
//   }</span>
//   <span class="workout__unit">m</span>

// </div>
// <div class='btn_container  hidden removed'>
// <button class="btn edit__btn"><i class="fa fa-pencil-square-o" aria-hidden="true"></i>

// </button>
// <button class="btn delete__btn "><i class="fa fa-trash-o" aria-hidden="true"></i>
// </button>
// <button class="btn cancel__btn ">
// <i class="fa fa-times" aria-hidden="true"></i>

// </button>
// </div>
const editForm = workoutToEditData => {
  console.log(workoutToEditData);
  return `<div>${workoutToEditData}</div>`;
  // return ` <li class="workout workout--${workoutToEditData.type}" data-id=${workoutToEditData.id}  >
  //     <form>
  //     <select class="form__input form__input--type">
  //     <option value="running">Running</option>
  //     <option value="cycling">Cycling</option>
  //   </select>
  //   <div class="form__row">
  //   <label class="form__label">Distance</label>
  //   <input class="form__input form__input--distance" placeholder="km" defalutValue=${workoutToEditData.distance} />
  // </div>
  //     </form>
  // </li>`;
};
// const btnDeleteWorkout = document.querySelectorAll('.delete__btn');
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
    this._toggleDeleteBtn();

    // this.#workoutsList = JSON.parse(localStorage.getItem('workouts'));
    // (!localStorage.getItem('workouts') &&
    //   localStorage.setItem('workouts', JSON.stringify([]))) ||
    // localStorage.getItem('workouts', JSON.stringify([]));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    containerWorkouts.addEventListener('click', e => {
      this._handleSingleWorkout(e);
    });

    // btnDeleteWorkout.addEventListener('click', this._handleSingleWorkout(this));
    containerWorkouts.addEventListener(
      'dblclick',
      this._editWorkout.bind(this)
    );
    btnReset.addEventListener('click', this._resetWorkouts.bind(this));
  }
  _toggleDeleteBtn() {
    this.#workoutsList?.length > 0
      ? btnReset.classList.remove('hidden')
      : btnReset.classList.add('hidden');
  }
  _checkIfTargetIsLi(e) {
    return e.target.closest('li') !== null || e.target.closest.tagName === 'LI';
  }
  _updateUi = (HTMLElement, callback) => {
    HTMLElement.innerHTML = '';
    callback();
    this._setLocalStorage();
  };
  _moveToPopup(e) {
    if (e.target.closest('li') !== null) {
      const { coords } = this._getWorkouts().find(
        workout => workout.id == e.target.closest('li').dataset.id
      );
      this.#map.setView(coords, 30, { pan: { animate: true, duration: 2 } });
    }
  }
  _deleteSingleWorkout(e) {
    console.log(e.closest('li'));
    console.log(this._getWorkouts());
    console.log(Number(e.closest('li').dataset.id));
    const confirmDelete = confirm(
      "THIS WORKOUT WILL BE DELETED .DO YOU WAN'T TO PROCEED ??"
    );
    if (!confirmDelete) {
      return;
    }
    this.#workoutsList = this.#workoutsList.filter(workout => {
      console.log(workout.id !== Number(e.closest('li').dataset.id));
      return workout.id !== Number(e.closest('li').dataset.id);
    });

    // this.#workoutsList.forEach(workout => {
    //   this._renderWorkouts(workout);
    // });
    // (() => {
    //   return this._updateUi(document.querySelector('.workouts'), () =>
    //     this._renderWorkouts()
    //   );
    // })().bind(this);
    this._updateUi(document.querySelector('.workouts'), () =>
      this._renderWorkouts()
    );
    // console.log(this._getWorkouts());
  }
  _transformLiIntoForm(li) {
    // console.log('on');
    // li.insertAdjacentHTML('beforeend', editForm(li.dataset.id));
    // const input = document.createElement('input');
    // const spans = li.querySelector('span');
    // console.log(spans);
    // console.log('on');
    // li.replaceChild(input, spans);
  }
  _editSingleWorkOut(li) {
    this._transformLiIntoForm(li);
    // console.log('in');
    // console.log(li);
    // console.log(this);
    // this._updateUi(li, () => this._transformLiIntoForm(li));
  }
  _handleSingleWorkout(e) {
    const btnClasses = e.target.closest('button')?.classList[1];
    if (!e.target.closest('button')?.classList.contains('btn')) {
      return null;
    }
    if (e.target.closest('button')?.classList.contains('btn')) {
      switch (btnClasses) {
        case 'delete__btn':
          this._deleteSingleWorkout(e.target);
          this._blockMapActions(-1);
          break;
        case 'edit__btn':
          this._editSingleWorkOut(e.target.closest('.workout'));
          // console.log(e.target.closest('.workout'));
          break;
        case 'cancel__btn':
          console.log(e.target.closest('.btn_container'));
          this._handleBtnContainerVisibility(
            e.target.closest('.btn_container'),
            'add'
          );
          document.documentElement.style.setProperty('--after-display', -1);
          break;

        default:
          return null;
      }
    }
  }

  _editWorkout(e) {
    this.editWorkoutBoolean;

    this._checkIfTargetIsLi(e)
      ? this._setEditable(
          e.target.querySelector('li') || e.target.closest('li')
        )
      : null;

    // this._changeEditBoolean.bind(this);
  }
  _handleBtnContainerVisibility = (btnContainerEl, action) => {
    btnContainerEl.classList[action]('removed');
    setTimeout(() => {
      btnContainerEl.classList[action]('hidden');
    }, 200);
  };
  _blockMapActions(zIndexVal) {
    document.documentElement.style.setProperty('--after-display', zIndexVal);
  }

  _setEditable(li) {
    const liEl = li;
    const booleanEditable = JSON.parse(liEl.dataset.editable);

    liEl.dataset.editable = !booleanEditable;
    this._handleBtnContainerVisibility(
      liEl.querySelector('.btn_container'),
      'toggle'
    );
    this._blockMapActions(
      liEl.querySelector('.btn_container').classList.contains('hidden') ===
        false
        ? -1
        : 100
    );
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
    this.#workoutsList = [...this._getWorkouts(), workout];

    localStorage.setItem('workouts', this._getWorkouts());
  }
  get getMapCoords() {
    return this.#mapCoords;
  }
  _loadMap(pos) {
    const { latitude, longitude } = pos.coords;

    this.#mapCoords = [latitude, longitude];

    this.#map = L.map('map').setView(this.#mapCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', mapEvent => this._showForm.call(this, mapEvent));

    this._getWorkouts() &&
      this._getWorkouts().forEach(workout =>
        this._renderWorkoutMarker(workout)
      );
  }
  _showForm(mapEvent) {
    form.classList.toggle('hidden');
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
    const mp = new L.Marker(newWorkout.coords, {
      icon: myIcon,
      riseOnHover: true,
      draggable: true,
    });

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
      );
  }
  _renderWorkout(workout) {
    const dateString = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      date: 'numeric',
    }).format(workout.getDate);

    const workoutDate = new Date(workout.date);

    const formmatedDate = new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',

      day: 'numeric',
      month: '2-digit',
    }).format(new Date(workout.date));
    console.log(formmatedDate.toString());
    // dafault-value=${formmatedDate}
    const formmatedDateSelect = moment(workout.date).format('YYYY-MM-DD');

    const html = ` <li class="workout workout--${workout.type}" data-id=${
      workout.id
    }  data-editable =${false}>
    <form>
    
    <h2 class="workout__title" >
    ${
      workout.type.slice(0, 1).toUpperCase() + workout.type.slice(1)
    } on ${formmatedDate}
 </h2>
 <div class='workout__details__container'>
 <input type='date' readonly value=${formmatedDateSelect.toString()}></input>
    <div class="workout__details">
      <span class="workout__icon"> ${
        (workout.type === 'running' && '🏃‍♂️') || '🚴‍♀️'
      } </span>
      <input  readonly class="workout__value" value=${workout.distance}></input>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <input readonly class="workout__value" value=${workout.duration}></input>
      <span class="workout__unit">${
        (workout.type === 'running' && 'min') || 'km/h'
      }</span>
    </div>
    <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <input readonly  class="workout__value" value=${
      // (workout.type === 'running' &&)
      workout.pace?.toFixed(2) || workout.speed?.toFixed(2)
    }></input>
    <span class="workout__unit"> ${
      (workout.type === 'running' && 'min/km') || 'km/h'
    }</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">
    ${(workout.type === 'running' && '🦶') || '⛰'}
    
    </span>
    <input readonly class="workout__value" value= ${
      workout.cadence?.toFixed(2) || workout.elevantionGain?.toFixed(2)
    }></input>
    <span class="workout__unit">  ${
      (workout.type === 'running' && 'spm') || 'm'
    }</span>
    </div>
    </form>
  </div>
  <div class='btn_container  hidden removed'>
  <button class="btn edit__btn"><i class="fa fa-pencil-square-o" aria-hidden="true"></i>

  </button>
  <button class="btn delete__btn "><i class="fa fa-trash-o" aria-hidden="true"></i>
  </button>
  <button class="btn cancel__btn ">
  <i class="fa fa-times" aria-hidden="true"></i>

  </button>
  </div>
    </li>`;
    //     const html = ` <li class="workout workout--${workout.type}" data-id=${
    //       workout.id
    //     }  data-editable =${false}>
    //     <h2 class="workout__title">  ${
    //       workout.type.slice(0, 1).toUpperCase() + workout.type.slice(1)
    //     } on ${new Intl.DateTimeFormat('en-US', {
    //       year: 'numeric',
    //       month: 'long',
    //     }).format(workout.getDate)}
    //  </h2>
    //     <div class="workout__details">
    //       <span class="workout__icon"> ${
    //         (workout.type === 'running' && '🏃‍♂️') || '🚴‍♀️'
    //       } </span>
    //       <span class="workout__value">${workout.distance}</span>
    //       <span class="workout__unit">km</span>
    //     </div>
    //     <div class="workout__details">
    //       <span class="workout__icon">⏱</span>
    //       <span class="workout__value">${workout.duration}</span>
    //       <span class="workout__unit">${
    //         (workout.type === 'running' && 'min') || 'km/h'
    //       }</span>
    //     </div>
    //     <div class="workout__details">
    //     <span class="workout__icon">⚡️</span>
    //     <span class="workout__value">${
    //       // (workout.type === 'running' &&)
    //       workout.pace?.toFixed(2) || workout.speed?.toFixed(2)
    //     }</span>
    //     <span class="workout__unit"> ${
    //       (workout.type === 'running' && 'min/km') || 'km/h'
    //     }</span>
    //   </div>
    //   <div class="workout__details">
    //     <span class="workout__icon">
    //     ${(workout.type === 'running' && '🦶') || '⛰'}

    //     </span>
    //     <span class="workout__value"> ${
    //       workout.cadence?.toFixed(2) || workout.elevantionGain?.toFixed(2)
    //     }</span>
    //     <span class="workout__unit">m</span>

    //   </div>
    //   <div class='btn_container  hidden removed'>
    //   <button class="btn edit__btn"><i class="fa fa-pencil-square-o" aria-hidden="true"></i>

    //   </button>
    //   <button class="btn delete__btn "><i class="fa fa-trash-o" aria-hidden="true"></i>
    //   </button>
    //   <button class="btn cancel__btn ">
    //   <i class="fa fa-times" aria-hidden="true"></i>

    //   </button>
    //   </div>
    //     </li>`;
    document.querySelector('.workouts').insertAdjacentHTML('beforeend', html);
  }
  _renderWorkouts() {
    this._getWorkouts().length > 0 &&
      this._getWorkouts().forEach(workout => {
        this._renderWorkout(workout);
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
    e.preventDefault();
    const validInputs = (...inputs) =>
      inputs.every(inp => {
        return Number.isFinite(inp) && Number(inp) > 0;
      });

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
    this._toggleDeleteBtn();
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
  _reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
  _resetWorkouts() {
    const resetWorkouts = confirm('delete all workouts ??');
    if (resetWorkouts) {
      this.#workoutsList = [];
      alert('all workouts deleted ');
      this._setLocalStorage();
      this._getLocalStorage();
      document
        .querySelectorAll('.workout')
        .forEach(workout => workout.remove());
      this._toggleDeleteBtn();
    }
  }
}
//REFACTORING FOR PROJECT ARCHITECTURE
//LECTURE

const app = new App();

//LECTURE
