import { css } from "emotion";
import React, { ChangeEvent } from "react";

const inputCss = css`
  justify-self: flex-end;
  width: 200px;
  height: 29px;
  padding: 0 5px;
  border: 3px solid #71997f;
  border-radius: 15px;
  background: none;
  outline: none;
  grid-column: 1/-1;
`;

export default function SearchInput({
  currentValue,
  onChange,
}: {
  currentValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      className={inputCss}
      placeholder="Search"
      value={currentValue}
      onChange={onChange}
    />
  );
}
