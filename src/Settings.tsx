import React, { useState } from "react";
import { css, cx } from "@emotion/css";
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
  const { t } = useTranslation();

  const root = css`
    display: flex;
    position: fixed;
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
    transform: translateX(400px);
    transition: all 0.5s;
  `;

  const move = css`
    transform: translateX(0);
  `;

  const closeRow = css`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom: 8px;
  `;
  return (
    <div className={cx({ [root]: true, [move]: state.isSettingsOpen })}>
      <div className={closeRow}>
        <IconButton
          icon={<Cross />}
          onClick={() => dispatch({ type: "toggle settings" })}
          className={css`
            padding: 0;
          `}
        />
      </div>
      <Section header={t("Language")}>
        <LanguageSelector
          dispatch={dispatch}
          selectedLanguage={state.selectedLanguage}
        />
      </Section>
      <Section header={t("Hemisphere")}>
        <HemisphereSelector
          dispatch={dispatch}
          selectedHemi={state.selectedHemi}
        />
      </Section>
      <Section header={t("Export Caught Items")}>
        <ExportButton state={state} />
      </Section>
      <Section header={t("Import Caught Items")}>
        <ImportControl dispatch={dispatch} />
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
    margin-bottom: 16px;
  `;

  const headerStyle = css`
    padding-left: 4px;
    margin-block: 4px;
    text-transform: uppercase;
    font-size: 16px;
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
    padding: 4px;
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
    padding: 4px;
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

function ExportButton(props: { state: State }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useTranslation();

  const onClick = () => {
    const text = Array.from(props.state.caught).join("\n");
    copy(text);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <TextButton onClick={showSuccess ? undefined : onClick}>
      {showSuccess ? t("Copied!") : t("Copy to Clipboard")}
    </TextButton>
  );
}

function ImportControl({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  const [text, setText] = useState("");
  const { t } = useTranslation();

  const root = css`
    display: flex;
    flex-direction: row;
  `;

  const textAreaStyle = css`
    ${Constants.buttonReset}
    color: ${Constants.colors.accent};
    opacity: 0.7;
    margin: 4px;
    resize: none;
  `;

  const onClick = () => {
    if (!text) {
      return;
    }
    const caught = new Set(text.split("\n"));
    dispatch({ type: "set caught", caught });
    setText("");
  };

  return (
    <div className={root}>
      <textarea
        className={textAreaStyle}
        placeholder={t("Paste Here")}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <TextButton onClick={onClick}>Import</TextButton>
    </div>
  );
}

function TextButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const root = css`
    ${Constants.buttonReset}
    color: ${Constants.colors.accent};
    opacity: 0.7;
    font-size: 24px;
    padding: 4px;
    border-radius: 150px;
  `;
  return <button className={root} {...props} />;
}

function copy(txt: string) {
  const el = document.createElement("textarea");
  el.value = txt;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}
