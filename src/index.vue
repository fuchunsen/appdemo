<template>
  <div class="container">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      logo: 'https://gw.alicdn.com/tfs/TB1yopEdgoQMeJjy1XaXXcSsFXa-640-302.png'
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
  }
</style>
