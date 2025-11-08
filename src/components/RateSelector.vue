<script setup lang="ts">
import { useRate } from '../composables/rates';

const { rate, setRate } = useRate();
</script>

<template>
  <div>
    <select id="rate_selector" :value="rate.name" @change="event => setRate((event.target as HTMLSelectElement).value)">
      <option>F2</option>
      <option>F3</option>
    </select>
  </div>
</template>
