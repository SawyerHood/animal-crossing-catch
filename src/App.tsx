import React, { useState } from "react";

import { css, injectGlobal } from "emotion";
import { useTranslation } from "react-i18next";
import { ReactComponent as Location } from "./icon/location.svg";
import { ReactComponent as Time } from "./icon/time.svg";
import { ReactComponent as Bells } from "./icon/bells.svg";
import { ReactComponent as Length } from "./icon/length.svg";
import { ReactComponent as Warning } from "./icon/warning.svg";
import { ReactComponent as Calendar } from "./icon/calendar.svg";
import { ReactComponent as CatchGuide } from "./catch_guide.svg";
import { ReactComponent as Circle } from "./icon/circle.svg";
import { ReactComponent as Check } from "./icon/check.svg";
import { ReactComponent as Hamburger } from "./icon/hamburger.svg";
import github from "./github.png";
import { useAppState, Catchable, Action, CatchableType } from "./AppState";
import imgMap from "./imgMap";
import { Settings } from "./Settings";
import * as Constants from "./Constants";
import { IconButton } from "./IconButton";

export default function App() {
  const { t } = useTranslation();
  const appState = useAppState();

  const catchableMapper = (catchable: Catchable) => (
    <Card
      catchable={catchable}
      dispatch={appState.dispatch}
      key={catchable.name}
    />
  );

  const root = css`
    text-align: center;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(172px, 1fr));
    grid-gap: 4px 4px;
    justify-content: center;
    padding: 12px;
    width: 100%;
  `;
  const header = css`
    grid-column: 1/-1;
    text-align: left;
    color: ${Constants.colors.accent};
    margin: 16px 0;
  `;

  const title = css`
    width: 90%;
    max-width: 500px;
    align-self: center;
    justify-self: center;
    grid-column: 1/-1;
    margin: 24px 0;
    display: flex;
    user-select: none;
  `;

  return (
    <>
      <div className={root}>
        <HamburgerButton dispatch={appState.dispatch} />
        <CatchGuide className={title} />
        <Toggle
          dispatch={appState.dispatch}
          selectedCatchable={appState.state.selectedCatchable}
        />

        {appState.rightNow && (
          <>
            <h1 className={header}>
              {appState.state.selectedCatchable === "fossil" ||
              appState.state.selectedCatchable === "art" ||
              appState.state.selectedCatchable === "music"
                ? t("Not Yet Obtained")
                : t("Available Now")}{" "}
              ({appState.rightNow.length})
            </h1>
            {appState.rightNow.map(catchableMapper)}
          </>
        )}

        {appState.laterToday && (
          <>
            <h1 className={header}>
              {t("Available This Month")} ({appState.laterToday.length})
            </h1>
            {appState.laterToday.map(catchableMapper)}
          </>
        )}

        {appState.later && (
          <>
            <h1 className={header}>
              {t("Not Available")} ({appState.later.length})
            </h1>
            {appState.later.map(catchableMapper)}
          </>
        )}

        {appState.alreadyCaught && (
          <>
            <h1 className={header}>
              {appState.state.selectedCatchable === "fossil" ||
              appState.state.selectedCatchable === "art" ||
              appState.state.selectedCatchable === "music"
                ? t("Obtained")
                : t("Already Caught")}{" "}
              ({appState.alreadyCaught.length})
            </h1>
            {appState.alreadyCaught.map(catchableMapper)}
          </>
        )}
      </div>
      <Footer />
      <Settings state={appState.state} dispatch={appState.dispatch} />
    </>
  );
}

function HamburgerButton({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  const root = css`
    ${Constants.buttonReset}
    display: flex;
    width: fit-content;
    height: fit-content;
    align-self: center;
    justify-self: flex-end;
    grid-row: 1;
    grid-column: 1/-1;
    cursor: pointer;
    user-select: none;
    color: ${Constants.colors.accent};
    align-items: center;
    font-size: 24px;
    padding: 4px 4px;
    opacity: 0.7;
    border-radius: 4px;
    text-align: center;
  `;

  return (
    <IconButton
      className={root}
      onClick={() => dispatch({ type: "toggle settings" })}
      icon={<Hamburger />}
    />
  );
}

function Footer() {
  const { t } = useTranslation();
  const footer = css`
    color: ${Constants.colors.accent};
    grid-column: 1/-1;
    align-self: center;
    justify-self: center;
    padding: 32px 16px;
    display: flex;
    align-items: center;

    & a {
      color: ${Constants.colors.accent};
    }
  `;
  const githubLink = css`
    margin-left: 12px;
    display: block;
    line-height: 0;
  `;

  return (
    <div className={footer}>
      <div
        dangerouslySetInnerHTML={{
          __html: t("Made By"),
        }}
      />
      <a
        className={githubLink}
        href="https://github.com/SawyerHood/animal-crossing-catch"
      >
        <img alt="github" src={github} width={16} height={16} />
      </a>
    </div>
  );
}

function Toggle(props: {
  selectedCatchable: CatchableType;
  dispatch: React.Dispatch<Action>;
}) {
  const { t } = useTranslation();
  const root = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    grid-column: 1/-1;
    margin-bottom: 12px;
    justify-content: center;
    user-select: none;
    flex-wrap: wrap;
  `;

  const defaultStyle = css`
    ${Constants.buttonReset}
    font-size: 20px;
    text-align: center;
    color: ${Constants.colors.accent};
    cursor: pointer;
    border-radius: 100px;
    padding: 4px 8px;
    margin: 0 4px;
    flex-grow: 1;
    max-width: 160px;
  `;

  const selectedStyle = css`
    ${defaultStyle};
    font-weight: bold;
    align-self: stretch;
    background-color: ${Constants.colors.accent};
    color: ${Constants.colors.cardBG};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  return (
    <div className={root}>
      <button
        className={
          props.selectedCatchable === "fish" ? selectedStyle : defaultStyle
        }
        onClick={() =>
          props.dispatch({ type: "select catchable", catchable: "fish" })
        }
      >
        {t("Fish")}
      </button>
      <button
        className={
          props.selectedCatchable === "bug" ? selectedStyle : defaultStyle
        }
        onClick={() =>
          props.dispatch({ type: "select catchable", catchable: "bug" })
        }
      >
        {t("Bugs")}
      </button>
      <button
        className={
          props.selectedCatchable === "fossil" ? selectedStyle : defaultStyle
        }
        onClick={() =>
          props.dispatch({ type: "select catchable", catchable: "fossil" })
        }
      >
        {t("Fossils")}
      </button>
      <button
        className={
          props.selectedCatchable === "art" ? selectedStyle : defaultStyle
        }
        onClick={() =>
          props.dispatch({ type: "select catchable", catchable: "art" })
        }
      >
        {t("Art")}
      </button>
      <button
        className={
          props.selectedCatchable === "music" ? selectedStyle : defaultStyle
        }
        onClick={() =>
          props.dispatch({ type: "select catchable", catchable: "music" })
        }
      >
        {t("Music")}
      </button>
    </div>
  );
}

function Card({
  catchable,
  dispatch,
}: {
  catchable: Catchable;
  dispatch: React.Dispatch<Action>;
}) {
  const { t } = useTranslation();
  const [exitStatus, setExitStatus] = useState<"caught" | "not caught" | null>(
    null
  );
  const card = css`
    display: flex;
    flex-direction: column;
    padding: 16px;
    flex-grow: 1;
    min-width: 160px;
    background-color: ${Constants.colors.cardBG};
    border-radius: 6px;
    box-shadow: 0px 2px 15px rgba(170, 191, 172, 0.3);
    & > * {
      margin-bottom: 6px;
      :last-child {
        margin-bottom: 0;
      }
    }
  `;

  const imgStyle = css`
    width: 64px;
    height: 64px;
    align-self: center;
    object-fit: scale-down;
  `;

  const leaving = css`
    color: ${Constants.colors.emText};
  `;

  const name = css`
    font-weight: bold;
    align-self: stretch;
    background-color: ${Constants.colors.accent};
    padding: 4px 8px;
    border-radius: 100px;
    color: ${Constants.colors.cardBG};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  const check = css`
    align-self: flex-end;
    display: block;
    cursor: pointer;
    padding: 0;
    height: 24px;
    border-radius: 50%;
  `;

  const exit = css`
    transition: all 0.2s ease-in-out;
    transform: scale(0.9);
    opacity: 0;
  `;

  let ToggleComp = catchable.isCaught
    ? exitStatus === "not caught"
      ? Circle
      : Check
    : exitStatus === "caught"
    ? Check
    : Circle;

  let bellSection = null;
  let catchableSection = null;
  let noteSection = null;

  if (catchable.type !== "art") {
    bellSection = <Row icon={<Bells />}>{catchable.sellPrice || "?"}</Row>;
  }

  if (catchable.type === "music" && catchable.source === "not_for_sale") {
    let note = t("By concert request only");
    if (catchable.key === "welcome_horizons") {
      note = t("Gifted at first concert");
    } else if (catchable.key === "kk_birthday") {
      note = t("By concert request only (on birthday, or Saturday before)");
    }
    noteSection = <Row icon={<Warning />}>{note}</Row>;
  }

  if (catchable.type === "fish" || catchable.type === "bug") {
    catchableSection = (
      <>
        <Row icon={<Location />}>{t(catchable.location)}</Row>
        <Row icon={<Time />}>
          {catchable.timeString === "All day"
            ? t(catchable.timeString)
            : catchable.timeString}
        </Row>
        <Row icon={<Calendar />}>
          {catchable.monthString === "All Year"
            ? t(catchable.monthString)
            : catchable.monthString}
        </Row>
        {catchable.type === "fish" && (
          <Row icon={<Length />}>{t(catchable.size)}</Row>
        )}
        {catchable.leavingNextMonth ? (
          <Row className={leaving} icon={<Warning />}>
            {t("Gone next month")}
          </Row>
        ) : null}
      </>
    );
  }

  return (
    <div className={[card, exitStatus ? exit : null].join(" ")}>
      <IconButton
        icon={<ToggleComp />}
        className={check}
        onClick={() => {
          setExitStatus(catchable.isCaught ? "not caught" : "caught");
          setTimeout(() => {
            dispatch({ type: "toggle caught", key: catchable.key });
          }, 200);
        }}
      />
      <img
        src={imageFromKey(catchable.key)}
        className={imgStyle}
        alt={catchable.name}
      />

      <div className={name} title={t(catchable.name)}>
        {t(catchable.name)}
      </div>
      {bellSection}
      {catchableSection}
      {noteSection}
    </div>
  );
}

function imageFromKey(name: string): string {
  const map: any = imgMap;
  return map[name] || "";
}

function Row({
  icon,
  children,
  className,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const containerStyle = css`
    display: flex;
    flex-direction: row;
    font-size: 14px;
    align-items: center;
    ${className};

    & svg {
      flex: 1;
    }
  `;

  const textStyle = css`
    margin-left: 6px;
    text-align: left;
    flex: 10;
  `;
  return (
    <div className={containerStyle}>
      {icon}
      <div className={textStyle}>{children}</div>
    </div>
  );
}

injectGlobal`
  body {
    margin: 0;
    background-color: ${Constants.colors.lightBG};
    color: ${Constants.colors.text};
    text-align: left;
    font-family: 'Nunito', sans-serif;
    width: 100%;
  }

  * {
    box-sizing: border-box;
  }
`;
