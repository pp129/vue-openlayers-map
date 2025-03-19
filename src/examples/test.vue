<template>
  <div class="test">{{ msg }}</div>
</template>

<script>
export default {
  name: "com-test",
  props: {
    msg: String,
  },
  methods: {
    getMsg() {
      return this.msg;
    },
  },
};
</script>

<style scoped></style>
