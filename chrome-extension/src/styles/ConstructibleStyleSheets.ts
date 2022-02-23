import {css, unsafeCSS} from "lit";
import globalCss from "./global.scss";
import mainCss from "./main.scss";


export const CSS_Global = css`${unsafeCSS(globalCss)}`

css`${unsafeCSS(mainCss)}`
