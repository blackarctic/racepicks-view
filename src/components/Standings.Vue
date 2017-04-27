<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">
        <i class="fa fa-users" aria-hidden="true"></i> &nbsp; Group Standings
      </h3>
    </div>
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Icon</th>
          <th>Name</th>
          <th>Pts</th>
        </tr>
      </thead>
      <transition-group name="flip-list" tag="tbody">
        <tr v-for="(entry, index) in sortedEntries" :key="'user-' + entry.username"
          :class="{success: index === 0}">
          <td>{{index+1}}<small>{{numEnding(index+1)}}</small></td>
          <td><i :class="entryIconClasses(entry)" class="fa"></i></td>
          <td>{{entry.username}}</td>
          <td>{{entry.pts}}</td>
        </tr>
      </transition-group>
    </table>
  </div>
</template>

<script>
import * as utility from '@/scripts/utility.js'

export default {
  name: 'standings',
  props: ['race', 'drivers', 'tossupAnswers'],
  data () {
    return {}
  },
  computed: {
    sortedEntries () {
      let entriesArray = Object.keys(this.race.entries).map(key => this.race.entries[key]).map(entry => {
        let pts = 0

        // calculate points from picks
        let pickA1 = this.drivers.filter(driver => driver.number === entry.pick_a_1)[0]
        let pickA2 = this.drivers.filter(driver => driver.number === entry.pick_a_2)[0]
        let pickB1 = this.drivers.filter(driver => driver.number === entry.pick_b_1)[0]
        let pickB2 = this.drivers.filter(driver => driver.number === entry.pick_b_2)[0]
        let pickC = this.drivers.filter(driver => driver.number === entry.pick_c)[0]

        if (pickA1) { pts += pickA1.points }
        if (pickA2) { pts += pickA2.points }
        if (pickB1) { pts += pickB1.points }
        if (pickB2) { pts += pickB2.points }
        if (pickC) { pts += pickC.points }

        // calculate points from wagers
        let wager1Driver1 = Object.assign({}, this.drivers.filter(driver => driver.number === this.race.details.wagers.first[0])[0])
        let wager1Driver2 = Object.assign({}, this.drivers.filter(driver => driver.number === this.race.details.wagers.first[1])[0])
        let wager2Driver1 = Object.assign({}, this.drivers.filter(driver => driver.number === this.race.details.wagers.second[0])[0])
        let wager2Driver2 = Object.assign({}, this.drivers.filter(driver => driver.number === this.race.details.wagers.second[1])[0])
        let wager3Driver1 = Object.assign({}, this.drivers.filter(driver => driver.number === this.race.details.wagers.third[0])[0])
        let wager3Driver2 = Object.assign({}, this.drivers.filter(driver => driver.number === this.race.details.wagers.third[1])[0])

        if (this.race.stages[0]) {
          wager1Driver1.position = this.race.stages[0].vehicles.filter(vehicle => {
            return vehicle.vehicle_number === wager1Driver1.number
          })[0].running_position
          wager1Driver2.position = this.race.stages[0].vehicles.filter(vehicle => {
            return vehicle.vehicle_number === wager1Driver2.number
          })[0].running_position
        }

        if (this.race.stages[1]) {
          wager2Driver1.position = this.race.stages[0].vehicles.filter(vehicle => {
            return vehicle.vehicle_number === wager2Driver1.number
          })[0].running_position
          wager2Driver2.position = this.race.stages[0].vehicles.filter(vehicle => {
            return vehicle.vehicle_number === wager2Driver2.number
          })[0].running_position
        }

        if (wager1Driver1.position < wager1Driver2.position) {
          if (entry.wager_seg_1_pick === wager1Driver1.number) {
            pts += entry.wager_seg_1_bet
          } else {
            pts -= entry.wager_seg_1_bet
          }
        } else {
          if (entry.wager_seg_1_pick === wager1Driver2.number) {
            pts += entry.wager_seg_1_bet
          } else {
            pts -= entry.wager_seg_1_bet
          }
        }

        if (wager2Driver1.position < wager2Driver2.position) {
          if (entry.wager_seg_2_pick === wager2Driver1.number) {
            pts += entry.wager_seg_2_bet
          } else {
            pts -= entry.wager_seg_2_bet
          }
        } else {
          if (entry.wager_seg_2_pick === wager2Driver2.number) {
            pts += entry.wager_seg_2_bet
          } else {
            pts -= entry.wager_seg_2_bet
          }
        }

        if (wager3Driver1.position < wager3Driver2.position) {
          if (entry.wager_seg_3_pick === wager3Driver1.number) {
            pts += entry.wager_seg_3_bet
          } else {
            pts -= entry.wager_seg_3_bet
          }
        } else {
          if (entry.wager_seg_3_pick === wager3Driver2.number) {
            pts += entry.wager_seg_3_bet
          } else {
            pts -= entry.wager_seg_3_bet
          }
        }

        // calculate points from tossups
        if (this.getTossupAnswer('high') === entry.tossup_high) {
          pts += 50
        }
        if (this.getTossupAnswer('max') === entry.tossup_max) {
          pts += 100
        }
        if (this.getTossupAnswer('extreme') === entry.tossup_extreme) {
          pts += 150
        }

        return Object.assign({pts}, entry)
      })
      return entriesArray.sort((a, b) => {
        return b.pts - a.pts
      })
    }
  },
  methods: {
    entryIconClasses: utility.entryIconClasses,
    numEnding: utility.numEnding,
    getTossupAnswer (tossupName) {
      if (this.race.details.tossups[tossupName].answer !== undefined &&
          this.race.details.tossups[tossupName].answer !== '' &&
          this.race.details.tossups[tossupName].answer !== '--') {
        return this.race.details.tossups[tossupName].answer
      } else {
        return this.tossupAnswers[tossupName]
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
