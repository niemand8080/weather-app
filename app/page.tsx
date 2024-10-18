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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Cloudy, CloudSun, CloudSunRain, LoaderCircle } from 'lucide-react';

export default function Page() {
  const [data, setData] = useState<any>(undefined);
  const [daily, setDaily] = useState<DailyWeatherType[]>([]);
  const [hourly, setHourly] = useState<HourlyWeatherType>();
  const [hourlyUnits, setHourlyUnits] = useState<HourlyUnitsType>();
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [name, setName] = useState<string>();
  const [first, setFirst] = useState<boolean>(true);
  const [current, setCurrent] = useState<{
    lon?: number;
    lat?: number;
    name?: string;
  }>();
  const [searchWName, setSearchWName] = useState<boolean>(false);
  const [currentWeather, setCurrentWeather] = useState<any>();
  const [icon, setIcon] = useState<"sun" | "sun-cloud" | "cloud" | "cloud-sun-rain" | "cloud-rain">("sun");

  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const getData = async () => {
    if (
      !longitude ||
      !latitude ||
      latitude >= 90 ||
      latitude <= -90 ||
      longitude >= 180 ||
      longitude <= -180
    ) {
      alert(
        `Bitte setze Längen- und Breitengrad
        Breiten. von -180 bis 180
        Längen. von -90 bis 90
        lat: ${latitude}
        lon: ${longitude}`
      );
      return;
    }
    if (
      current &&
      current.lat == latitude &&
      current.lon == longitude &&
      current.name == name
    )
      return;
    try {
      const query = searchWName
        ? `http://localhost:3000/api?a=getData&name=${encodeURI(name || "")}`
        : `http://localhost:3000/api?a=getData&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(query);
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

  const getCurrent = async (name: string, latitude: number, longitude: number) => {
    if (
      !longitude ||
      !latitude ||
      !name
    ) {
      alert(`Bitte setze name, Breiten- und Längengrad`);
      return;
    }
    if (
      current &&
      current.lat == latitude &&
      current.lon == longitude &&
      current.name == name
    )
      return;
    try {
      const query = `http://localhost:3000/api?a=getData&lat=${latitude}&lon=${longitude}&name=${encodeURI(name || "")}`;
      const response = await fetch(query);
      if (!response.ok) {
        console.log("Error:", response.status);
        return;
      }
      const data = await response.json();
      console.log(data);
      if (!data.error) {
        // data.result.day = weekday[new Date().getDay()];
        // setCurrentWeather(data.result);
      } else {
        console.info("--------------api error-------------");
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const setLatLon = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          setLatitude(lat);
          setLongitude(long);
        },
        () => {
          alert("Error getting location... using default");
        }
      );
    } else {
      alert(
        "It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it."
      );
    }
    if (!longitude && !latitude) {
      setLatitude(52.49779835);
      setLongitude(13.466785458352375);
    }
  };

  useEffect(() => {
    setLatLon();
  }, []);

  useEffect(() => {
    if (!first || !latitude || !longitude) return;
    getData();
    setFirst(false);
  }, [latitude, longitude]);

  useEffect(() => {
    if (!data) return;
    setName(data.location.name);
    setCurrent({
      name: data.location.name,
      lat: latitude,
      lon: longitude,
    });
    setDaily(data.weather.daily.data);
    setHourly(data.weather.hourly.data[formatDate("d")]);
    setHourlyUnits(data.weather.hourly.units);
    getCurrent(data.location.name, latitude || 0, longitude || 0);
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const sunshine = data.weather.daily.data[formatDate("d")].sunshine_duration;
    const rain = data.weather.daily.data[formatDate("d")].precipitation_sum;
    if (sunshine <= 2000 && rain > 5) {
      setIcon("cloud-rain")
    } else if (sunshine <= 2500 && rain > 5) {
      setIcon("cloud-sun-rain");
    } else if (sunshine < 2000) {
      setIcon("cloud");
    } else if (sunshine < 3000) {
      setIcon("sun-cloud");
    }
  }, [currentWeather]);

  return (
    <div className="w-screen h-screen overflow-x-hidden flex items-center gap-5 flex-col">
      {data && daily ? (
        <>
          <div className="text-primary mt-20">
            {icon == "sun-cloud" ? (
              <CloudSun size={100} />
            ) : icon == "cloud" ? (
              <Cloudy size={100} />
            ) : icon == "cloud-rain" ? (
              <CloudSunRain size={100} />
            ) : (
              <Sun size={100} />
            )}
          </div>
          <h1 className={`text-2xl font-bold`}>{name}</h1>
          <AlertDialog>
            <AlertDialogTrigger>Ort Ändern</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Stand Ort</AlertDialogTitle>
                <AlertDialogDescription className="gap-2 flex flex-col">
                  <Tabs
                    defaultValue="grad"
                    className="w-full"
                    onValueChange={(value) => setSearchWName(value === "name")}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="grad">Grad</TabsTrigger>
                      <TabsTrigger value="name">Name</TabsTrigger>
                    </TabsList>
                    <TabsContent className="flex flex-col gap-2" value="grad">
                      Gib den Längen- und Breitengrad des gewünschten Ortes an.
                      <label htmlFor="lat">Breitengrad</label>
                      <Input
                        id="lat"
                        onChange={(e) => setLatitude(Number(e.target.value))}
                        value={latitude}
                        min={-90}
                        max={90}
                        type="number"
                        placeholder="Breitengrad"
                      />
                      <label htmlFor="lon">Längengrad</label>
                      <Input
                        id="lon"
                        onChange={(e) => setLongitude(Number(e.target.value))}
                        value={longitude}
                        min={-180}
                        max={180}
                        type="number"
                        placeholder="Längengrad"
                      />
                    </TabsContent>

                    <TabsContent className="flex flex-col gap-2" value="name">
                      Gib den Namen des gewünschten Ortes an.
                      <label htmlFor="name">Ort</label>
                      <Input
                        id="name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        type="text"
                        placeholder="Berlin, Germany"
                      />
                    </TabsContent>
                  </Tabs>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setName(current && current.name);
                    setLatitude(current && current.lat);
                    setLongitude(current && current.lon);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => getData()}>
                  Ändern
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="w-3/4 flex flex-col gap-5">
            <DailyWeatherCarousel setDate={() => console.log} daily={daily} />
            <HourlyWeather units={hourlyUnits} weather={hourly} />
          </div>
          <TestColor />
        </>
      ) : (
        <div className="h-screen items-center flex">
          <LoaderCircle className="animate-spin" />
        </div>
      )}
    </div>
  );
}
