<script lang="ts">
  import Calculator from "./lib/Calculator.svelte";
  import RateSelector from "./lib/RateSelector.svelte";
</script>

<main>
  <div
    class="min-h-screen flex flex-col items-center justify-center w-full p-4"
  >
    <Calculator />
    <RateSelector />
  </div>
</main>
