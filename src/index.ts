import * as dotenv from "dotenv";
dotenv.config();

import momentTz from "moment-timezone";
import { IgApiClient } from "instagram-private-api";
import { stripIndents } from "common-tags";
import axios, { AxiosError } from "axios";
import Holidays from "date-holidays";

const { IG_USERNAME, IG_PASSWORD, OPENWEATHER_API } = process.env;

const dataLoc = {
  lat: -0.9596188,
  long: 100.3992518,
};

const ig = new IgApiClient();
const hd = new Holidays({ country: "ID" });
hd.setLanguages("id");
hd.setTimezone("Asia/Jakarta");

const setBio = async (ig: IgApiClient) => {
  try {
    let weatherText;
    let holidayText;

    const data = await axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${dataLoc.lat}&lon=${dataLoc.long}&lang=id&units=metric&appid=${OPENWEATHER_API}`
      )
      .then((data) => data.data)
      .catch((err: AxiosError) => err);

    if (data instanceof AxiosError) {
      weatherText = "";
    } else {
      weatherText = `☁️ ${toTitleCase(
        data.weather[0].description
      )}, ${Math.round(Number(data.main.temp))}°C`;
    }

    const holiDate = hd.isHoliday(momentTz().tz("Asia/Jakarta").toISOString());

    if (holiDate) holidayText = `(${holiDate.map((x) => x.name).join(", ")})`;
    else holidayText = "";

    const date = momentTz
      .tz("Asia/Jakarta")
      .locale("ID")
      .format("dddd, DD MMMM YYYY");

    await ig.account.setBiography(stripIndents`
    ✨ Part of smantse   
    🧑‍🤝‍🧑 32 Members
    ${weatherText}
    📅 ${date} ${holidayText}
    `);
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  try {
    ig.state.generateDevice(IG_USERNAME!);

    await ig.account.login(IG_USERNAME!, IG_PASSWORD!);
    console.log(`Logged in as ${IG_USERNAME}`);

    setBio(ig);
    setInterval(() => {
      console.log("Updated instagram bio");
      setBio(ig);
    }, 600000);
  } catch (e) {
    console.error(e);
  }
})();

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}
