import { writable, type Writable } from "svelte/store";

// 1. Definizione delle classi e dei tipi (identica a Vue)

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

// 2. Creazione dello Store Svelte Writable
// Inizializziamo lo store con una tariffa predefinita (F2).
const initialRate: Rate = F2;
export const rate: Writable<Rate> = writable(initialRate);

// 3. Logica di inizializzazione e persistenza (simulando onMounted e watch)
// Questo codice viene eseguito una sola volta all'avvio del modulo.

/**
 * Funzione per inizializzare lo store recuperando il valore da localStorage.
 * Dovrebbe essere chiamata all'inizio della tua applicazione Svelte.
 */
function initRateStore() {
  // La logica di Svelte è asincrona con l'accesso al DOM, quindi è sicuro usare localStorage.
  if (typeof window !== "undefined") {
    const localRateName = localStorage.getItem("rate");
    let initialValue: Rate = F2;

    if (localRateName === "F3") {
      initialValue = F3;
    }

    // Imposta il valore iniziale dello store Svelte
    rate.set(initialValue);

    // 4. Sottoscrizione per la persistenza (equivalente a 'watch')
    // Quando lo store 'rate' cambia, aggiorna localStorage.
    rate.subscribe((currentRate) => {
      // Controlla per evitare errori durante il rendering lato server (SSR)
      if (typeof window !== "undefined") {
        localStorage.setItem("rate", currentRate.name);
      }
    });
  }
}

// Chiama la funzione di inizializzazione
initRateStore();

// 5. Funzione per aggiornare la tariffa (equivalente a 'setRate')

/**
 * Aggiorna lo store 'rate' in base al nome della nuova tariffa.
 * @param newRateName Il nome della nuova tariffa ('F2' o 'F3').
 */
export function setRate(newRateName: string): void {
  let newRate: Rate;
  if (newRateName === "F2") {
    newRate = F2;
  } else if (newRateName === "F3") {
    newRate = F3;
  } else {
    // Opzionale: gestire un nome non valido
    console.warn(`Tariffa non valida: ${newRateName}`);
    return;
  }

  // Aggiorna il valore dello store
  rate.set(newRate);
}
