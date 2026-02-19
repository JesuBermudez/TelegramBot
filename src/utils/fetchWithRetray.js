import axios from "axios";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(url, retries = 3, delay = 3000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 50000,
      });
    } catch (error) {
      const isTimeout = error.code === "ECONNABORTED";

      if (i < retries && isTimeout) {
        console.log(`Timeout... reintentando (${i + 1}/${retries})`);
        await sleep(delay);
        continue;
      }

      console.log("Error final:", error); // si no es timeout o ya no quedan intentos
    }
  }
}
