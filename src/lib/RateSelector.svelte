<script lang="ts">
  import { rate, setRate } from "../stores/rateStore"; // Assumendo che il file sia qui

  /**
   * Gestore per l'evento 'change' del tag <select>.
   * La sintassi '$rate' è la comodità di Svelte per leggere il valore dello store.
   */
  function handleRateChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    setRate(selectedValue);
  }
</script>

<div class="input-floating">
  <select
    id="rate_selector"
    class="input"
    value={$rate.name}
    on:change={handleRateChange}
  >
    <option>F2</option>
    <option>F3</option>
  </select>
  <label class="input-floating-label" for="rate_selector">Rate selector</label>
</div>
