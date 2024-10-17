"use client";
import React, { useEffect, useState } from "react";
import {
  DailyWeatherType,
  formatDate,
  HourlyWeatherType,
  HourlyUnitsType,
} from "@/lib/utils";
import { DailyWeatherCarousel } from "@/components/my-ui/daily-weather";
import { HourlyWeather, TestColor } from "@/components/my-ui/hourly-weather";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Page() {
  const [data, setData] = useState<any>(undefined);
  const [daily, setDaily] = useState<DailyWeatherType[]>([]);
  const [hourly, setHourly] = useState<HourlyWeatherType>();
  const [hourlyUnits, setHourlyUnits] = useState<HourlyUnitsType>();

  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const getData = async (
    lat: number = 52.49779835,
    lon: number = 13.466785458352375
  ) => {
    try {
      // TODO Bekomme lat, lon oder name und setze ein
      const response = await fetch(
        `http://localhost:3000/api?a=getData&lat=${lat}&lon=${lon}`
      );
      if (!response.ok) {
        console.log("Error:", response.status);
        return;
      }
      const data = await response.json();
      if (!data.error) {
        data.result.day = weekday[new Date().getDay()];
        setData(data.result);
      } else {
        console.info("--------------api error-------------");
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!data) return;
    setDaily(data.weather.daily.data);
    setHourly(data.weather.hourly.data[formatDate("d")]);
    setHourlyUnits(data.weather.hourly.units);
  }, [data]);

  return (
    <div className="w-screen h-screen flex items-center gap-5 flex-col">
      {data && daily ? (
        <>
          <h1 className="text-2xl font-bold mt-28">{data.location.name}</h1>
          <AlertDialog>
            <AlertDialogTrigger>Ändere Ort</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Gib die </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                  <Input type="number" placeholder="lat" />
                  <Input type="number" placeholder="lon" />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <TestColor />
          <div className="w-3/4 flex flex-col gap-5">
            <DailyWeatherCarousel setDate={() => console.log} daily={daily} />
            <HourlyWeather units={hourlyUnits} weather={hourly} />
          </div>
        </>
      ) : (
        <span>Laden...</span>
      )}
    </div>
  );
}
