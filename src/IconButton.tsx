import React, { ReactNode } from "react";
import * as Constants from "./Constants";
import { cx } from "@emotion/css";

type Props = {
  icon: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
};

export function IconButton({ onClick, icon, className }: Props) {
  const root = cx(Constants.buttonReset, className);
  return (
    <button onClick={onClick} className={root}>
      {icon}
    </button>
  );
}
