import RAW_FISH from "./data/fish.json";
import RAW_BUGS from "./data/bugs.json";
import RAW_FOSSILS from "./data/fossils.json";
import moment from "moment";
import "moment/locale/de";
import _ from "lodash";
import React, { useState, useEffect, useReducer } from "react";
import i18n from "./i18n";

interface ICollectable {
  key: string;
  name: string;
  imageURL: string | null;
  sellPrice: number;
  isCaught: boolean;
}

interface ICatchable extends ICollectable {
  location: string;
  months: boolean[];
  nhMonths: boolean[];
  shMonths: boolean[];
  hours: boolean[];
  timeString: string;
  leavingNextMonth: boolean;
  monthString: string;
}

interface Fossil extends ICollectable {
  type: "fossil";
}

interface Fish extends ICatchable {
  type: "fish";
  size: string;
}

interface Bug extends ICatchable {
  type: "bug";
}

export type Catchable = Fish | Bug | Fossil;

type State = {
  selectedCatchable: "fish" | "bug" | "fossil";
  selectedHemi: "north" | "south";
  selectedLanguage: "en" | "de";
  caught: Set<string>;
};

export type Action =
  | { type: "select catchable"; catchable: "fish" | "bug" | "fossil" }
  | { type: "toggle hemi" }
  | { type: "toggle caught"; key: string }
  | { type: "toggle language" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select catchable": {
      return { ...state, selectedCatchable: action.catchable };
    }
    case "toggle hemi": {
      return {
        ...state,
        selectedHemi: state.selectedHemi === "north" ? "south" : "north",
      };
    }
    case "toggle language": {
      const languageToChange = state.selectedLanguage === "en" ? "de" : "en";
      i18n.changeLanguage(languageToChange);
      return {
        ...state,
        selectedLanguage: languageToChange,
      };
    }
    case "toggle caught": {
      const clone = new Set(state.caught);
      if (state.caught.has(action.key)) {
        clone.delete(action.key);
      } else {
        clone.add(action.key);
      }
      return { ...state, caught: clone };
    }
  }
  return state;
}

function cleanCollectable(input: { [key: string]: any }): ICollectable {
  const { name, imageURL, sellPrice } = input;
  const key = name
    .toLowerCase()
    .replace(/ /g, "_")
    .replace("'", "")
    .replace("-", "_")
    .replace(".", "");

  return {
    key,
    name,
    imageURL,
    sellPrice,
    isCaught: false,
  };
}

function cleanCatchable(input: { [key: string]: any }): ICatchable {
  const { location, nhMonths, shMonths, time } = input;
  const hours = cleanTime(time);
  return {
    ...cleanCollectable(input),
    location,
    months: nhMonths,
    nhMonths: nhMonths,
    shMonths: shMonths,
    hours,
    timeString: time,
    leavingNextMonth: false,
    monthString: "",
  };
}

function cleanTime(time: string): boolean[] {
  let hours = new Array(24).fill(false);
  if (time.toLowerCase() === "all day") {
    hours.fill(true);
  } else {
    for (const timeStr of time.split(" & ")) {
      const [start, end] = timeStr.split(" - ").map(parseTimeString);
      forRangeWrap(start, end, 24, i => (hours[i] = true));
    }
  }
  return hours;
}

function cleanAFish(input: { [key: string]: any }): Fish {
  let catchable = cleanCatchable(input);
  return {
    ...catchable,
    type: "fish",
    size: input.size,
  };
}

function cleanABug(input: { [key: string]: any }): Bug {
  let catchable = cleanCatchable(input);
  return {
    ...catchable,
    type: "bug",
  };
}

function cleanAFossil(input: { [key: string]: any }): Fossil {
  return {
    ...cleanCollectable(input),
    type: "fossil",
  };
}

function parseTimeString(str: string): number {
  const m = moment(str, "HH A");
  return m.hour();
}
function parseTimeStringLocale(str: string): string {
  const m = moment(str, "HH A");
  let localeTime =
    m.format("LT") === "Invalid date" ? "All day" : m.format("LT");
  return localeTime;
}

function forRangeWrap(
  start: number,
  end: number,
  cap: number,
  fn: (n: number) => void
): void {
  let i = start;
  while (i !== end) {
    if (i === cap) {
      i = 0;
      if (i === end) {
        return;
      }
    }
    fn(i);
    i++;
  }
}

const FISH: Catchable[] = RAW_FISH.map(cleanAFish);
const BUGS: Catchable[] = RAW_BUGS.map(cleanABug);
const FOSSILS: Catchable[] = RAW_FOSSILS.map(cleanAFossil);

export function useAppState(): {
  rightNow?: Catchable[];
  laterToday?: Catchable[];
  later?: Catchable[];
  alreadyCaught?: Catchable[];
} & { state: State; dispatch: React.Dispatch<Action> } {
  const [currentTime, setCurrentTime] = useState(() =>
    moment().locale(
      state === undefined ? i18n.language : state.selectedLanguage
    )
  );
  const [state, dispatch] = useReducer(
    reducer,
    {
      selectedCatchable: "fish",
      selectedHemi: "north",
      selectedLanguage: i18n.language === "en" ? "en" : "de",
      caught: new Set<string>(),
    },
    (state: State): State => {
      const storageCatchabled = localStorage.getItem("selectedCatchable") as
        | "fish"
        | "bug"
        | "fossil"
        | null;

      const storageHemi = localStorage.getItem("selectedHemi") as
        | "north"
        | "south"
        | null;

      const storageLanguage = localStorage.getItem("selectedLanguage") as
        | "en"
        | "de"
        | null;

      const caughtStr = localStorage.getItem("caught") || "[]";
      let caught: string[] = [];
      try {
        caught = JSON.parse(caughtStr);
      } catch {}

      return {
        ...state,
        selectedCatchable:
          storageCatchabled != null
            ? storageCatchabled
            : state.selectedCatchable,
        selectedHemi: storageHemi != null ? storageHemi : state.selectedHemi,
        selectedLanguage:
          storageLanguage != null ? storageLanguage : state.selectedLanguage,
        caught: new Set(caught),
      };
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 60000);
    return () => clearInterval(interval);
  }, [setCurrentTime]);

  useEffect(() => {
    localStorage.setItem("selectedCatchable", state.selectedCatchable);
  }, [state.selectedCatchable]);

  useEffect(() => {
    localStorage.setItem("selectedHemi", state.selectedHemi);
  }, [state.selectedHemi]);

  useEffect(() => {
    localStorage.setItem("selectedLanguage", state.selectedLanguage);
  }, [state.selectedLanguage]);

  useEffect(() => {
    localStorage.setItem("caught", JSON.stringify(Array.from(state.caught)));
  }, [state.caught]);

  let catchableArr = FISH;
  switch (state.selectedCatchable) {
    case "fish":
      catchableArr = FISH;
      break;
    case "bug":
      catchableArr = BUGS;
      break;
    case "fossil":
      catchableArr = FOSSILS;
      break;
  }

  const catchables = _.chain(catchableArr)
    .map(catchable => {
      if (catchable.type === "fossil") {
        return { ...catchable, isCaught: state.caught.has(catchable.key) };
      }

      const timeLocale = catchable.timeString
        .split(" & ")
        .map(t =>
          t
            .split(" - ")
            .map(parseTimeStringLocale)
            .join(" - ")
        )
        .join(" & ");

      const months =
        state.selectedHemi === "north"
          ? catchable.nhMonths
          : catchable.shMonths;
      return {
        ...catchable,
        months,
        isCaught: state.caught.has(catchable.key),
        monthString: monthArrayToRange(months),
        timeString: timeLocale,
      };
    })
    .map(catchable => {
      if (catchable.type === "fossil") {
        return catchable;
      }
      let nextMonth = (currentTime.month() + 1) % 12;
      const leavingNextMonth =
        !catchable.months[nextMonth] && catchable.months[currentTime.month()];

      return { ...catchable, leavingNextMonth };
    })
    .orderBy(["leavingNextMonth", "name"], ["desc", "asc"])
    .groupBy(catchable => {
      if (state.caught.has(catchable.key)) {
        return "alreadyCaught";
      }
      if (catchable.type === "fossil") {
        return "rightNow";
      }
      if (
        catchable.hours[currentTime.hour()] &&
        catchable.months[currentTime.month()]
      ) {
        return "rightNow";
      }

      if (catchable.months[currentTime.month()]) {
        return "laterToday";
      }

      return "later";
    })
    .value() as {
    rightNow?: Catchable[];
    laterToday?: Catchable[];
    later?: Catchable[];
    alreadyCaught?: Catchable[];
  };

  return { ...catchables, state, dispatch };
}

export function monthArrayToRange(arr: boolean[]): string {
  const firstFalse = arr.indexOf(false);
  if (firstFalse < 0) {
    return "All Year";
  }
  const res: number[][] = [];
  let lastVal = false;
  let lastI = 0;
  let rangeStart: number | null = null;
  forRangeWrap((firstFalse + 1) % 12, firstFalse, 12, mNum => {
    if (arr[mNum] !== lastVal) {
      if (arr[mNum] === true) {
        rangeStart = mNum;
      } else {
        res.push([rangeStart!, lastI]);
        rangeStart = null;
      }
    }
    lastVal = arr[mNum];
    lastI = mNum;
  });

  if (rangeStart != null) {
    res.push([rangeStart!, lastI]);
  }
  return res
    .map(
      ([start, end]) =>
        moment()
          .month(start)
          .format("MMM") +
        " - " +
        moment()
          .month(end)
          .format("MMM")
    )
    .join(" & ");
}
