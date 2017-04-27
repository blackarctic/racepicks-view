<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">
        <i class="fa fa-list" aria-hidden="true"></i> &nbsp; Picks
      </h3>
    </div>
    <div class="panel-body">
      <div class="btn-group btn-group-justified" role="group" aria-label="...">
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-default"
            :class="{active: choice === 'pos'}"
            @click="choice='pos'">Pos</button>
        </div>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-default"
            :class="{active: choice === 'pts'}"
            @click="choice='pts'">Pts</button>
        </div>
      </div>
    </div>
    <table class="table table-hover">
      <thead>
        <tr>
          <th v-if="choice === 'pts'">Pts</th>
          <th v-if="choice === 'pos'">Pos</th>
          <th>Driver</th>
          <th class="picks-icon-col">Picks</th>
        </tr>
      </thead>
      <transition-group name="flip-list" tag="tbody" v-if="choice === 'pos'">
        <tr v-for="driver in driversSorted" :key="driver.number + '-pos'">
          <td>{{driver.position}}</td>
          <td><driver :num="driver.number" :name="driver.name"></driver></td>
          <td class="picks-icon-col">
            <i v-for="entry in entriesByDriver[driver.number]" class="fa"
              :class="entryIconClasses(entry)"></i>
          </td>
        </tr>
      </transition-group>
      <transition-group name="flip-list" tag="tbody" v-if="choice === 'pts'">
        <tr v-for="driver in driversSorted" :key="driver.number + '-pts'">
          <td>{{driver.points}}</td>
          <td><driver :num="driver.number" :name="driver.name"></driver></td>
          <td class="picks-icon-col">
            <i v-for="entry in entriesByDriver[driver.number]" class="fa"
              :class="entryIconClasses(entry)"></i>
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
  name: 'picks',
  props: ['race', 'drivers'],
  data () {
    return {
      choice: 'pos'
    }
  },
  computed: {
    driversSorted () {
      if (this.choice === 'pos') {
        return this.drivers.sort((a, b) => a.position - b.position)
      } else if (this.choice === 'pts') {
        return this.drivers.sort((a, b) => b.points - a.points)
      } else {
        return []
      }
    },
    entriesByDriver () {
      let entriesByDriver = []
      let entriesList = Object.keys(this.race.entries).map(key => this.race.entries[key])
      for (let i = 0; i < entriesList.length; i++) {
        let entry = entriesList[i]

        if (entriesByDriver[entry.pick_a_1]) {
          entriesByDriver[entry.pick_a_1].push(entry)
        } else {
          entriesByDriver[entry.pick_a_1] = [entry]
        }

        if (entriesByDriver[entry.pick_a_2]) {
          entriesByDriver[entry.pick_a_2].push(entry)
        } else {
          entriesByDriver[entry.pick_a_2] = [entry]
        }

        if (entriesByDriver[entry.pick_b_1]) {
          entriesByDriver[entry.pick_b_1].push(entry)
        } else {
          entriesByDriver[entry.pick_b_1] = [entry]
        }

        if (entriesByDriver[entry.pick_b_2]) {
          entriesByDriver[entry.pick_b_2].push(entry)
        } else {
          entriesByDriver[entry.pick_b_2] = [entry]
        }

        if (entriesByDriver[entry.pick_c]) {
          entriesByDriver[entry.pick_c].push(entry)
        } else {
          entriesByDriver[entry.pick_c] = [entry]
        }
      }
      return entriesByDriver
    }
  },
  methods: {
    entryIconClasses: utility.entryIconClasses,
    numEnding: utility.numEnding
  },
  components: {
    Driver
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
