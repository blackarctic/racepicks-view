<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">
        <i class="fa fa-dollar" aria-hidden="true"></i> &nbsp; {{stage === '3' ? 'Final Stage' : `Stage ${stage}`}} Wager &nbsp; <small>up to {{possiblePoints}} pts</small>
      </h3>
    </div>
    <table class="table table-hover">
      <thead>
        <tr>
          <th class="icon-col"></th>
          <th class="wager-col"
            :class="{success: wagerDriver1.position < wagerDriver2.position, danger: wagerDriver1.position > wagerDriver2.position}">
            <driver :num="wagerDriver1.number" :name="wagerDriver1.name"></driver>
          </th>
          <th class="wager-col"
            :class="{success: wagerDriver2.position < wagerDriver1.position, danger: wagerDriver2.position > wagerDriver1.position}">
            <driver :num="wagerDriver2.number" :name="wagerDriver2.name"></driver>
          </th>
        </tr>
      </thead>
      <transition-group name="flip-list" tag="tbody">
        <tr :key="'header'">
          <td class="icon-col"><strong>Pos</strong></td>
          <td class="wager-col" 
            :class="{success: wagerDriver1.position < wagerDriver2.position, danger: wagerDriver1.position > wagerDriver2.position}">
            <strong>{{wagerDriver1.position}}<small>{{numEnding(wagerDriver1.position)}}</small></strong>
          </td>
          <td class="wager-col"
            :class="{success: wagerDriver2.position < wagerDriver1.position, danger: wagerDriver2.position > wagerDriver1.position}">
            <strong>{{wagerDriver2.position}}<small>{{numEnding(wagerDriver2.position)}}</small></strong>
          </td>
        </tr>
        <tr v-for="entry in entriesList" v-if="entry[`wager_seg_${stage}_bet`]" :key="'user-' + entry.username">
          <td class="icon-col"><i class="fa" :class="entryIconClasses(entry)"></i></td>
          <td class="wager-col"
            :class="{success: wagerDriver1.position < wagerDriver2.position, danger: wagerDriver1.position > wagerDriver2.position}">
            <span v-if="entry[`wager_seg_${stage}_pick`] === wagerDriver1.number">
              <span v-if="wagerDriver1.position < wagerDriver2.position">+</span>
              <span v-else>-</span>
              {{entry[`wager_seg_${stage}_bet`]}}
              <small>pts</small>
            </span>
          </td>
          <td class="wager-col"
            :class="{success: wagerDriver2.position < wagerDriver1.position, danger: wagerDriver2.position > wagerDriver1.position}">
            <span v-if="entry[`wager_seg_${stage}_pick`] === wagerDriver2.number">
              <span v-if="wagerDriver2.position < wagerDriver1.position">+</span>
              <span v-else>-</span>
              {{entry[`wager_seg_${stage}_bet`]}}
              <small>pts</small>
            </span>
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
  name: 'wager',
  props: ['stage', 'race', 'drivers'],
  data () {
    return {}
  },
  computed: {
    possiblePoints () {
      switch (this.stage) {
        case '1':
          return 50
        case '2':
          return 100
        case '3':
          return 150
      }
    },
    wagerName () {
      switch (this.stage) {
        case '1':
          return 'first'
        case '2':
          return 'second'
        case '3':
          return 'third'
      }
    },
    wagerDrivers () {
      let wagerDriver1 = Object.assign({}, this.drivers.filter(driver => {
        return driver.number === this.race.details.wagers[this.wagerName][0]
      })[0])
      let wagerDriver2 = Object.assign({}, this.drivers.filter(driver => {
        return driver.number === this.race.details.wagers[this.wagerName][1]
      })[0])

      if (this.stage === '1' && this.race.stages[0]) {
        wagerDriver1.position = this.race.stages[0].vehicles.filter(vehicle => {
          return vehicle.vehicle_number === wagerDriver1.number
        })[0].running_position
        wagerDriver2.position = this.race.stages[0].vehicles.filter(vehicle => {
          return vehicle.vehicle_number === wagerDriver2.number
        })[0].running_position
      } else if (this.stage === '2' && this.race.stages[1]) {
        wagerDriver1.position = this.race.stages[1].vehicles.filter(vehicle => {
          return vehicle.vehicle_number === wagerDriver1.number
        })[0].running_position
        wagerDriver2.position = this.race.stages[1].vehicles.filter(vehicle => {
          return vehicle.vehicle_number === wagerDriver2.number
        })[0].running_position
      }

      return [wagerDriver1, wagerDriver2].sort((a, b) => {
        return a.position - b.position
      })
    },
    wagerDriver1 () {
      return this.wagerDrivers[0]
    },
    wagerDriver2 () {
      return this.wagerDrivers[1]
    },
    entriesList () {
      let entriesList = Object.keys(this.race.entries).map(key => this.race.entries[key]).map(entry => {
        let wagerEarnings = 0
        if (entry[`wager_seg_${this.stage}_pick`] === this.wagerDriver1.number) {
          if (this.wagerDriver1.position < this.wagerDriver2.position) {
            wagerEarnings = Number(entry[`wager_seg_${this.stage}_bet`])
          } else {
            wagerEarnings = 0 - Number(entry[`wager_seg_${this.stage}_bet`])
          }
        } else {
          if (this.wagerDriver2.position < this.wagerDriver1.position) {
            wagerEarnings = Number(entry[`wager_seg_${this.stage}_bet`])
          } else {
            wagerEarnings = 0 - Number(entry[`wager_seg_${this.stage}_bet`])
          }
        }
        return Object.assign({wagerEarnings}, entry)
      })
      entriesList = entriesList.sort((a, b) => {
        return b.wagerEarnings - a.wagerEarnings
      })
      return entriesList
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
  .icon-col {
    width: 25%;

  }
  .wager-col {
    width: 37.5%;
  }
</style>
