import React from "react";
import { css } from "emotion";
import * as Constants from "./Constants";
import { IconButton } from "./IconButton";
import { ReactComponent as Cross } from "./icon/cross.svg";
import { ReactComponent as Globe } from "./icon/globe.svg";
import { LanguageOption, LANGUAGES } from "./i18n";
import { Action, State } from "./AppState";
import { useTranslation } from "react-i18next";

type Props = {
  dispatch: React.Dispatch<Action>;
  state: State;
};

export function Settings({ state, dispatch }: Props) {
  const root = css`
    display: ${state.isSettingsOpen ? "flex" : "none"};
    position: absolute;
    height: 100vh;
    top: 0;
    right: 0;
    width: 300px;
    background-color: ${Constants.colors.lightBG};
    overflow-y: auto;
    flex-direction: column;
    padding: 16px;
    box-shadow: -7px 0px 64px rgba(170, 191, 172, 0.9);
    color: ${Constants.colors.accent};
    font-size: 18px;
  `;

  const closeRow = css`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom: 8px;
  `;
  return (
    <div className={root}>
      <div className={closeRow}>
        <IconButton
          icon={<Cross />}
          onClick={() => dispatch({ type: "toggle settings" })}
          className={css`
            padding: 0;
          `}
        />
      </div>
      <Section header="Language">
        <LanguageSelector
          dispatch={dispatch}
          selectedLanguage={state.selectedLanguage}
        />
      </Section>
      <Section header="Hemisphere">
        <HemisphereSelector
          dispatch={dispatch}
          selectedHemi={state.selectedHemi}
        />
      </Section>
    </div>
  );
}

function Section({
  header,
  children,
}: {
  header: string;
  children: React.ReactNode;
}) {
  const root = css`
    margin-bottom: 8px;
  `;

  const headerStyle = css`
    padding-left: 4px;
    margin-block: 4px;
  `;

  return (
    <div className={root}>
      <div className={headerStyle}>{header}</div>
      {children}
    </div>
  );
}

function LanguageSelector(props: {
  selectedLanguage: LanguageOption;
  dispatch: React.Dispatch<Action>;
}) {
  const root = css`
    ${Constants.buttonReset}
    display: flex;
    width: fit-content;
    cursor: pointer;
    user-select: none;
    color: ${Constants.colors.accent};
    align-items: center;
    font-size: 24px;
    padding: 4px 4px;
    border-radius: 4px;
    opacity: 0.7;
  `;
  return (
    <select
      className={root}
      onChange={(e) => {
        props.dispatch({
          type: "set language",
          language: e.target.value as LanguageOption,
        });
      }}
      value={props.selectedLanguage}
    >
      {Object.entries(LANGUAGES).map(([key, text]) => (
        <option key={key} value={key}>
          {text}
        </option>
      ))}
    </select>
  );
}

function HemisphereSelector(props: {
  selectedHemi: "north" | "south";
  dispatch: React.Dispatch<Action>;
}) {
  const { t } = useTranslation();
  const root = css`
    ${Constants.buttonReset}
    display: flex;
    width: fit-content;
    cursor: pointer;
    user-select: none;
    color: ${Constants.colors.accent};
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
