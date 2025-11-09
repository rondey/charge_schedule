<script setup lang="ts">
import { useRate } from '../composables/rates';

const { rate, setRate } = useRate();
</script>

<template>
  <div class="form-floating">
    <select id="rate_selector" class="form-control" :value="rate.name"
      @change="event => setRate((event.target as HTMLSelectElement).value)">
      <option>F2</option>
      <option>F3</option>
    </select>
    <label for="rate_selector">Rate selector</label>
  </div>
</template>
