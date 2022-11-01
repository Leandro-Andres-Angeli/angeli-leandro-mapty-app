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

const editForm = workoutToEditData => {
  console.log(workoutToEditData);
  return `<div>${workoutToEditData}</div>`;
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
  _editValues(type, distance, duration, date, coords) {
    this.type = type;
    this.distance = distance;
    this.duration = duration;
    this.date = date;
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
  _testFunc() {
    console.log('test function');
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
  _editValues(type, distance, duration, cadence, date, coords) {
    super._editValues(type, distance, duration, date, coords);
    this.cadence = cadence;
    this.calcPace();
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

  _editValues(type, distance, duration, elevantionGain, date, coords) {
    super._editValues(type, distance, duration, date, coords);
    this.elevantionGain = elevantionGain;
    this.calcSpeed();
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
      this._displayEditWorkoutMenu.bind(this)
    );
    btnReset.addEventListener('click', this._resetWorkouts.bind(this));
  }
  _singleWorkoutFormAddEvent(liForm) {
    liForm.addEventListener('submit', e => {
      console.log('event');
      e.preventDefault();
      e.stopPropagation();
      this._updateWorkoutData(e);
    });
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
  _returnWorkoutLi(workout) {
    const formmatedDateSelect = moment(workout.date).format('YYYY-MM-DD');
    const formmatedDate = new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',

      day: 'numeric',
      month: '2-digit',
    }).format(new Date(workout.date));
    return ` <li class="workout workout--${workout.type}" data-id=${
      workout.id
    }  data-editable =${false}>
    <h2 class="workout__title" >
    ${
      workout.type.slice(0, 1).toUpperCase() + workout.type.slice(1)
    } on ${formmatedDate}
 </h2>
 <h2 class="workout__title hidden removed" >
 Edit Form
</h2>
   
    
 <form>   
 <div class='wrapper' style='display: flex;
 justify-content: space-between;
 margin: 10px 0;'>
 
 <label hidden class="edit__workout__label">Type
 <select class="form__input "  name='type' style=" width:${
   workout.type.length + 2
 }rem">
   <option value="running">Running</option>
   <option value="cycling">Cycling</option>
 </select>
 </label>

 <label class="  edit__workout__label " hidden>Edit Date
 <input type='date' name='date' readonly style="width:${
   formmatedDateSelect.toString().length + 1
 }rem" value=${formmatedDateSelect.toString()}></input>
 </label></div>
 <div class='workout__details__container'>


    <div class="workout__details">
      <span class="workout__icon"> ${
        (workout.type === 'running' && '🏃‍♂️') || '🚴‍♀️'
      } </span>
      <input  name='distance' readonly class="workout__value"  type="number" style="width:${3}rem" max="500"  step="any" value=${
      workout.distance
    }></input>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <input name='duration' readonly class="workout__value" type="number" style="width:${4}rem" max="999" value=${
      workout.duration
    }></input>
      <span class="workout__unit">min
      </span>
    </div>
    <div class="workout__details  ${workout.pace ? 'pace' : 'speed'}">
    <span class="workout__icon">⚡️</span>
    <input readonly  class="workout__value" type="number"  style="width:${
      workout.pace?.toFixed(2).length || workout.speed?.toFixed(2).length
    }rem"  value=${
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
    <input readonly class="workout__value" type="number" name='${
      workout.cadence ? 'cadence' : 'elevantionGain'
    }'  style="width:${
      workout.cadence?.toFixed(2).toString().length ||
      workout.elevantionGain?.toFixed(2).toString().length
    }rem" name='${workout.cadence || workout.elevantionGain}' value= ${
      workout.cadence?.toFixed(2) || workout.elevantionGain?.toFixed(2)
    }></input>
    <span class="workout__unit">  ${
      (workout.type === 'running' && 'spm') || 'm'
    }</span>
    </div>
    </div>
    <button type='submit' class='edit__workout__btn  hidden removed' style="background-color:var(--color-brand--${
      workout.type === 'running' ? '2' : '1'
    })">edit workout</button>
   
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
  }
  //importantComment
  //WORKING ON UPDATE SINGLE WORKOUT
  _updateWorkoutData(e) {
    const id = Number(e.target.parentElement.dataset.id);
    let workoutToUpdate = this._getWorkouts().find(
      workout => workout.id === Number(id)
    );
    let indexToUpdate = this._getWorkouts().findIndex(
      workout => workout.id === Number(id)
    );
    const { coords } = workoutToUpdate;
    console.log(coords);
    console.log(indexToUpdate);
    workoutToUpdate.__proto__ =
      workoutToUpdate.type === 'running'
        ? Running.prototype
        : Cycling.prototype;
    let updateObj = workoutToUpdate;
    updateObj.__proto__ =
      workoutToUpdate.type === 'running'
        ? Running.prototype
        : Cycling.prototype;

    const {
      date: { value: date },
      type: { value: type },
      distance: { value: distance },
      duration: { value: duration },
    } = e.target;
    const cadenceOrElevation =
      e.target.cadence?.value || e.target.elevantionGain?.value;
    console.log('date var ', date);
    console.log('type var ', type);
    console.log('type distance ', distance);
    console.log('type elevation or cadence ', cadenceOrElevation);
    updateObj._editValues(
      type,
      distance,
      duration,
      cadenceOrElevation,
      date,
      coords
    );

    // let up = workoutToUpdate._editValues(
    //   1,
    //   2,
    //   3,
    //   4,
    //   [1, 2]
    //   distance,
    // duration,
    // cadenceOrElevation,
    // new Date(date),
    // coords
    // );
    // console.log(up);
    this._getWorkouts()[indexToUpdate] = updateObj;
    // console.log(this);
  }
  //importantComment
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

    this._updateUi(document.querySelector('.workouts'), () =>
      this._renderWorkouts()
    );
  }
  _setFormNotEditable(li) {
    const id = li.dataset.id;

    let resetedLI = document.createElement('div');

    resetedLI.innerHTML = this._returnWorkoutLi(
      this._getWorkouts().find(workout => workout.id === Number(id))
    );
    li.outerHTML = resetedLI.innerHTML;
  }

  _handleInputsStyles(li, inputBackground, inputColor) {
    li.forEach(input => {
      console.log('in');
      input.style.backgroundColor = inputBackground;
      input.style.color = inputColor;
    });
  }
  _handleInputsStyles(li, inputBackground, inputColor, attributeToRemove) {
    li.forEach(input => {
      input.removeAttribute(attributeToRemove);
      input.style.backgroundColor = inputBackground;
      input.style.color = inputColor;
    });
  }
  _setFormEditable(li) {
    this._handleInputsStyles(
      li.querySelectorAll('input'),
      getComputedStyle(document.documentElement).getPropertyValue(
        '--color-light--2'
      ),
      'black',
      'readonly'
    );

    const fieldToHide = li.querySelector('.pace') || li.querySelector('.speed');
    this._handleVisibility(fieldToHide, 'add');

    const datePicker = li.querySelector('input[type="date"]');
    datePicker.closest('label').removeAttribute('hidden');
    datePicker.style.backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue('--color-light--2');
    datePicker.style.color = 'black';

    const defaultType = li
      .querySelector('h2')
      .textContent.toLowerCase()
      .includes('running')
      ? 'running'
      : 'cycling';

    li.querySelectorAll('option').forEach(option => {
      option.value === defaultType && option.setAttribute('selected', true);
    });

    console.log(defaultType);
    li.querySelectorAll('label').forEach(label => {
      label.style.display = 'block ruby';
    });
    this._handleVisibility(li.querySelector('.edit__workout__btn'), 'remove');
    this._handleVisibility(li.querySelector('h2'), 'add');
    this._handleVisibility(li.querySelectorAll('h2')[1], 'remove');
  }
  _editSingleWorkOut(li) {
    this._setFormEditable(li);
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
          this._singleWorkoutFormAddEvent(e.target.closest('.workout'));

          break;
        case 'cancel__btn':
          console.log(e.target.closest('.btn_container'));
          this._handleVisibility(e.target.closest('.btn_container'), 'add');
          document.documentElement.style.setProperty('--after-display', -1);
          this._setFormNotEditable(e.target.closest('li'));
          break;

        default:
          return null;
      }
    }
  }

  _displayEditWorkoutMenu(e) {
    this.displayEditWorkoutMenuBoolean;

    this._checkIfTargetIsLi(e)
      ? this._setEditable(
          e.target.querySelector('li') || e.target.closest('li')
        )
      : null;
  }
  //LECTURE
  _handleVisibility = (btnContainerEl, action) => {
    btnContainerEl.classList[action]('removed');
    setTimeout(() => {
      btnContainerEl.classList[action]('hidden');
    }, 200);
  };
  //LECTURE
  _blockMapActions(zIndexVal) {
    document.documentElement.style.setProperty('--after-display', zIndexVal);
  }

  _setEditable(li) {
    const liEl = li;
    const booleanEditable = JSON.parse(liEl.dataset.editable);
    liEl
      .closest('ul')
      .querySelectorAll('li')
      .forEach(workout => {
        workout !== liEl
          ? (this._handleVisibility(
              workout.querySelector('.btn_container'),
              'add'
            ),
            (workout.dataset.editable = false),
            this._setFormNotEditable(workout))
          : (this._handleVisibility(
              liEl.querySelector('.btn_container'),
              'toggle'
            ),
            (workout.dataset.editable = true));
      });

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
    this.#workoutsList = [...this.#workoutsList, workout];

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
    <h2 class="workout__title" >
    ${
      workout.type.slice(0, 1).toUpperCase() + workout.type.slice(1)
    } on ${formmatedDate}
 </h2>
 <h2 class="workout__title hidden removed" >
 Edit Form
</h2>
   
    
 <form>   
 
 <label hidden class="edit__workout__label">Type
 <select  name='type' class="form__input " style=" width:${
   workout.type.length + 2
 }rem">
   <option value="running">Running</option>
   <option value="cycling">Cycling</option>
 </select>
 </label>
 <div class="  edit__workout___label__div " hidden>
 <label class='edit__workout___label'>Edit Date
 <input name='date' type='date'  readonly style="width:${
   formmatedDateSelect.toString().length + 1
 }rem" value=${formmatedDateSelect.toString()}></input>
 </label>
 
 </div>
    <div class="workout__details">
      <span class="workout__icon"> ${
        (workout.type === 'running' && '🏃‍♂️') || '🚴‍♀️'
      } </span>
      <input name='distance' readonly class="workout__value"  type="number" style="width:${
        workout.distance.toString().length * 1.7
      }rem"  step="any" value=${workout.distance}></input>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <input readonly class="workout__value" type="number"  style="width:${
        workout.duration.toString().length * 1.7
      }rem" value=${workout.duration}></input>
      <span class="workout__unit">${
        (workout.type === 'running' && 'min') || 'km/h'
      }</span>
    </div>
    <div class="workout__details  ${workout.pace ? 'pace' : 'speed'}">
    <span class="workout__icon">⚡️</span>
    <input readonly  class="workout__value" type="number"  style="width:${
      workout.pace?.toFixed(2).length || workout.speed?.toFixed(2).length
    }rem"  value=${
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
    <input readonly  name='${
      workout.cadence ? 'cadence' : 'elevationGain'
    }' class="workout__value" type="number"  style="width:${
      workout.cadence?.toFixed(2).toString().length ||
      workout.elevantionGain?.toFixed(2).toString().length
    }rem" value= ${
      workout.cadence?.toFixed(2) || workout.elevantionGain?.toFixed(2)
    }></input>
    <span class="workout__unit">  ${
      (workout.type === 'running' && 'spm') || 'm'
    }</span>
    </div>
    </div>
    <button type='submit' class='edit__workout__btn  hidden removed' style="background-color:var(--color-brand--${
      workout.type === 'running' ? '1' : '2'
    })">edit workout</button>
   
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

    document
      .querySelector('.workouts')
      .insertAdjacentHTML('beforeend', this._returnWorkoutLi(workout));
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
