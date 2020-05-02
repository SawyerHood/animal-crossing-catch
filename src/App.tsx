import React, { useState } from "react";

import { css, injectGlobal } from "emotion";
import { useTranslation } from "react-i18next";
import { ReactComponent as Location } from "./icon/location.svg";
import { ReactComponent as Time } from "./icon/time.svg";
import { ReactComponent as Bells } from "./icon/bells.svg";
import { ReactComponent as Length } from "./icon/length.svg";
import { ReactComponent as Warning } from "./icon/warning.svg";
import { ReactComponent as Globe } from "./icon/globe.svg";
import { ReactComponent as Calendar } from "./icon/calendar.svg";
import { ReactComponent as CatchGuide } from "./catch_guide.svg";
import { ReactComponent as Circle } from "./icon/circle.svg";
import { ReactComponent as Check } from "./icon/check.svg";
import github from "./github.png";
import { useAppState, Catchable, Action } from "./AppState";
import imgMap from "./imgMap";
import i18n from "./i18n";
import moment from "moment";

export default function App() {
  const { t } = useTranslation();
  const appState = useAppState();
  i18n.on("languageChanged", function (lng) {
    moment.locale(lng);
  });

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
    color: ${colors.accent};
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
        <LanguageSelector
          dispatch={appState.dispatch}
          selectedLanguage={appState.state.selectedLanguage}
        />

        <HemisphereSelector
          dispatch={appState.dispatch}
          selectedHemi={appState.state.selectedHemi}
        />
        <CatchGuide className={title} />

        <Toggle
          dispatch={appState.dispatch}
          selectedCatchable={appState.state.selectedCatchable}
        />

        {appState.rightNow && (
          <>
            <h1 className={header}>
              {appState.state.selectedCatchable === "fossil"
                ? t("Not Yet Obtained")
                : t("Available Now")}
            </h1>
            {appState.rightNow.map(catchableMapper)}
          </>
        )}

        {appState.laterToday && (
          <>
            <h1 className={header}>{t("Available This Month")}</h1>
            {appState.laterToday.map(catchableMapper)}
          </>
        )}

        {appState.later && (
          <>
            <h1 className={header}>{t("Not Available")}</h1>
            {appState.later.map(catchableMapper)}
          </>
        )}

        {appState.alreadyCaught && (
          <>
            <h1 className={header}>
              {appState.state.selectedCatchable === "fossil"
                ? t("Obtained")
                : t("Already Caught")}
            </h1>
            {appState.alreadyCaught.map(catchableMapper)}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

function Footer() {
  const { t } = useTranslation();
  const footer = css`
    color: ${colors.accent};
    grid-column: 1/-1;
    align-self: center;
    justify-self: center;
    padding: 32px 16px;
    display: flex;
    align-items: center;

    & a {
      color: ${colors.accent};
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

function LanguageSelector(props: {
  selectedLanguage: "en" | "de" | "fr";
  dispatch: React.Dispatch<Action>;
}) {
  const root = css`
    ${buttonReset}
    display: flex;
    width: fit-content;
    align-self: center;
    justify-self: flex-start;
    grid-row: 1;
    grid-column: 1/-1;
    cursor: pointer;
    user-select: none;
    color: ${colors.accent};
    align-items: center;
    font-size: 24px;
    padding: 4px 4px;
    opacity: 0.7;
    border-radius: 100px;
  `;

  const text = css`
    margin-right: 8px;
  `;
  const { i18n } = useTranslation();
  return (
    <button
      className={root}
      onClick={() => {
        props.dispatch({ type: "toggle language" });
        i18n.changeLanguage(
          props.selectedLanguage === "en" ? "de" :
          props.selectedLanguage === "de" ? "fr" :
          "en"
        );
      }}
    >
      <div className={text}>
        {
          i18n.language === "en" ? "English" :
          i18n.language === "de" ? "Deutsch" :
          "Français"
        }
      </div>
    </button>
  );
}

function HemisphereSelector(props: {
  selectedHemi: "north" | "south";
  dispatch: React.Dispatch<Action>;
}) {
  const { t } = useTranslation();
  const root = css`
    ${buttonReset}
    display: flex;
    width: fit-content;
    align-self: center;
    justify-self: flex-end;
    grid-row: 1;
    grid-column: 1/-1;
    cursor: pointer;
    user-select: none;
    color: ${colors.accent};
    align-items: center;
    font-size: 24px;
    padding: 4px 4px;
    opacity: 0.7;
    border-radius: 100px;
  `;

  const text = css`
    margin-right: 8px;
  `;

  const flipped = css`
    transform: rotate(180deg);
  `;

  return (
    <button
      className={root}
      onClick={() => props.dispatch({ type: "toggle hemi" })}
    >
      <div className={text}>
        {props.selectedHemi === "north" ? t("Northern") : t("Southern")}
      </div>
      <Globe className={props.selectedHemi === "south" ? flipped : undefined} />
    </button>
  );
}

function Toggle(props: {
  selectedCatchable: "fish" | "bug" | "fossil";
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
  `;

  const defaultStyle = css`
    ${buttonReset}
    font-size: 20px;
    text-align: center;
    width: 160px;
    color: ${colors.accent};
    cursor: pointer;
    border-radius: 100px;
    padding: 4px 8px;
    margin: 0 4px;
  `;

  const selectedStyle = css`
    ${defaultStyle};
    font-weight: bold;
    align-self: stretch;
    background-color: ${colors.accent};
    color: ${colors.cardBG};
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
    background-color: ${colors.cardBG};
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
    color: ${colors.emText};
  `;

  const name = css`
    font-weight: bold;
    align-self: stretch;
    background-color: ${colors.accent};
    padding: 4px 8px;
    border-radius: 100px;
    color: ${colors.cardBG};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  const check = css`
    ${buttonReset}
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

  let catchableSection = null;
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
      <button
        className={check}
        onClick={() => {
          setExitStatus(catchable.isCaught ? "not caught" : "caught");
          setTimeout(() => {
            dispatch({ type: "toggle caught", key: catchable.key });
          }, 200);
        }}
      >
        <ToggleComp />
      </button>
      <img
        src={imageFromKey(catchable.key)}
        className={imgStyle}
        alt={catchable.name}
      />

      <div className={name} title={t(catchable.name)}>
        {t(catchable.name)}
      </div>

      <Row icon={<Bells />}>{catchable.sellPrice || "?"}</Row>

      {catchableSection}
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
    ${className};

    & svg {
      margin-top: 4px;
    }
  `;

  const textStyle = css`
    margin-left: 6px;
    text-align: left;
  `;
  return (
    <div className={containerStyle}>
      {icon}
      <div className={textStyle}>{children}</div>
    </div>
  );
}

const colors = {
  cardBG: "#FFFAE3",
  text: "#805A2D",
  emText: "#DD1919",
  lightBG: "#CCE2CF",
  accent: "#71997F",
  accentTransparent: "rgba(113, 153, 127, 0.5)",
};

const buttonReset = css`
  outline: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 0;
  background: none;
  margin: 0;
  display: block;
  &:focus {
    box-shadow: 0 0 4px 1px ${colors.accentTransparent};
  }
`;

injectGlobal`
  body {
    margin: 0;
    background-color: ${colors.lightBG};
    color: ${colors.text};
    text-align: left;
    font-family: 'Nunito', sans-serif;
    width: 100%;
  }

  * {
    box-sizing: border-box;
  }
`;
