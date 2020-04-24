import RAW_FISH from "./data/fish.json";
import RAW_BUGS from "./data/bugs.json";
import moment from "moment";
import _ from "lodash";
import React, { useState, useEffect, useReducer } from "react";

interface ICatchable {
  name: string;
  imageURL: string | null;
  sellPrice: number;
  location: string;
  months: boolean[];
  nhMonths: boolean[];
  shMonths: boolean[];
  hours: boolean[];
  timeString: string;
  leavingNextMonth: boolean;
  key: string;
  isCaught: boolean;
  monthString: string;
}

interface Fish extends ICatchable {
  type: "fish";
  size: string;
}

interface Bug extends ICatchable {
  type: "bug";
}

export type Catchable = Fish | Bug;

type State = {
  selectedCatchable: "fish" | "bug";
  selectedHemi: "north" | "south";
  caught: Set<string>;
};

export type Action =
  | { type: "select catchable"; catchable: "fish" | "bug" }
  | { type: "toggle hemi" }
  | { type: "toggle caught"; key: string };

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

function cleanCatchable(input: { [key: string]: any }): ICatchable {
  const {
    name,
    imageURL,
    sellPrice,
    location,
    nhMonths,
    shMonths,
    time,
  } = input;
  const hours = cleanTime(time);
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
    location,
    months: nhMonths,
    nhMonths: nhMonths,
    shMonths: shMonths,
    hours,
    timeString: time,
    leavingNextMonth: false,
    isCaught: false,
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
      forRangeWrap(start, end, 24, (i) => (hours[i] = true));
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

function parseTimeString(str: string): number {
  const m = moment(str, "HH A");
  return m.hour();
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

export function useAppState(): {
  rightNow?: Catchable[];
  laterToday?: Catchable[];
  later?: Catchable[];
  alreadyCaught?: Catchable[];
} & { state: State; dispatch: React.Dispatch<Action> } {
  const [currentTime, setCurrentTime] = useState(() => moment());
  const [state, dispatch] = useReducer(
    reducer,
    {
      selectedCatchable: "fish",
      selectedHemi: "north",
      caught: new Set<string>(),
    },
    (state: State): State => {
      const storageCatchabled = localStorage.getItem("selectedCatchable") as
        | "fish"
        | "bug"
        | null;

      const storageHemi = localStorage.getItem("selectedHemi") as
        | "north"
        | "south"
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
    localStorage.setItem("caught", JSON.stringify(Array.from(state.caught)));
  }, [state.caught]);

  const catchables = _.chain(state.selectedCatchable === "fish" ? FISH : BUGS)
    .map((catchable) => {
      const months =
        state.selectedHemi === "north"
          ? catchable.nhMonths
          : catchable.shMonths;
      return {
        ...catchable,
        months,
        isCaught: state.caught.has(catchable.key),
        monthString: monthArrayToRange(months),
      };
    })
    .map((catchable) => {
      let nextMonth = (currentTime.month() + 1) % 12;
      const leavingNextMonth =
        !catchable.months[nextMonth] && catchable.months[currentTime.month()];

      return { ...catchable, leavingNextMonth };
    })
    .orderBy(["leavingNextMonth", "name"], ["desc", "asc"])
    .groupBy((catchable) => {
      if (state.caught.has(catchable.key)) {
        return "alreadyCaught";
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
  forRangeWrap((firstFalse + 1) % 12, firstFalse, 12, (mNum) => {
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
        moment().month(start).format("MMM") +
        " - " +
        moment().month(end).format("MMM")
    )
    .join(" & ");
}
