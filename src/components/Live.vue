<template>
  <div class="container-fluid">
    <div class="page-header">
      <h1>RacePicks <small class="no-break">for NASCAR</small></h1>
    </div>

    <div class="page-content">

      <div v-if="race.details" class="fade-in">

        <div id="day-info" class="row text-center">
          <div class="col-xs-12">
             <h4>
               <span class="race-name no-break">{{race.details.name}}</span>
               <span class="race-track no-break">@ {{race.details.track}}</span>
               &nbsp; &nbsp;
               <small><span class="no-break">
                  {{race.details.dateParts[0].slice(0,3)}}
                  {{race.details.dateParts[1]}}
                  {{race.details.dateParts[2]}},
                  {{race.details.dateParts[3]}}:{{race.details.dateParts[4]}}
                  {{race.details.dateParts[5]}}
                  {{race.details.dateParts[6]}}
                </span></small>
            </h4>
          </div>
        </div>

        <div v-if="race.details.timestamps.started && race.live">

          <div id="race-info" class="row text-center">
            <div class="col-xs-12">
              <h4 v-if="race.live.laps_in_race">
                <span class="no-break"
                  :class="{
                    'text-success': race.live.flag_state === 1,
                    'text-warning': race.live.flag_state === 2,
                    'text-danger': race.live.flag_state === 3
                  }">Lap {{race.live.lap_number}} <small>/ {{race.live.laps_in_race}}</small></span>
              </h4>
              <h4 v-else></h4>

              <h5 class="no-break"
                v-if="race.live.lap_number <= race.details.segments.first">
                Stage 1 &nbsp;<small>Laps 0 - {{race.details.segments.first}}</small>
              </h5>
              <h5 class="no-break"
                v-if="race.live.lap_number > race.details.segments.first && race.live.lap_number <= race.details.segments.second">
                Stage 2 &nbsp;<small>Laps {{race.details.segments.first + 1}} - {{race.details.segments.second}}</small>
              </h5>
            </div>
          </div>

          <div class="row">
            <div class="col-md-12">
              <standings :race="race" :drivers="drivers" :tossupAnswers="tossupAnswers"></standings>
            </div>
            <p>&nbsp;</p>
          </div>

          <div class="row">
            <div class="col-xs-12 col-md-6">
              <picks :race="race" :drivers="drivers"></picks>
              <p>&nbsp;</p>
            </div>
            <div class="col-xs-12 col-md-6">
              <wager stage="1" :race="race" :drivers="drivers"></wager>
              <wager stage="2" :race="race" :drivers="drivers"></wager>
              <wager stage="3" :race="race" :drivers="drivers"></wager>
              <p>&nbsp;</p>
              <tossup level="1" :race="race" :drivers="drivers" :tossupAnswers="tossupAnswers"></tossup>
              <tossup level="2" :race="race" :drivers="drivers" :tossupAnswers="tossupAnswers"></tossup>
              <tossup level="3" :race="race" :drivers="drivers" :tossupAnswers="tossupAnswers"></tossup>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="row text-center">
            <div class="col-xs-12">
               <h4>
                 <span class="no-break">Waiting for race to start...</span>
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="page-loading">
        <i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
        <span class="sr-only">Loading...</span>
      </div>

    </div>

  </div>
</template>

<script>
import Picks from '@/components/Picks.vue'
import Standings from '@/components/Standings.vue'
import Tossup from '@/components/Tossup.vue'
import Wager from '@/components/Wager.vue'

export default {
  name: 'live',
  props: ['race'],
  data () {
    return {}
  },
  computed: {
    drivers () {
      let drivers = []
      let driverCount = this.race.live.vehicles.length
      for (let i = 0; i < driverCount; i++) {
        let vehicle = this.race.live.vehicles[i]

        let driver = {}
        driver.number = vehicle.vehicle_number
        driver.name = vehicle.driver.full_name.replace(/[#*]|\(i\)/g, '')
        driver.position = vehicle.running_position
        driver.manufacturer = vehicle.vehicle_manufacturer.split('')[0].toUpperCase()

        let points = 0

        // get stage 1 points
        if (this.race.stages[0]) {
          let stageVehicle
          for (let i0 = 0; i0 < driverCount; i0++) {
            let v = this.race.stages[0].vehicles[i0]
            if (vehicle.driver.driver_id === v.driver.driver_id) {
              stageVehicle = v
              break
            }
          }
          points += driverCount - stageVehicle.running_position + 1
        } else {
          points += driverCount - vehicle.running_position + 1
        }

        // get stage 2 points
        if (this.race.stages[1]) {
          let stageVehicle
          for (let i0 = 0; i0 < driverCount; i0++) {
            let v = this.race.stages[1].vehicles[i0]
            if (vehicle.driver.driver_id === v.driver.driver_id) {
              stageVehicle = v
              break
            }
          }
          points += (driverCount - stageVehicle.running_position + 1) * 2
        } else {
          points += (driverCount - vehicle.running_position + 1) * 2
        }

        // get final stage points
        points += (driverCount - vehicle.running_position + 1) * 3
        if (vehicle.running_position === 1) { points += 100 }

        driver.points = points
        drivers.push(driver)
      }
      return drivers
    },
    tossupAnswers () {
      let tossups = [
        Object.assign({}, this.race.details.tossups.high),
        Object.assign({}, this.race.details.tossups.max),
        Object.assign({}, this.race.details.tossups.extreme)
      ]
      let driversAListNums = ['2', '4', '11', '18', '20', '22', '48', '78', '88']
      let tossupAnswers = tossups.map(tossup => {
        switch (tossup.prompt) {

          // high tossups  (very limited choices)
          case 'Will Dale Earnhardt Jr. (88) finish in the Top 10?':
            try {
              if (this.drivers.filter(driver => driver.number === '88')[0].position <= 10) {
                return 'Yes'
              } else {
                return 'No'
              }
            } catch (e) {
              return ''
            }

          case 'Will Jimmie Johnson (48) finish in the Top 10?':
            try {
              if (this.drivers.filter(driver => driver.number === '48')[0].position <= 10) {
                return 'Yes'
              } else {
                return 'No'
              }
            } catch (e) {
              return ''
            }

          case 'Winning car manufacturer?':
            try {
              return String(this.drivers.filter(driver => driver.position === 1)[0].manufacturer)
            } catch (e) {
              return ''
            }

          // max tossups  (moderately limited choices)
          case 'How many Fords will finish in the Top 20?':
            try {
              return String(this.drivers.filter(driver => driver.manufacturer === 'F' && driver.position <= 20).length)
            } catch (e) {
              return ''
            }

          case 'How many Chevrolets will finish in the Top 20?':
            try {
              return String(this.drivers.filter(driver => driver.manufacturer === 'C' && driver.position <= 20).length)
            } catch (e) {
              return ''
            }

          case 'How many Toyotas will finish in the Top 20?':
            try {
              return String(this.drivers.filter(driver => driver.manufacturer === 'T' && driver.position <= 20).length)
            } catch (e) {
              return ''
            }

          case 'How many A List Drivers will finish in the Top 10?':
            try {
              return String(this.drivers.filter(driver => driversAListNums.includes(driver.number) && driver.position <= 10).length)
            } catch (e) {
              return ''
            }

          case 'How many spontaneous caution flags?':
            if (this.race.stages[0]) {
              if (this.race.stages[1]) {
                return String(this.race.live.number_of_caution_segments - 2)
              } else {
                return String(this.race.live.number_of_caution_segments - 1)
              }
            } else {
              return String(this.race.live.number_of_caution_segments)
            }

          // extreme tossups  (broadly limited choices)
          case 'Which A List Driver will finish behind the others?':
            try {
              return String(this.drivers.filter(driver => driversAListNums.includes(driver.number)).sort((a, b) => b.position - a.position)[0].number)
            } catch (e) {
              return ''
            }

          case 'Who will win the race?':
            try {
              return String(this.drivers.filter(driver => driver.position === 1)[0].number)
            } catch (e) {
              return ''
            }
        }
      })
      return {
        high: tossupAnswers[0],
        max: tossupAnswers[1],
        extreme: tossupAnswers[2]
      }
    }
  },
  components: {
    Picks,
    Standings,
    Tossup,
    Wager
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  @import "../styles/vars.scss";

  #day-info {
    padding-top: 0px;
    padding-bottom: 0px;

    h4 {
     line-height: 1.5;
    }

    .race-track {
      @media only screen and (max-width: $screen-xs-1) {
        font-size: 0.8em;
      }
    }
  }

  #race-info {
    padding-top: 0px;
    padding-bottom: 20px;

    h4 {
     line-height: 1.5;
    }
  }
</style>
