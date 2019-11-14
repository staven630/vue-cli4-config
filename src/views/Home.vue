<template>
  <div class="home">
    <!-- template中使用环境变量 -->
    API: {{api}}
    <br>
    {{name}}
    <img alt="Vue logo"
         src="@/assets/logo.png">
    <svg-icon icon-class="password"></svg-icon>
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

import axios from 'axios'

export default {
  name: 'home',
  components: {
    HelloWorld
  },
  data() {
    return {
      api: process.env.VUE_APP_API,
      name: ''
    }
  },
  mounted() {
    // js代码中使用环境变量
    console.log("BASE_URL: ", process.env.BASE_URL);
    console.log("VUE_APP_API: ", process.env.VUE_APP_API);

    axios.get('/api/1').then(res => {
      console.log('proxy:', res);
    })

  }
}
</script>


<style>
.nihao {
  background: blue;
}
</style>