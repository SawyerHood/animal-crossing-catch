import * as React from "react";
import RAW_FISH from "./fish.json";
import RAW_BUGS from "./bugs.json";
import moment from "moment";
import { css, injectGlobal } from "emotion";
import _ from "lodash";
import { ReactComponent as Question } from "./question.svg";

interface ICatchable {
  name: string;
  imageURL: string | null;
  sellPrice: number;
  location: string;
  months: boolean[];
  hours: boolean[];
  timeString: string;
  leavingNextMonth: boolean;
}

interface Fish extends ICatchable {
  type: "fish";
  size: string;
}

interface Bug extends ICatchable {
  type: "bug";
}

type Catchable = Fish | Bug;

function cleanCatchable(input: { [key: string]: any }): ICatchable {
  const { name, imageURL, sellPrice, location, months, time } = input;
  let hours = new Array(24).fill(false);
  if (time.toLowerCase() === "all day") {
    hours.fill(true);
  } else {
    for (const timeStr of time.split(" & ")) {
      const [start, end] = timeStr.split(" - ").map(parseTimeString);
      forRangeWrap(start, end, 24, i => (hours[i] = true));
    }
  }

  return {
    name,
    imageURL,
    sellPrice,
    location,
    months,
    hours,
    timeString: time,
    leavingNextMonth: false
  };
}

function cleanAFish(input: { [key: string]: any }): Fish {
  let catchable = cleanCatchable(input);
  return {
    ...catchable,
    type: "fish",
    size: input.size
  };
}

function cleanABug(input: { [key: string]: any }): Bug {
  let catchable = cleanCatchable(input);
  return {
    ...catchable,
    type: "bug"
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

const FISH: Catchable[] = RAW_FISH.map(cleanAFish);
const BUGS: Catchable[] = RAW_BUGS.map(cleanABug);
const CATCHABLES: Catchable[] = FISH.concat(BUGS);

export default function App() {
  const catchables = useCurrentCatchables();
  const catchableMapper = (catchable: Catchable) => (
    <Card catchable={catchable} key={catchable.name} />
  );
  return (
    <>
      <div className={styles.root}>
        {catchables.rightNow && (
          <>
            <h1 className={styles.header}>Available Now</h1>
            {catchables.rightNow.map(catchableMapper)}
          </>
        )}
        {catchables.laterToday && (
          <>
            <h1 className={styles.header}>Available This Month</h1>
            {catchables.laterToday.map(catchableMapper)}
          </>
        )}
        {catchables.later && (
          <>
            <h1 className={styles.header}>Not Available</h1>
            {catchables.later.map(catchableMapper)}
          </>
        )}
      </div>
    </>
  );
}

function useCurrentCatchables(): {
  rightNow?: Catchable[];
  laterToday?: Catchable[];
  later?: Catchable[];
} {
  const [currentTime, setCurrentTime] = React.useState(() => moment());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 60000);
    return () => clearInterval(interval);
  }, [setCurrentTime]);

  return _.chain(CATCHABLES)
    .map(catchable => {
      let nextMonth = (currentTime.month() + 1) % 12;
      const leavingNextMonth =
        !catchable.months[nextMonth] && catchable.months[currentTime.month()];

      return { ...catchable, leavingNextMonth };
    })
    .orderBy(["leavingNextMonth", "type", "name"], ["desc", "desc", "asc"])
    .groupBy(catchable => {
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
    .value() as any;
}

function Card({ catchable }: { catchable: Catchable }) {
  const cardStyle = css`
    ${styles.card};
    ${catchable.type === "bug" ? styles.bug : null};
  `;
  return (
    <div className={cardStyle}>
      {catchable.imageURL ? (
        <img
          src={catchable.imageURL}
          className={styles.img}
          alt={catchable.name}
        />
      ) : (
        <Question className={styles.img} />
      )}
      <div>{catchable.name}</div>
      <div>{catchable.location}</div>
      <div>{catchable.timeString}</div>
      <div>${catchable.sellPrice || "?"}</div>
      {catchable.type === "fish" && <div>Size: {catchable.size}</div>}
      {catchable.leavingNextMonth ? (
        <div className={styles.leaving}>Gone Next Month</div>
      ) : null}
    </div>
  );
}

const colors = {
  fishBG: "#8ac6d1",
  text: "#000839",
  emText: "#fe346e",
  lightBG: "#fae3d9",
  bugBG: "#bbded6"
};

const styles = {
  card: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 12px;
    flex-grow: 1;
    min-width: 160px;
    background-color: ${colors.fishBG};
    border-radius: 4px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
    & > * {
      margin-bottom: 8px;
      :last-child {
        margin-bottom: 0;
      }
    }
  `,
  root: css`
    font-family: sans-serif;
    text-align: center;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 180px));
    grid-gap: 16px;
    justify-content: center;
    padding: 12px;
  `,
  leaving: css`
    color: ${colors.emText};
  `,
  header: css`
    grid-column: 1/-1;
  `,
  img: css`
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: white;
  `,
  bug: css`
    background-color: ${colors.bugBG};
  `
};

injectGlobal`
  body {
    margin: 0;
    background-color: ${colors.lightBG};
    color: ${colors.text};
    text-align: center;
    font-family: sans-serif;
    width: 100%;
  }
`;
