import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {CSS_Global} from "./styles/ConstructibleStyleSheets";

@customElement('ih-counter')
export class IHCounter extends LitElement {
  static styles = [
      CSS_Global,
      css`
        :host {
          display: block;
          border: solid 1px gray;
          padding: 16px;
          max-width: 500px;
        }
      `
  ]

  /**
   * The name to say "Hello" to.
   */
  @property()
  name = 'World'

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0

  render() {
    return html`
      <h1>Hello, ${this.name}!</h1>
      <button @click=${this._onClick} part="button">
        Click Count: ${this.count}
      </button>
      <slot></slot>
    `
  }

  private _onClick() {
    this.count++
  }

  foo(): string {
    return 'foo'
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ih-counter': IHCounter
  }
}