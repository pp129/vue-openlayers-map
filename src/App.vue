<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
html,body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
ul,li{
  list-style: none;
  margin: 0;
  padding: 0;
}
li{
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}
</style>
