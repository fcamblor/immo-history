import { html, css, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import {CSS_Global} from "./styles/ConstructibleStyleSheets";

@customElement('ih-app')
export class IHApp extends LitElement {
  static styles = [
      CSS_Global,
      css`
        :host {
          max-width: 500px;
        }
      `
  ]

  render() {
    return html`
      <ih-counter>
        <p>This is child content</p>
      </ih-counter>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ih-app': IHApp
  }
}
