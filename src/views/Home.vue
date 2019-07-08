<template>
  <div class="home"></div>
</template>

<script>
import axios from "axios";
export default {
  name: "home",
  mounted() {
    axios.get("/api/1").then(res => {
      console.log(res);
    });
  }
};
</script>
