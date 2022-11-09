# angeli-leandro-mapty-app
## Geolocation app Mapty

<img src="icon.png" alt="app logo"/>
<section>
Project from Jonas Schmedtmann's "Javascript from Zero to Hero" Course.In this app I implemented geolocation native JS API in order to get user's location in a map 
, implementing also LeafletJS library.User can make a list of exercises , decide  if the exercise it's going to be cycling or running, set distance , time and some other
configs.
  <hr/>
User can also edit a workout or delete it , or delete all workouts if he/she wants to.User can reorder workouts list (I implemented native JS drag and drop API)
.User can access these last features by double clicking on each workout, a  button list will appear on top of the workout selected to update.
When user clicks on each workout it will scroll to the map and zoom in this particular activity.
Any change in workouts list will be persisted in browser's localStorage
Application logic in JS file is based on ES6 classes, implemented private fields and methods when necessary.
I used all native JS functionalities, no libraries, I wanted to take that approach in this single project
  live demo @ <a href='https://angeli-mapty-app.netlify.app/' target='_blank'>https://angeli-mapty-app.netlify.app/</a>
  </section>

