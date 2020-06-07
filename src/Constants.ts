import { css } from "emotion";

export const colors = {
  cardBG: "#FFFAE3",
  text: "#805A2D",
  emText: "#DD1919",
  lightBG: "#CCE2CF",
  accent: "#71997F",
  accentTransparent: "rgba(113, 153, 127, 0.5)",
};

export const buttonReset = css`
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
