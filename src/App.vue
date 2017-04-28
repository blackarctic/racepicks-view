<template>
  <div id="app">
    <router-view :race="race"></router-view>
  </div>
</template>

<script>
import Vue from 'vue'

// create filters
Vue.filter('capitalize', function (value) {
  return value[0].toUpperCase() + value.slice(1)
})

// import firebase
var firebase = require('firebase/app')
require('firebase/auth')
require('firebase/database')

// initialize firebase
try {
  firebase.initializeApp({
    apiKey: 'AIzaSyCNfdFnvjW2kOBIHyTCqK6NwQk0RCvgsGQ',
    authDomain: 'racepicks-ba11f.firebaseapp.com',
    databaseURL: 'https://racepicks-ba11f.firebaseio.com',
    storageBucket: 'racepicks-ba11f.appspot.com',
    messagingSenderId: '900956034784'
  })
} catch (e) { console.error(e) }

// global data (to be loaded)
let latestRaceId = null
let race = {}

// method to load data from firebase
let loadData = function () {
  firebase.database().ref('/latestRaceId').once('value')
  .then(function (response) {
    latestRaceId = response.val()

    // get race details once
    try {
      firebase.database().ref(`/races/${latestRaceId}/details`).once('value')
      .then(function (response) {
        Vue.set(race, 'details', response.val())
        Vue.set(race, 'stages', [])

        // watch race details
        firebase.database().ref(`/races/${latestRaceId}/details`).on('value', function (snapshot) {
          Vue.set(race, 'details', snapshot.val())
        })

        // watch stage 1 final lap
        firebase.database().ref(`/races/${latestRaceId}/laps/${Number(race.details.segments.first) + 1}`).on('value', function (snapshot) {
          Vue.set(race.stages, 0, snapshot.val())
        })

        // watch stage 2 final lap
        firebase.database().ref(`/races/${latestRaceId}/laps/${Number(race.details.segments.second) + 1}`).on('value', function (snapshot) {
          Vue.set(race.stages, 1, snapshot.val())
        })
      })
      .catch(function (e) { console.error(e) })
    } catch (e) { console.error(e) }

    // get race entries once
    try {
      firebase.database().ref(`/races/${latestRaceId}/entries`).once('value')
      .then(function (response) {
        if (!response.val()) {
          Vue.set(race, 'entries', {})
        } else {
          Vue.set(race, 'entries', response.val())
        }
      })
      .catch(function (e) { console.error(e) })
    } catch (e) { console.error(e) }

    // watch race live
    firebase.database().ref(`/races/${latestRaceId}/live`).on('value', function (snapshot) {
      Vue.set(race, 'live', snapshot.val())
    })
  })
  .catch(function (e) { console.error(e) })
}

// authenticate with firebase (anonymously)
firebase.auth().signInAnonymously()
.then(function (response) {
  loadData()
})
.catch(function (e) {
  console.error(e)
})

export default {
  name: 'app',
  data () {
    return {
      race
    }
  }
}
</script>

<style src="./styles/global.scss" lang="scss"></style>
