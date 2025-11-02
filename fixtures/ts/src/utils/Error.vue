<template>
    <div></div>
    <!-- [TEST] normally execute in files with parsing errors only inside the template tag -->
    <!-- < -->
</template>

<script lang="ts" setup>
// [TEST] normally not execute in files with parsing errors inside the script tag

const aa "fdf";

// [TEST] normally not execute when there are any parsing errors
// [TEST] normally not execute at the time when the parsing errors are fixed
// [TEST] normally execute after the parsing errors are fixed
// function newFunction() {
//   console.log("newFunction called");
// }
</script>