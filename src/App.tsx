import * as React from "react";
import "./styles.css";
import RAW_FISH from "./fish.json";
import moment from "moment";
import { css, injectGlobal } from "emotion";
import _ from "lodash";

type Fish = {
  name: string;
  imageURL: string;
  sellPrice: number;
  location: string;
  size: string;
  hasFin: boolean;
  months: boolean[];
  hours: boolean[];
  timeString: string;
};

function cleanAFish(input: { [key: string]: any }): Fish {
  const { name, imageURL, sellPrice, location, size, months, time } = input;

  const hasFin = size.includes("Fin");
  let hours = new Array(24).fill(false);
  if (time === "All day") {
    hours.fill(true);
  } else {
    const [start, end] = time.split(" - ").map(parseTimeString);
    console.log(`time: ${time}, start: ${start} end:${end}`);
    forRangeWrap(start, end, 24, i => (hours[i] = true));
  }

  return {
    name,
    imageURL,
    sellPrice,
    location,
    size,
    months,
    hasFin,
    hours,
    timeString: time
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
    }
    fn(i);
    i++;
  }
  console.log(`${start}-${end}`);
}

const FISH = RAW_FISH.map(cleanAFish);

export default function App() {
  const fish = useCurrentFish();
  return (
    <>
      <h1>What Can I Catch Now?</h1>
      <div className={ROOT_STYLE}>
        {fish.map(fish => (
          <Row fish={fish} key={fish.name} />
        ))}
      </div>
    </>
  );
}

function useCurrentFish(): (Fish & { leavingNextMonth: boolean })[] {
  const [currentTime, setCurrentTime] = React.useState(() => moment());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 60000);
    return () => clearInterval(interval);
  }, [setCurrentTime]);
  const fish = FISH.filter(
    fish => fish.hours[currentTime.hour()] && fish.months[currentTime.month()]
  ).map(fish => {
    let nextMonth = currentTime.month() + 1;
    if (nextMonth >= 12) {
      nextMonth = 0;
    }

    const leavingNextMonth = !fish.months[nextMonth];

    return { ...fish, leavingNextMonth };
  });

  return _.orderBy(fish, ["leavingNextMonth", "name"], ["desc", "asc"]);
}

function Row({ fish }: { fish: Fish & { leavingNextMonth: boolean } }) {
  return (
    <div className={ROW_STYLE}>
      <img src={fish.imageURL} alt={fish.name} />
      <div>{fish.name}</div>
      <div>{fish.location}</div>
      <div>{fish.timeString}</div>
      <div>${fish.sellPrice}</div>
      {fish.leavingNextMonth ? (
        <div className={LEAVING_STYLE}>Gone Next Month</div>
      ) : null}
    </div>
  );
}

const ROW_STYLE = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 12px;
  flex-grow: 1;
  min-width: 160px;
  background-color: #c39cef;
  border-radius: 25px;
  & > * {
    margin-bottom: 8px;
    :last-child {
      margin-bottom: 0;
    }
  }
  & > img {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: white;
  }
`;

const LEAVING_STYLE = css`
  color: #b5553e;
`;

const ROOT_STYLE = css`
  font-family: sans-serif;
  text-align: center;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 180px));
  grid-gap: 8px;
  justify-content: center;
  padding: 12px;
`;

injectGlobal`
  body {
    margin: 0;
    background-color: #f6f2ea;
    color: #4b3c36;
    text-align: center;
    font-family: sans-serif;
    width: 100%;
  }
`;
