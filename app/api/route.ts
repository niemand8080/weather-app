import { LocationType } from '@/lib/utils'
import fs from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

let last = { action: "", time: 0 };

export async function GET(req: NextRequest): Promise<Response> {
  const now = new Date().getTime();
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("a");
    
    // if (last.action == action && last.time > now - 100) return NextResponse.json({ error: 'To fast call' }, { status: 425 });
    
    last.time = now;
    last.action = action || "";
    
    if (action === "getData") {
      const lat = (searchParams.get("lat") || undefined) as number | undefined;
      const lon = (searchParams.get("lon") || undefined) as number | undefined;
      const name = searchParams.get("name") || undefined;
      const location = { lat, lon, name };
      if (!location) return NextResponse.json({ error: "Invailed location" })
      return NextResponse.json({ result: await getData(location) }, { status: 200 });
    } else if (action === "getCurrent") {
      const lat = (searchParams.get("lat") || undefined) as number | undefined;
      const lon = (searchParams.get("lon") || undefined) as number | undefined;
      const name = searchParams.get("name") || undefined;
      const location = { lat, lon, name };
      if (!name || !lon || !lat) return NextResponse.json({ error: "Invailed location, enter name/lat and lon" })
      return NextResponse.json({ result: await getData(location) }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Bad Request' });
  }
}

async function getJSONFile(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    const file = fs.readFileSync(filePath, "utf8");
    // const file = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(file);
  } catch (error) {
    console.log("Error: ", error);
    return {};
  }
}

async function getCurrent(location: LocationType) {
  const { name, lat, lon } = location;
  if (!name || !lat || !lon) return {};
  const currentJson = await getJSONFile("current.json");
  const now = Math.floor(new Date().getTime() / (1000 * 60 * 60));
  let data = currentJson[name];

  if (!data || data.expiry <= now) {
    try {
      console.log("GET from API");
      data = await addCurrent(data, name, lat, lon);
    } catch (error) {
      console.log("Error: ", error);
    }
  }
  return data;
}
async function getData(location: LocationType) {
  const { name, lat, lon } = location;
  const json = await getJSONFile("data.json");
  const now = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
  let locName = name || "";
  let locLat = 0;
  let locLon = 0;
  if (name) {
    const loc = await getLocationFromName(name);
    locName = loc.features[0].properties.formatted;
    locLat = loc.features[0].properties.lat;
    locLon = loc.features[0].properties.lon;
  } else {
    const locationData = await getLocation(lat || 52.52, lon || 13.41);
    locName =
      locationData && locationData.results
        ? locationData.results[0].address_line2
        : name;
    locLat = locationData.results[0].lat;
    locLon = locationData.results[0].on;
  }
  let data = json[locName];

  if (!data || data.expiry <= now) {
    try {
      console.log("GET from API");
      data = await addData(json, locLat || lat, locLon || lon);
    } catch (error) {
      console.log("Error: ", error);
    }
  }
  return data;
}

async function getCurrentWeather(lat:  number, lon: number) {
  const current = await api(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&forecast_days=1&models=icon_seamless`
  );
  return current;
}
async function getWeather(lat: number, lon: number) {
  const weather = await api(`
    https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,rain,showers,snowfall,snow_depth,weather_code,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_speed_80m,temperature_80m,is_day,lightning_potential&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,precipitation_sum,rain_sum,showers_sum,snowfall_sum,wind_speed_10m_max&timezone=Europe%2FBerlin&past_days=1&past_hours=24&forecast_hours=24&models=icon_seamless
  `);
  return weather;
}
async function getLocation(lat: number, lon: number) {
  const location = await api(
    `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${process.env.GEOAPIFY_API_KEY}`
  );
  return location;
}
async function getLocationFromName(name: string) {
  const location = await api(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURI(name)}&apiKey=${process.env.GEOAPIFY_API_KEY}`
  );
  return location;
}

async function addCurrent(data: any = {}, locationName: string, lat = 52.52, lon = 13.41) {
  try {
    const current = await getCurrentWeather(lat, lon);
    const newCurrent = {
      expiry: Math.floor((new Date().getTime() + (1000 * 60 * 60)) / (1000 * 60 * 60)),
      current
    };
    const filePath = path.join(process.cwd(), 'data', "current.json");
    data[locationName] = newCurrent;
    fs.promises.writeFile(filePath, JSON.stringify(data));
    return newCurrent;
  } catch (error) {
    console.log("Error: ", error);
    return undefined;
  }
}

async function addData(data: any = {}, lat = 52.52, lon = 13.41) {
  try {
    const location = await getLocation(lat, lon);
    const weather = await getWeather(lat, lon);
    const current = await getCurrentWeather(lat, lon);
    const newCurrent = {
      expiry: Math.floor((new Date().getTime() + (1000 * 60 * 60)) / (1000 * 60 * 60)),
      current
    };
    const newData = {
      expiry: Math.floor((new Date().getTime() + (1000 * 60 * 60 * 24)) / (1000 * 60 * 60 * 24)),
      location: {
        lat: lat,
        lon: lon,
        name: location.results[0].address_line2,
        data: location,
      },
      weather: weather,
    };
    data[location.results[0].address_line2] = newData;
    const filePath = path.join(process.cwd(), 'data', "data.json");
    format(newData);
    fs.promises.writeFile(filePath, JSON.stringify(data));
    return newData;
  } catch (error) {
    console.log("Error: ", error);
    return undefined;
  }
}

async function api(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("Error: ", error);
    return undefined;
  }
}

function format(data: any) {
	const hourly = formatObj(data.weather.hourly_units, data.weather.hourly, data.weather.hourly.time, ["time"]);
	const daily = formatObj(data.weather.daily_units, data.weather.daily, data.weather.daily.time, ["time"]);
  const h = Object.entries(hourly.data);
  const formatedData: { [key: string]: { [key: string]: any } } = {};
  h.forEach(([date, weather]) => {
    const [day, hour] = date.split("T");
    if (!formatedData[day]) formatedData[day] = {};
    const h = hour.startsWith("0") ? hour.slice(1) : hour;
    formatedData[day][h] = weather;
  });
	const formated = { hourly: { units: hourly.units, data: formatedData}, daily };
  data.weather = formated;
}

// [1,2,3,4,5], [{name:temp, values:[4,6,3,5,3]},{name:hum, values:[-2,-3,-7,-5,-6]}]
function formatData(arr: any[], data: { name: string, values: any }[]) { // [{ name, values }] // values shouldbe the same length (as arr)
	const result: { [key: string | number]: any } = {};
	for (var i = 0; i < arr.length; i++) {
		const name = arr[i];
		const values: { [key: string | number]: any } = {};
		for (var j = 0; j < data.length; j++) {
			const dName = data[j].name;
			const value = data[j].values[i];
			values[dName] = value;
		}
		result[name] = values;
	}
	return result
}

function formatObj(objUnits: { [key: string]: string }, objData: { [key: string]: any[] }, formatNames: string[], ignore: string[]) {
	const allUnits = Object.entries(objUnits).filter(e => !ignore.includes(e[0]));
	const units: { [key: string]: string } = {}
	allUnits.forEach((u) => { units[u[0]] = u[1] });
	const data = Object.entries(objData).filter(e => !ignore.includes(e[0])).map((h) => { return { name: h[0], values: h[1] } });
	const formated = formatData(formatNames, data);
	return { data: formated, units }
}