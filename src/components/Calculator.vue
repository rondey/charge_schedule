<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { format, roundToNearestMinutes, setHours, setMinutes, addMinutes, nextMonday, differenceInMinutes } from "date-fns"
import { useRate } from '../composables/rates'

const percentage = ref(0)
const { rate } = useRate()
const dateStart = ref(new Date())
const dateEnd = ref(new Date())
const percentageHourSuggested = ref(0)

const maxPercentage = 80
const hourlyPercentage = 4.43

function roundToHalfHour(date: Date): Date {
  return roundToNearestMinutes(date, { nearestTo: 30 })
}

function setTime(date: Date, hours: number, minutes: number = 0): Date {
  return setHours(setMinutes(date, minutes), hours)
}

function calculateEndDate(): void {
  const minutelyPercentage = hourlyPercentage / 60
  const totalMinutes = Math.floor((maxPercentage - percentage.value) / minutelyPercentage)


  dateEnd.value = roundToHalfHour(addMinutes(dateStart.value, totalMinutes))
  if (dateEnd.value.getHours() + (dateEnd.value.getMinutes() > 0 ? 1 : 0) > rate.value.endHour && !(rate.value.holydays.includes(dateEnd.value.getDay()))) {
    // Calculate the percentage of battery charged until the rate end hour
    const minutesUntilEndHour = differenceInMinutes(dateEnd.value, setTime(dateEnd.value, rate.value.endHour))
    percentageHourSuggested.value = 80 - Math.floor(minutesUntilEndHour * minutelyPercentage)
  } else {
    percentageHourSuggested.value = 0
  }
}

watchEffect(() => {
  calculateEndDate()
})

onMounted(() => {
  // const now = new Date()
  // const now = setHours(new Date(), 1) // For testing purposes, set current time to 01:xx
  const now = nextMonday(new Date()) // For testing purposes, set current time to next Monday

  const nowHours = now.getHours()
  if (nowHours > 23 || nowHours < rate.value.endHour) {
    // Round up to nearest half hour (e.g., 00:00, 00:30, 01:00, etc.)
    dateStart.value = roundToHalfHour(now)
  } else {
    // Set to 23:00 today
    dateStart.value = setTime(now, 23, 0)
  }
});



</script>

<template>
  <div class="form-floating input-group mb-3">
    <input type="number" id="percentage" class="form-control" v-model.number="percentage" />
    <span class="input-group-text" id="percentage-symbol">%</span>
    <label for="percentage">Current State of Charge</label>
  </div>
  <div class="form-floating  mb-3">
    <input type="time" id="dateStart" class="form-control" :value="format(dateStart, 'HH:mm')" @input="event => {
      const inputValue = (event.target as HTMLSelectElement).value;
      const [hours, minutes] = inputValue.split(':').map(Number);
      dateStart = roundToHalfHour(setTime(new Date(), hours || 0, minutes || 0));
    }" />
    <label for="dateStart">Date Start</label>
  </div>

  <div class="card border-success text-center mt-3 mb-3 shadow-sm">
    <div class="card-body py-2">
      <h5 class="card-title text-success mb-0">
        🔋 Charge until: <span class="badge bg-success fs-4">{{ format(dateEnd, "HH:mm") }} <i
            class="bi bi-clock"></i></span>
      </h5>
    </div>
  </div>

  <div class="alert alert-warning text-center" v-if="percentageHourSuggested > 0"><b>WARNING:</b> You should
    stop at <b>0{{ rate.endHour }}:00</b> with a state of charge of
    <p>
      <span class="badge bg-warning fs-4">{{
        percentageHourSuggested }}%</span>
    </p>
  </div>
</template>