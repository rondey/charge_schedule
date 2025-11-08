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
  <div>
    <input type="number" id="percentage" v-model.number="percentage" /> %
  </div>
  <div>
    <input type="time" id="dateStart" :value="format(dateStart, 'HH:mm')" @input="event => {
      const inputValue = (event.target as HTMLSelectElement).value;
      const [hours, minutes] = inputValue.split(':').map(Number);
      dateStart = roundToHalfHour(setTime(new Date(), hours || 0, minutes || 0));
    }" />
  </div>
  <p>Charge until: <b>{{ format(dateEnd, "HH:mm") }}</b></p>

  <p v-if="percentageHourSuggested > 0"><b>WARNING:</b> You should
    stop at <b>{{ rate.endHour }}</b> with a state of charge of <b>{{ percentageHourSuggested }}</b></p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
