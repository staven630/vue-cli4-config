<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "home",
  components: {
    HelloWorld
  },
  mounted() {
    console.log(process.env.VUE_APP_SRC);
  }
};
</script>
<style lang="scss">
  .home {
    background: url('../assets/400.png');
  }
</style>
