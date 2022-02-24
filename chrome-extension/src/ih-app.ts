import { html, css, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ServerConfig } from '../../domain/dist/domain-types';
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

  @state()
  private serverConfig: ServerConfig|undefined = undefined;

  constructor() {
      super();

      chrome.storage.sync.get(null).then((entries: any) => {
          if(entries.serverConfig) {
              this.serverConfig = entries.serverConfig;
          }
      })
  }

  render() {
    return html`
      <ih-config .serverConfig="${this.serverConfig}" @configUpdated="${(event: CustomEvent<ServerConfig>) => this.onConfigUpdated(event.detail)}"></ih-config>
      <ih-capture .serverConfig="${this.serverConfig}"></ih-capture>
    `
  }

    async onConfigUpdated(config: ServerConfig) {
        this.serverConfig = config;
        await chrome.storage.sync.set({ serverConfig: this.serverConfig });
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'ih-app': IHApp
  }
}
