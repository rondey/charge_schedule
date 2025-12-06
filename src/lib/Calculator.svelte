<script lang="ts">
  import { onMount } from "svelte";
  import {
    format,
    roundToNearestMinutes,
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
      const dateEndRate = new Date(dateEnd);
      dateEndRate.setHours($rate.endHour);

      // Calcola i minuti eccedenti l'orario di fine tariffa
      const minutesUntilEndHour = differenceInMinutes(dateEnd, dateEndRate);

      // Calcola la percentuale di carica raggiunta all'orario di fine tariffa
      // sottraendo la carica in eccesso (minutesUntilEndHour * minutelyPercentage) dall'obiettivo (maxPercentage)
      percentageHourSuggested =
        maxPercentage - Math.floor(minutesUntilEndHour * minutelyPercentage);
    } else {
      percentageHourSuggested = 0;
    }
  }

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

    const dateStartToRound = new Date();
    dateStartToRound.setHours(hours, minutes);

    // Imposta e arrotonda la nuova data di inizio
    dateStart = roundToHalfHour(dateStartToRound);
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
      dateStart = new Date(now);
      dateStart.setHours(23, 0);
    }
  });
</script>

<div class="input mb-3">
  <div class="input-floating grow">
    <input type="number" id="percentage" class="grow" bind:value={percentage} />
    <label class="input-floating-label ms-0" for="percentage"
      >Current State of Charge</label
    >
  </div>
  <span
    class="text-base-content/80 my-auto ms-3 shrink-0"
    id="percentage-symbol">%</span
  >
</div>

<div class="input mb-3">
  <div class="input-floating grow">
    <!-- Padding top used to fix the position in iOS devices-->
    <input
      type="time"
      id="dateStart"
      class="grow"
      style="padding-top: 5px;"
      value={format(dateStart, "HH:mm")}
      on:input={handleDateStartInput}
    />
    <label class="input-floating-label ms-0" for="dateStart">Date Start</label>
  </div>
  <span class="text-base-content/80 my-auto ms-3 shrink-0" id="clock-symbol">
    <span class="icon-[solar--clock-circle-linear]"></span>
  </span>
</div>

<div class="alert alert-soft alert-success text-center mt-3 mb-3 shadow-sm">
  <div class="py-2">
    <h5 class="text-success mb-0">
      🔋 Charge until:
      <span class="badge badge-success badge-xl">
        {format(dateEnd, "HH:mm")}
        <span class="icon-[solar--clock-circle-linear]"></span>
      </span>
    </h5>
  </div>
</div>

{#if percentageHourSuggested > 0}
  <div class="alert alert-soft alert-warning text-center mb-3">
    <b>WARNING:</b> You should stop at <b>0{$rate.endHour}:00</b> with a state
    of charge of
    <span class="badge badge-warning badge-xl">
      {percentageHourSuggested}%
    </span>
  </div>
{/if}
