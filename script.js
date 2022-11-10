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
  return `<div>${workoutToEditData}</div>`;
};

// const btnDeleteWorkout = document.querySelectorAll('.delete__btn');
//LECTURE
//Using geolocation API
//LECTURE
//REFACTORING FOR PROJECT ARCHITECTURE

const error = error => {
  const { code } = error;

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
  elevationGain;
  speed;
  constructor(type, distance, duration, elevationGain, coords) {
    super(type, distance, duration, coords);
    this.elevationGain = Number(elevationGain);

    this.calcSpeed();
  }
  calcSpeed() {
    return (this.speed = this.getDistance / (this.getDuration / 60));
  }

  _editValues(type, distance, duration, elevationGain, date, coords) {
    super._editValues(type, distance, duration, date, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
}

class App {
  #mapCoords;
  #workoutsList;
  #map;

  constructor() {
    (() => {
      alert(
        'WELCOME TO MAPTY APP .IN THIS APPLICATION YOU CAN SET AND EXERCISE ROUTE FOR YOUR ROUTINES.ONCE YOU ADDED AND EXERCISE YOU CAN EDIT IT OR DELETE IT BY DOUBLE CLICKING ON EACH ELEMENT.ALSO DRAG AND DROP EACH ITEMS IF YOU WANT TO REORDER THE LIST! THANKS FOR VISITING!'
      );
    })();
    this._getPosition();
    const events = ['dblclick', 'touchstart'];
    const events1 = ['click', 'touchstart'];
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

    //importantComment EVENT LISTENERS WITHOUT TOUCH FUNCTIONALITY
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    containerWorkouts.addEventListener('click', e => {
      this._handleSingleWorkout(e);
    });
    //ADDING DRAG FUNCTIONALITY

    containerWorkouts.querySelectorAll('li').forEach(workout => {
      this._addDragAndDropFuncItems(workout);
    });

    containerWorkouts.addEventListener('dragover', e => {
      e.preventDefault();
      const workoutUl = e.target.closest('ul');
      workoutUl.classList.add('drag-on');

      const draggable = document.querySelector('.dragging');
      const afterElement = this._getDragAfterElement(workoutUl, e.clientY);

      if (!afterElement) {
        workoutUl.append(draggable);
      }
      workoutUl.insertBefore(draggable, afterElement);
    });
    containerWorkouts.addEventListener('drop', e =>
      e.target.classList.remove('drag-on')
    );
    containerWorkouts.addEventListener(
      'dragenter',
      e => (e.preventDefault(), (e.effectAllowed = 'move'))
    );
    containerWorkouts.addEventListener('dragleave', e => e.preventDefault());
    //importantComment
    //ADDING DRAG FUNCTIONALITY

    //Adding drag functionality
    //importantComment
    //importantComment I guess it's old code , doesn't work
    // btnDeleteWorkout.addEventListener('click', this._handleSingleWorkout(this));
    //importantComment I guess it's old code , doesn't work
    containerWorkouts.addEventListener(
      'dblclick',
      this._displayEditWorkoutMenu.bind(this)
    );
    btnReset.addEventListener('click', this._resetWorkouts.bind(this));

    //importantComment EVENT LISTENERS WITHOUT TOUCH FUNCTIONALITY
    //importantComment EVENT LISTENERS WITH TOUCH FUNCTIONALITY
    // events1.forEach(event =>
    //   containerWorkouts.addEventListener(event, this._moveToPopup.bind(this))
    // );
    // events1.forEach(event =>
    //   containerWorkouts.addEventListener(
    //     event,
    //     this._handleSingleWorkout(event)
    //   )

    // );
    // containerWorkouts.addEventListener('touchstart', e => {
    //   console.log(e.target);
    // });
    // events.forEach(event =>
    //   containerWorkouts.addEventListener(
    //     event,
    //     this._displayEditWorkoutMenu.bind(this)
    //   )
    // );
    // events1.forEach(event =>
    //   btnReset.addEventListener(event, this._resetWorkouts.bind(this))
    // );
    // containerWorkouts.addEventListener(
    //   'touchstart',
    //   this._displayEditWorkoutMenu.bind(this)
    // );

    //importantComment EVENT LISTENERS WITH TOUCH FUNCTIONALITY
  }

  _singleWorkoutFormAddEvent(liForm) {
    liForm.addEventListener('submit', e => {
      e.preventDefault();

      const updatedWorkout = this._updateWorkoutData(e);

      this._setFormNotEditable(e.target.closest('li'));
      this._setLocalStorage();
      alert(`workout with id : ${updatedWorkout.id} updated ✅`.toUpperCase());
    });
  }
  _addDragAndDropFuncItems(workout) {
    if (!workout) return;

    workout.addEventListener('dragstart', e => {
      setTimeout(() => {
        e.target.classList.add('dragging');
      }, 0);
      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.effectAllowed = 'move';
    }),
      workout.addEventListener('drag', e => {
        e.dataTransfer.effectAllowed = 'move';
      }),
      workout.addEventListener('dragend', e =>
        e.target.classList.remove('dragging')
      );
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
    return ` <li draggable='true' class="workout workout--${
      workout.type
    }" data-id=${workout.id}  data-editable =${false}>
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
      workout.cadence ? 'cadence' : 'elevationGain'
    }'  style="width:${
      workout.cadence?.toFixed(2).toString().length ||
      workout.elevationGain?.toFixed(2).toString().length
    }rem" step=".01" name='${
      workout.cadence || workout.elevationGain
    }' value= ${
      workout.cadence?.toFixed(2) || workout.elevationGain?.toFixed(2)
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

    workoutToUpdate.__proto__ =
      workoutToUpdate.type === 'running'
        ? Running.prototype
        : Cycling.prototype;
    let updateObj = workoutToUpdate;

    const {
      date: { value: date },
      type: { value: type },
      distance: { value: distance },
      duration: { value: duration },
    } = e.target;
    const cadenceOrElevation =
      e.target.cadence?.value || e.target.elevationGain?.value;

    updateObj._editValues(
      type,
      Number(distance),
      Number(duration),
      Number(cadenceOrElevation),
      new Date(date),
      coords
    );

    this._getWorkouts()[indexToUpdate] = updateObj;
    return updateObj;
  }
  //importantComment
  _deleteSingleWorkout(e) {
    const confirmDelete = confirm(
      "THIS WORKOUT WILL BE DELETED .DO YOU WAN'T TO PROCEED ??"
    );
    if (!confirmDelete) {
      return;
    }
    this.#workoutsList = this.#workoutsList.filter(workout => {
      return workout.id !== Number(e.closest('li').dataset.id);
    });
    this._removeLayerById(Number(e.closest('li').dataset.id));
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
  _removeLayerById(id) {
    this.#map.eachLayer(layer => (layer.id === id ? layer.remove() : null));
  }
  _removeAllLayers() {
    this.#map.eachLayer(layer => (layer.id ? layer.remove() : null));
  }
  _handleInputsStyles(li, inputBackground, inputColor) {
    li.forEach(input => {
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
  _getDragAfterElement = (container, y) => {
    const draggableElements = [
      ...container.querySelectorAll('.workout:not(.dragging)'),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
      }
    ).element;
  };
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
    this.#workoutsList = (this.#workoutsList && [
      ...this.#workoutsList,
      workout,
    ]) || [workout];

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
    let layerGroupWorkouts = L.layerGroup().addTo(this.#map);

    this.#map.on('click', mapEvent => this._showForm.call(this, mapEvent));

    this._getWorkouts() &&
      this._getWorkouts().forEach(workout =>
        this._renderWorkoutMarker(workout, layerGroupWorkouts)
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

  _renderWorkoutMarker(newWorkout, layerGroup) {
    var myIcon = L.icon({
      iconUrl: 'icon.png',
      iconSize: [38, 38],
    });
    let layer = L.marker(newWorkout.coords, {
      icon: myIcon,
      riseOnHover: true,
    });
    layer.id = newWorkout.id;
    layer.addTo(this.#map);
    // layer.addTo(layerGroup);

    let popup = L.popup({ autoClose: false }).setContent(
      `${(newWorkout.type === 'running' && '🏃‍♂️') || '🚴‍♀️'}  ${
        newWorkout.type.slice(0, 1).toUpperCase() + newWorkout.type.slice(1)
      } on
          ${new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
          }).format(new Date(newWorkout.date))}
        `
    );

    layer.bindPopup(popup).openPopup();

    // layer.addTo(this.#map);
    //importantComment
    //REFACTORING MARKET FUNCTIONALITY
    // var myIcon = L.icon({
    //   iconUrl: 'icon.png',
    //   iconSize: [38, 38],
    // });
    // const mp = new L.Marker(newWorkout.coords, {
    //   icon: myIcon,
    //   riseOnHover: true,
    //   draggable: true,
    // });

    // mp.addTo(this.#map)
    //   .bindPopup(
    //     L.popup({
    //       maxWidth: 250,
    //       maxHeight: 200,
    //       autoClose: false,
    //       keepInView: true,
    //       closeOnClick: true,

    //       className: `${newWorkout.type}-popup `,
    //     })
    //   )

    //   .setPopupContent(
    //     `${(newWorkout.type === 'running' && '🏃‍♂️') || '🚴‍♀️'}  ${
    //       newWorkout.type.slice(0, 1).toUpperCase() + newWorkout.type.slice(1)
    //     } on
    //   ${new Intl.DateTimeFormat('en-US', {
    //     year: 'numeric',
    //     month: 'long',
    //   }).format(new Date(newWorkout.date))}

    // `
    //   );
    //REFACTORING MARKET FUNCTIONALITY
    //importantComment
  }
  _renderWorkout(workout) {
    const workoutLi = this._returnWorkoutLi(workout);

    document
      .querySelector('.workouts')
      .insertAdjacentHTML('beforeend', workoutLi);

    this._addDragAndDropFuncItems(
      document.querySelector(`[data-id="${workout.id}"`)
    );
  }
  _renderWorkouts() {
    this._getWorkouts().length > 0 &&
      this._getWorkouts().forEach(workout => {
        //importantComment
        //try to refactor

        this._renderWorkout(workout);
        //importantComment
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
      this._removeAllLayers();
      this._reset();
    }
  }
}
//REFACTORING FOR PROJECT ARCHITECTURE
//LECTURE

const app = new App();

//LECTURE
