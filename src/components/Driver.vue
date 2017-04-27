<template>
  <span>
    <span class="badge"><span v-if="num < 10">&nbsp;</span>{{num}}</span> <span class="driver-name">{{name}}</span>
  </span>
</template>

<script>
export default {
  name: 'driver',
  props: ['num', 'name'],
  data () {
    return {}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .badge {
    margin-right: 5px;
  }
</style>
