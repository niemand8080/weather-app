"use client";
import React, { useEffect, useState } from "react";
import { HourlyUnitsType, HourlyWeatherType, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Thermometer,
  Droplet,
  CloudRain,
  CloudSnow,
  Cloud,
  Sun,
  Moon,
  CloudDrizzle,
  Wind,
  BarChart2,
  Zap,
  Waves,
  ArrowUpFromLine,
  CloudRainWind,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tempToColor } from "temp-color";

export const HourlyWeather: React.FC<{
  weather: HourlyWeatherType | undefined;
  units: HourlyUnitsType | undefined;
}> = ({ weather, units }) => {
  if (!weather) return <span>Loading...</span>;
  const displayDate = new Date(formatDate("d")).toLocaleDateString("de-DE", {
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

  const [formated, setFormated] = useState<{
    [key: string]: { [key: string]: number };
  }>();

  useEffect(() => {
    const formatedw: { [key: string]: { [key: string]: number } } = {};
    Object.entries(weather).map(([time, values]) => {
      Object.entries(values).forEach(([lable, entry]) => {
        if (!formatedw[lable]) formatedw[lable] = {};
        formatedw[lable][time] = entry;
      });
    });
    setFormated(formatedw);
  }, [weather]);

  if (!formated) return;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heute</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div></div>
            <div className="flex w-[73%] justify-between">
              <span className="text-zinc-500">0:00</span>
              <span className="text-zinc-500">23:00</span>
            </div>
          </div>
          <Item
            type="temp"
            obj={formated.temperature_2m}
            name="Temperatur"
            unit={units?.temperature_2m}
          >
            <Thermometer className="w-5 h-5" />
          </Item>
          <Item
            type="temp"
            obj={formated.temperature_80m}
            name="Temperatur (80m)"
            unit={units?.temperature_80m}
          >
            <Thermometer className="w-5 h-5" />
          </Item>
          <Item
            type="temp"
            obj={formated.apparent_temperature}
            name="Gefühlte Temperatur"
            unit={units?.apparent_temperature}
          >
            <Waves className="w-5 h-5" />
          </Item>
          <Item
            type="hum"
            obj={formated.relative_humidity_2m}
            name="Relative Luftfeuchtigkeit"
            unit={units?.relative_humidity_2m}
          >
            <Droplet className="w-5 h-5" />
          </Item>
          <Item
            type="temp"
            obj={formated.dew_point_2m}
            name="Taupunkt"
            unit={units?.dew_point_2m}
          >
            <Thermometer className="w-5 h-5" />
          </Item>
          <Item type="rain" obj={formated.rain} name="Rain" unit={units?.rain}>
            <CloudRain className="w-5 h-5" />
          </Item>
          {Object.values(formated.rain).sort((a, b) => b - a)[0] > 20 && (
            <Item
              type="storm"
              obj={formated.rain}
              name="Sturm"
              unit={units?.rain}
            >
              <CloudRainWind className="w-5 h-5" />
            </Item>
          )}
          <Item obj={formated.showers} name="Wechselwetter" unit={units?.showers}>
            <CloudDrizzle className="w-5 h-5" />
          </Item>
          <Item obj={formated.snowfall} name="Schnee" unit={units?.snowfall}>
            <CloudSnow className="w-5 h-5" />
          </Item>
          <Item
            obj={formated.snow_depth}
            name="Schnee Tiefe"
            unit={units?.snow_depth}
          >
            <ArrowUpFromLine className="w-5 h-5" />
          </Item>
          <Item
            unit={units?.surface_pressure}
            obj={formated.surface_pressure}
            name="Luft Druck"
          >
            <BarChart2 className="w-5 h-5" />
          </Item>
          <Item
            obj={formated.cloud_cover}
            name="Wolkendecke"
            unit={units?.cloud_cover}
          >
            <Cloud className="w-5 h-5" />
          </Item>
          <Item
            obj={formated.cloud_cover_low}
            name="Wolkendecke niedrig"
            unit={units?.cloud_cover_low}
          >
            <Cloud className="w-5 h-5" />
          </Item>
          <Item
            obj={formated.cloud_cover_mid}
            name="Wolkendecke Mitte"
            unit={units?.cloud_cover_mid}
          >
            <Cloud className="w-5 h-5" />
          </Item>
          <Item
            obj={formated.cloud_cover_high}
            name="Wolkendecke hoch"
            unit={units?.cloud_cover_high}
          >
            <Cloud className="w-5 h-5" />
          </Item>
          <Item
            obj={formated.wind_speed_10m}
            name="Windgeschwindigkeit (10m)"
            unit={units?.wind_speed_10m}
          >
            <Wind className="w-5 h-5" />
          </Item>
          <Item
            obj={formated.wind_speed_80m}
            name="Windgeschwindigkeit (80m)"
            unit={units?.wind_speed_80m}
          >
            <Wind className="w-5 h-5" />
          </Item>
          <Item
            unit={units?.is_day}
            obj={formated.is_day}
            name="Tag/Nacht"
          >
            {formated.is_day ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Item>
          <Item
            obj={formated.lightning_potential}
            name="Blitz Warsch."
            unit={units?.lightning_potential}
          >
            <Zap className="w-5 h-5" />
          </Item>
        </div>
      </CardContent>
    </Card>
  );
};

type ItemType = "temp" | "hum" | "rain" | "storm";

export const Item: React.FC<{
  obj: { [key: string]: number };
  name: string;
  unit: string | undefined;
  children: React.ReactNode;
  type?: ItemType;
}> = ({ type, obj, name, unit, children }) => {
  const getMinMax = (obj: {
    [key: string]: number;
  }): { max: number; min: number } => {
    const values = Object.values(obj);
    const sorted = values.sort((a, b) => a - b);
    return { min: sorted[0], max: sorted.reverse()[0] };
  };
  return (
    <div className="flex items-center justify-between w-full">
      <Tooltip>
        <TooltipTrigger>
          <span className="flex gap-2 items-center">
            {children}
            <span>{name}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {getMinMax(obj).min}
          {unit || ""}
          {" - "}
          {getMinMax(obj).max}
          {unit || ""}
        </TooltipContent>
      </Tooltip>
      {type != undefined ? (
        <ColorBar type={type} values={obj} unit={unit || ""} />
      ) : // <HourlyChart />
      null}
    </div>
  );
};

export const ColorBar: React.FC<{
  values: { [key: string]: number };
  type: ItemType;
  unit: string;
}> = ({ values, type, unit }) => {
  const percentage = 100 / Object.values(values).length;
  return (
    <div className="flex w-[70%] flex-col relative justify-center mr-5">
      <div className="w-full flex mx-auto h-4 rounded-full my-px overflow-hidden">
        {Object.entries(values).map(([time, value], index) => {
          const { r, g, b } = tempToColor(value, -5, 40);
          let color = `rgb(${r}, ${g}, ${b})`;

          if (type == "hum") {
            color = `hwb(${value * 3.6} ${100 - value}% 0%)`;
          } else if (type == "rain") {
            color = `hsl(240 100% ${100 - value * 5}%)`;
          } else if (type == "storm") {
            color = `hsl(240 100% ${100 - value * 1.3}%)`;
          }

          return (
            <div
              key={index}
              className="h-full mx-auto"
              style={{ width: `${percentage}%` }}
            >
              <Tooltip>
                <TooltipTrigger
                  className="h-full w-full"
                  style={{ background: color }}
                ></TooltipTrigger>
                <TooltipContent>
                  {time}: {value}
                  {unit}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TestColor = () => {
  const arr = Array.from({ length: 100 }, (value, index) => index);

  return (
    <div className="h-4 w-3/4 flex">
      <div className="w-full flex mx-auto h-4 rounded-full my-px overflow-hidden">
        {arr.map((value, index) => {
          const { r, g, b } = tempToColor(value -5, -5, 40);
          let color = `rgb(${r}, ${g}, ${b})`;

          // color = `hwb(${value * 3.6} ${100 - value}% 0%)`;
          // color = `hsl(${value * 3.6} 100% 50%)`;

          return (
            <div key={index} className="h-full" style={{ width: `1%` }}>
              <Tooltip>
                <TooltipTrigger
                  className="h-full w-full"
                  style={{ background: color }}
                ></TooltipTrigger>
                <TooltipContent>{index - 5}</TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

//!
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { CardDescription, CardFooter } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An area chart with gradient fill";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function HourlyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Gradient</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
