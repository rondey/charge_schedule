import { onMounted, ref, watch, type Ref } from "vue";

export type RateName = "F2" | "F3";

export class Rate {
  public readonly name: RateName;
  public readonly startHour: number;
  public readonly endHour: number;
  public readonly holydays: number[];

  constructor(
    name: RateName,
    startHour: number,
    endHour: number,
    holydays: number[]
  ) {
    this.name = name;
    this.startHour = startHour;
    this.endHour = endHour;
    this.holydays = holydays;
  }
}

export const F2 = new Rate("F2", 19, 8, [0, 6]);
export const F3 = new Rate("F3", 23, 7, [0]);

const rate = ref<Rate>(F2);

// by convention, composable function names start with "use"
export function useRate(): {
  rate: Ref<Rate>;
  setRate: (newRate: string) => void;
} {
  // a composable can update its managed state over time.
  function setRate(newRate: string) {
    if (newRate === "F2") {
      rate.value = F2;
    } else {
      rate.value = F3;
    }
  }

  //setting in local storage the rate
  watch(rate, (newRate: Rate) => {
    localStorage.setItem("rate", newRate.name);
  });

  onMounted(() => {
    const localRate = localStorage.getItem("rate");
    if (localRate === "F3") {
      rate.value = F3;
    } else {
      rate.value = F2;
    }

    if (!localRate) {
      localStorage.setItem("rate", rate.value.name);
    }
  });

  // expose managed state as return value
  return { rate, setRate };
}
