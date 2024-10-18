import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type LocationType = {
  name: string | undefined;
  lat: number | undefined;
  lon: number | undefined;
};

export function formatDate(format?: "h" | "d") {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  if (format == "d") return `${year}-${month}-${day}`;
  else if (format == "h") return `${year}-${month}-${day}T${hour}:00`;
  else return `${year}-${month}-${day}T${hour}:${minute}`;
}

export type DailyWeatherType = {
  temperature_2m_max: number;
  temperature_2m_min: number;
  apparent_temperature_max: number;
  apparent_temperature_min: number;
  sunrise: string;
  sunset: string;
  precipitation_sum: number;
  wind_speed_10m_max: number;
};

export type HourlyType = {
  temperature_2m: number;
  relative_humidity_2m: number;
  dew_point_2m: number;
  apparent_temperature: number;
  rain: number;
  showers: number;
  snowfall: number;
  snow_depth: number;
  weather_code: number;
  surface_pressure: number;
  cloud_cover: number;
  cloud_cover_low: number;
  cloud_cover_mid: number;
  cloud_cover_high: number;
  wind_speed_10m: number;
  wind_speed_80m: number;
  temperature_80m: number;
  is_day: number;
  lightning_potential: number;
};

export type HourlyUnitsType = {
  temperature_2m: string;
  relative_humidity_2m: string;
  dew_point_2m: string;
  apparent_temperature: string;
  rain: string;
  showers: string;
  snowfall: string;
  snow_depth: string;
  weather_code: string;
  surface_pressure: string;
  cloud_cover: string;
  cloud_cover_low: string;
  cloud_cover_mid: string;
  cloud_cover_high: string;
  wind_speed_10m: string;
  wind_speed_80m: string;
  temperature_80m: string;
  is_day: string;
  lightning_potential: string;
};

export type HourlyWeatherType = {
  [key: string]: HourlyType;
};

export const getWW = () => {
  if (typeof window !== "undefined") {
    const w = window.innerWidth;
    const ww = 
      w >= 1536
        ? "2xl"
        : w >= 1280
        ? "xl"
        : w >= 1024
        ? "lg"
        : w >= 768
        ? "md"
        : w >= 640
        ? "sm"
        : ""
    return ww;
  }
  return "lg";
};

export const getTempColor = (temp: number) => {
  const hot = 40;
  const warm = 24;
  const cold = -5;

  // let r, g, b;

  const maxTemp = 40;
  const minTemp = -5;
  const r = (255 / (maxTemp - minTemp)) * (temp - minTemp);
  const b = (255 / (maxTemp - minTemp)) * (maxTemp - temp);

  // if (temp <= cold) {
  //   b = 255;
  // } else if (temp >= hot) {
  //   r = 255;
  // } else if (temp <= warm) {
  //   const ratio = (temp - cold) / (warm - cold);
  //   r = Math.round(0 + (255 - 0) * ratio);
  //   g = Math.round(0 + (255 - 0) * ratio);
  //   b = Math.round(255 + (0 - 255) * ratio);
  // } else {
  //   const ratio = (temp - warm) / (hot - warm);
  //   r = Math.round(255 + (255 - 255) * ratio);
  //   g = Math.round(255 + (0 - 255) * ratio);
  //   b = Math.round(0 + (0 - 0) * ratio);
  // }

  // if (!r) r = 0;
  // if (!g) g = 0;
  // if (!b) b = 0;
  return `rgb(${r}, 0, ${b})`;
};
