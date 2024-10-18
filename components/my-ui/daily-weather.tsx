"use client";
import React, { useEffect, useState } from "react";
import { DailyWeatherType, getWW } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Droplets, Sunrise, Sunset, Thermometer, Wind } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ClassNames from "embla-carousel-class-names";

export const DailyWeather: React.FC<{
  weather: DailyWeatherType;
  date: string;
  current: boolean;
}> = ({ weather, date, current }) => {
  const displayDate = new Date(date).toLocaleDateString("de-DE", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const isNow =
    new Date().toLocaleDateString("de-DE", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }) == displayDate;
  return (
    <Card
      key={date}
      className={`${
        current ? "border-primary" : "opacity-50 pointer-events-none"
      } transition-all duration-300`}
    >
      <CardHeader>
        <CardTitle className={`${current && "text-primary"}`}>
          {isNow ? "Heute" : displayDate}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 flex flex-col">
          <Item tip="Durchsch. Temperature">
            <div className="flex items-center">
              <Thermometer className="w-5 h-5 mr-2" />
              <span>
                {weather.temperature_2m_min}°C - {weather.temperature_2m_max}
                °C
              </span>
            </div>
          </Item>
          <Item tip="Sonnen Aufgang">
            <div className="flex items-center">
              <Sunrise className="w-5 h-5 mr-2" />
              <span>
                {
                  new Date(weather.sunrise)
                    .toLocaleDateString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    .split(",")[1]
                }{" "}
                Uhr
              </span>
            </div>
          </Item>
          <Item tip="Sonnen Untergang">
            <div className="flex items-center">
              <Sunset className="w-5 h-5 mr-2" />
              <span>
                {
                  new Date(weather.sunset)
                    .toLocaleDateString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    .split(",")[1]
                }{" "}
                Uhr
              </span>
            </div>
          </Item>
          <Item tip="Niederschlags Summe">
            <div className="flex items-center">
              <Droplets className="w-5 h-5 mr-2" />
              <span>{weather.precipitation_sum} mm</span>
            </div>
          </Item>
          <Item tip="Durchsch. Windgeschwindigkeit">
            <div className="flex items-center">
              <Wind className="w-5 h-5 mr-2" />
              <span>{weather.wind_speed_10m_max} km/h</span>
            </div>
          </Item>
        </div>
      </CardContent>
    </Card>
  );
};

export const Item: React.FC<{ children: React.ReactNode; tip: string }> = ({
  children,
  tip,
}) => {
  return (
    <div className="hover:text-primary transition-all">
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </div>
  );
};

export const DailyWeatherCarousel: React.FC<{
  daily: DailyWeatherType[];
  setDate: (v: string) => void;
}> = ({ daily, setDate }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const ww = getWW();
    const dCount = ww == "xl" || ww == "2xl" ? 1 : ww == "sm" ? -1 : 0;
    ClassNames({ snapped: "filter-gray", inView: "border-primary" });

    setCurrent(api.selectedScrollSnap() + 1);
    api.scrollNext();

    api.on("select", () => {
      console.log(api.selectedScrollSnap());
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    setDate(Object.keys(daily)[current]);
  }, [current]);

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        {getWW() != "" && getWW() != "sm" && getWW() != "md"  ? (
          <CarouselItem className={`md:basis-1/2 lg:basis-1/3`}>
            <div className="border-accent rounded-lg flex items-center justify-center h-full text-zinc-600">
              ...
            </div>
          </CarouselItem>
        ) : null}
        {Object.entries(daily).map(([date, weather], index) => (
          <CarouselItem key={index} className={`md:basis-1/2 lg:basis-1/3`}>
            <DailyWeather
              current={current == index}
              date={date}
              weather={weather as DailyWeatherType}
            ></DailyWeather>
          </CarouselItem>
        ))}
        {getWW() != "" && getWW() != "sm" && getWW() != "md"  ? (
          <CarouselItem className={`md:basis-1/2 lg:basis-1/3`}>
            <div className="border-accent rounded-lg flex items-center justify-center h-full text-zinc-600">
              ...
            </div>
          </CarouselItem>
        ) : null}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
