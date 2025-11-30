<script lang="ts">
  import { onMount } from "svelte";
  import {
    format,
    roundToNearestMinutes,
    setHours,
    setMinutes,
    addMinutes,
    differenceInMinutes,
  } from "date-fns";

  import { rate } from "../stores/rateStore"; // Importa lo store Writable<Rate>

  // Variabili reattive in Svelte
  let percentage = 0;
  let dateStart = new Date();
  let dateEnd = new Date();
  let percentageHourSuggested = 0;

  const maxPercentage = 80;
  const hourlyPercentage = 4.43;

  /**
   * Arrotonda la data all'ora intera o alla mezz'ora più vicina.
   * @param date La data da arrotondare.
   * @returns La data arrotondata.
   */
  function roundToHalfHour(date: Date): Date {
    return roundToNearestMinutes(date, { nearestTo: 30 });
  }

  /**
   * Imposta l'ora e i minuti di una data.
   * @param date La data di base.
   * @param hours Le ore da impostare.
   * @param minutes I minuti da impostare (default 0).
   * @returns La nuova data con l'ora impostata.
   */
  function setTime(date: Date, hours: number, minutes: number = 0): Date {
    return setHours(setMinutes(date, minutes), hours);
  }

  /**
   * Calcola l'ora di fine della ricarica.
   */
  function calculateEndDate(): void {
    const minutelyPercentage = hourlyPercentage / 60;
    // Calcola i minuti totali necessari per raggiungere maxPercentage
    const totalMinutes = Math.floor(
      (maxPercentage - percentage) / minutelyPercentage
    );

    // Calcola l'ora di fine, arrotondando alla mezz'ora
    dateEnd = roundToHalfHour(addMinutes(dateStart, totalMinutes));

    // Verifica se l'ora di fine supera l'orario di fine tariffa ($rate.endHour)
    // E che non sia un giorno festivo (holydays)
    const isPastEndHour =
      dateEnd.getHours() + (dateEnd.getMinutes() > 0 ? 1 : 0) > $rate.endHour;
    const isHolyday = $rate.holydays.includes(dateEnd.getDay());

    if (isPastEndHour && !isHolyday) {
      // Calcola i minuti eccedenti l'orario di fine tariffa
      const minutesUntilEndHour = differenceInMinutes(
        dateEnd,
        setTime(dateEnd, $rate.endHour)
      );

      // Calcola la percentuale di carica raggiunta all'orario di fine tariffa
      // sottraendo la carica in eccesso (minutesUntilEndHour * minutelyPercentage) dall'obiettivo (maxPercentage)
      percentageHourSuggested =
        maxPercentage - Math.floor(minutesUntilEndHour * minutelyPercentage);
    } else {
      percentageHourSuggested = 0;
    }
  }

  // 👇 CORREZIONE APPLICATA QUI:
  // Dipendenze esplicite per forzare l'aggiornamento quando 'percentage', 'dateStart' o lo store '$rate' cambiano.
  $: percentage, dateStart, $rate, calculateEndDate();

  /**
   * Gestore per l'input 'dateStart' di tipo 'time'.
   * @param event L'evento di input.
   */
  function handleDateStartInput(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    const [hoursStr, minutesStr] = inputValue.split(":");
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;

    // Imposta e arrotonda la nuova data di inizio
    dateStart = roundToHalfHour(setTime(new Date(), hours, minutes));
  }

  // onMounted in Svelte
  onMount(() => {
    const now = new Date();
    const nowHours = now.getHours();

    // Logica per impostare l'ora di inizio. Dipende da $rate.endHour.
    if (nowHours > 23 || nowHours < $rate.endHour) {
      // Arrotonda all'ora/mezz'ora successiva più vicina
      dateStart = roundToHalfHour(now);
    } else {
      // Imposta a 23:00 di oggi
      dateStart = setTime(now, 23, 0);
    }
  });
</script>

<div class="form-floating input-group mb-3">
  <input
    type="number"
    id="percentage"
    class="form-control"
    bind:value={percentage}
  />
  <span class="input-group-text" id="percentage-symbol">%</span>
  <label for="percentage">Current State of Charge</label>
</div>

<div class="form-floating input-group mb-3">
  <input
    type="time"
    id="dateStart"
    class="form-control"
    value={format(dateStart, "HH:mm")}
    on:input={handleDateStartInput}
  />
  <span class="input-group-text" id="clock-symbol"
    ><i class="bi bi-clock"></i></span
  >
  <label for="dateStart">Date Start</label>
</div>

<div class="card border-success text-center mt-3 mb-3 shadow-sm">
  <div class="card-body py-2">
    <h5 class="card-title text-success mb-0">
      🔋 Charge until: <span class="badge bg-success fs-4"
        >{format(dateEnd, "HH:mm")} <i class="bi bi-clock"></i></span
      >
    </h5>
  </div>
</div>

{#if percentageHourSuggested > 0}
  <div class="alert alert-warning text-center">
    <b>WARNING:</b> You should stop at <b>0{$rate.endHour}:00</b> with a state
    of charge of
    <p>
      <span class="badge bg-warning fs-4">{percentageHourSuggested}%</span>
    </p>
  </div>
{/if}
