import * as React from "react";
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
  leavingNextMonth: boolean;
};

function cleanAFish(input: { [key: string]: any }): Fish {
  const { name, imageURL, sellPrice, location, size, months, time } = input;

  const hasFin = size.includes("Fin");
  let hours = new Array(24).fill(false);
  if (time === "All day") {
    hours.fill(true);
  } else {
    const [start, end] = time.split(" - ").map(parseTimeString);
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
    timeString: time,
    leavingNextMonth: false
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
}

const FISH = RAW_FISH.map(cleanAFish);

export default function App() {
  const fish = useCurrentFish();
  const fishMapper = (fish: Fish) => <Row fish={fish} key={fish.name} />;
  return (
    <>
      <div className={styles.root}>
        {fish.rightNow && (
          <>
            <h1 className={styles.header}>Available Now</h1>
            {fish.rightNow.map(fishMapper)}
          </>
        )}
        {fish.laterToday && (
          <>
            <h1 className={styles.header}>Available This Month</h1>
            {fish.laterToday.map(fishMapper)}
          </>
        )}
        {fish.later && (
          <>
            <h1 className={styles.header}>Not Available</h1>
            {fish.later.map(fishMapper)}
          </>
        )}
      </div>
    </>
  );
}

function useCurrentFish(): {
  rightNow?: Fish[];
  laterToday?: Fish[];
  later?: Fish[];
} {
  const [currentTime, setCurrentTime] = React.useState(() => moment());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 60000);
    return () => clearInterval(interval);
  }, [setCurrentTime]);

  return _.chain(FISH)
    .map(fish => {
      let nextMonth = (currentTime.month() + 1) % 12;
      const leavingNextMonth =
        !fish.months[nextMonth] && fish.months[currentTime.month()];

      return { ...fish, leavingNextMonth };
    })
    .orderBy(["leavingNextMonth", "name"], ["desc", "asc"])
    .groupBy(fish => {
      if (fish.hours[currentTime.hour()] && fish.months[currentTime.month()]) {
        return "rightNow";
      }

      if (fish.months[currentTime.month()]) {
        return "laterToday";
      }

      return "later";
    })
    .value() as any;
}

function Row({ fish }: { fish: Fish }) {
  return (
    <div className={styles.row}>
      <img src={fish.imageURL} alt={fish.name} />
      <div>{fish.name}</div>
      <div>{fish.location}</div>
      <div>{fish.timeString}</div>
      <div>${fish.sellPrice || "?"}</div>
      <div>Size: {fish.size}</div>
      {fish.leavingNextMonth ? (
        <div className={styles.leaving}>Gone Next Month</div>
      ) : null}
    </div>
  );
}

const styles = {
  row: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 12px;
    flex-grow: 1;
    min-width: 160px;
    background-color: #c39cef;
    border-radius: 4px;
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
  `,
  root: css`
    font-family: sans-serif;
    text-align: center;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 180px));
    grid-gap: 8px;
    justify-content: center;
    padding: 12px;
  `,
  leaving: css`
    color: #b5553e;
  `,
  header: css`
    grid-column: 1/-1;
  `
};

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
