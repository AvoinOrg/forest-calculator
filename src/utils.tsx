import { stringify } from "querystring";

export const subPages = [
  "tavanomainen_metsänhoito",
  "pidennetty_kiertoaika",
  // "jatkuvapeitteinen_metsänkasvatus",
  "tilaus"
];

export const subTitles = {
  tavanomainen_metsänhoito: "Tavanomainen metsänhoito",
  pidennetty_kiertoaika: "Pidennetty kiertoaika (muutos hakkuutavassa)",
  // jatkuvapeitteinen_metsänkasvatus: "Jatkuvapeitteinen metsänkasvatus",
  tilaus: "Metsäsuunnitelma"
};

export const navTitles = {
  tavanomainen_metsänhoito: "Tavanomainen metsänhoito",
  pidennetty_kiertoaika: "Pidennetty kiertoaika",
  // jatkuvapeitteinen_metsänkasvatus: "jatkuvapeitteinen metsänkasvatus",
  tilaus: "Metsäsuunnitelma"
};

export const subTexts = {
  tavanomainen_metsänhoito:
    "Laskelmassa metsät perustetaan istuttamalla. Harvennukset tehdään alaharvennuksina ja lopuksi tehdään uudistushakkuu.",
  pidennetty_kiertoaika:
    "Laskelmassa harvennukset tehdään yläharvennuksina. Uudistaminen tapahtuu kun se on taloudellisesti järkevää. Metsänomistajan tulot eivät pienene verrattuna tavanomaiseen."
  // jatkuvapeitteinen_metsänkasvatus:
  //  "Laskelmassa harvennukset tehdään yläharvennuksina ja metsät uudistuvat luontaisesti. Uudistaminen tapahtuu jos se on taloudellisesti järkevää. Metsänomistajan tulot eivät pienene verrattuna tavanomaiseen."
};

export const forestryIndexes = {
  tavanomainen_metsänhoito: 3,
  // pidennetty_kiertoaika: 4
  // jatkuvapeitteinen_metsänkasvatus: 2
};

export const radioVals = {
  radio1: "metsäsuunnitelma",
  radio2: "metsänhoitosuunnitelma + hiililaskelma",
  radio3: "yhteydenottopyynto"
};

export const roundVal = (val: number | string, accuracy: number) => {
  if (typeof val === "string") {
    val = Number(val);
  }

  let acc = accuracy;
  if (accuracy === 0) {
    acc = 1;
  }
  if (accuracy < 0) {
    acc = 1 / Math.pow(10, Math.abs(accuracy));
  }
  if (accuracy > 0) {
    acc = Math.pow(10, Math.abs(accuracy));
  }

  val = Math.round(val * acc) / acc;
  return val;
};

export const addThousandSpaces = (val: number | string): string => {
  const s = "" + val;

  let nS = "";
  let mod = 0;

  for (let i = 1; i <= s.length; i++) {
    const char = s[s.length - i];

    if (char === ".") {
      mod = 0;
    } else {
      if (mod !== 0 && mod % 3 === 0) {
        nS = " " + nS;
      }
      mod++;
    }

    nS = char + nS;
  }

  return nS;
};

export const haToKm = (val: number | string) => {
  if (typeof val === "string") {
    val = Number(val);
  }
  return val / 100;
};

export const getRatio = (val1: number | string, val2: number | string) => {
  if (typeof val1 === "string") {
    val1 = Number(val1);
  }
  if (typeof val2 === "string") {
    val2 = Number(val2);
  }

  const ratio = Math.max(val1, 0.0001) / val2;
  return ratio * 100;
};
