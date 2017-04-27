<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">
        <i class="fa fa-question-circle-o" aria-hidden="true"></i> &nbsp; 
        {{tossupName | capitalize}} Tossup &nbsp; <small>{{possiblePoints}} pts</small>
      </h3>
    </div>
    <div class="panel-body">
      <p>{{race.details.tossups[tossupName].prompt}}</p>
    </div>
    <table class="table table-hover">
      <transition-group name="flip-list" tag="tbody">
        <tr :key="'header'">
          <td class="icon-col"><strong>Answer</strong></td>
          <td class="answer-col">
            <strong>
              <span v-if="answerIsDriver(tossupAnswer)">
                <driver :num="transformAnswer(tossupAnswer).number"
                  :name="transformAnswer(tossupAnswer).name"></driver>
              </span>
              <span v-else>{{transformAnswer(tossupAnswer).value}}</span>
            </strong>
          </td>
        </tr>
        <tr v-for="entry in entriesList"
          :key="'user-' + entry.username"
          :class="{success: tossupAnswer === entry[`tossup_${tossupName}`] }">
          <td class="icon-col"><i class="fa" :class="entryIconClasses(entry)"></i></td>
          <td class="answer-col">
            <span v-if="answerIsDriver(entry[`tossup_${tossupName}`])">
              <driver :num="transformAnswer(entry[`tossup_${tossupName}`]).number"
                :name="transformAnswer(entry[`tossup_${tossupName}`]).name"></driver>
            </span>
            <span v-else>{{transformAnswer(entry[`tossup_${tossupName}`]).value}}</span>
          </td>
        </tr>
      </transition-group>
    </table>
  </div>
</template>

<script>
import Driver from '@/components/Driver.vue'
import * as utility from '@/scripts/utility.js'

export default {
  name: 'tossup',
  props: ['level', 'race', 'drivers', 'tossupAnswers'],
  data () {
    return {}
  },
  computed: {
    possiblePoints () {
      switch (this.level) {
        case '1':
          return 50
        case '2':
          return 100
        case '3':
          return 150
      }
    },
    tossupName () {
      switch (this.level) {
        case '1':
          return 'high'
        case '2':
          return 'max'
        case '3':
          return 'extreme'
      }
    },
    tossupAnswer () {
      if (this.race.details.tossups[this.tossupName].answer !== undefined &&
          this.race.details.tossups[this.tossupName].answer !== '' &&
          this.race.details.tossups[this.tossupName].answer !== '--') {
        return this.race.details.tossups[this.tossupName].answer
      } else {
        return this.tossupAnswers[this.tossupName]
      }
    },
    entriesList () {
      return Object.keys(this.race.entries).map(key => this.race.entries[key]).sort((a, b) => {
        switch (this.race.details.tossups[this.tossupName].type) {
          case 'driver':
          case 'number':
            return Number(a[`tossup_${this.tossupName}`]) - Number(b[`tossup_${this.tossupName}`])
          default:
            return a[`tossup_${this.tossupName}`] - b[`tossup_${this.tossupName}`]
        }
      })
    }
  },
  methods: {
    entryIconClasses: utility.entryIconClasses,
    numEnding: utility.numEnding,
    answerIsDriver (val) {
      if (val === '') { return false }
      return this.race.details.tossups[this.tossupName].type === 'driver' && this.drivers.filter(driver => driver.number === val).length === 1
    },
    transformAnswer (val) {
      if (val === '') { return { value: 'N/A' } }
      switch (this.race.details.tossups[this.tossupName].type) {

        case 'car':
          switch (val) {
            case 'C':
              return {value: 'Chevrolet'}
            case 'T':
              return {value: 'Toyota'}
            case 'F':
              return {value: 'Ford'}
          }
          return {value: val}

        case 'driver':
          try {
            let driver = this.drivers.filter(driver => driver.number === val)[0]
            return {number: driver.number, name: driver.name}
          } catch (e) {
            return {value: val}
          }

        default:
          return {value: val}
      }
    }
  },
  components: {
    Driver
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .icon-col {
    width: 25%;
  }
  .answer-col {
    width: 75%;
  }
</style>
