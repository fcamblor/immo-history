import { html, css, LitElement } from 'lit'
import {customElement, property, state, query} from 'lit/decorators.js'
import { ServerConfig } from '../../../domain/dist/domain-types';
import {CSS_Global} from "../styles/ConstructibleStyleSheets";

@customElement('ih-config')
export class IHConfig extends LitElement {
  static styles = [
      CSS_Global,
      css`
        :host {
        }
      `
  ]

  @property()
  serverConfig: ServerConfig|undefined = undefined;

  @state()
  private showConfig: boolean = false;

  @query("#serverBaseUrl")
  $serverBaseUrl!: HTMLInputElement;

  @query("#authToken")
  $authToken!: HTMLInputElement;

  render() {
    return html`
      <div ?hidden="${!this.showConfig}">
        <input id="serverBaseUrl" type="text" .value="${this.serverConfig?.serverBaseUrl}" placeholder="Provide server root url" @change="${() => { this.serverConfig = {...this.serverConfig, serverBaseUrl: this.$serverBaseUrl.value } as any; }}" />
        <br/>
        <input id="authToken" type="text" .value="${this.serverConfig?.authToken}" placeholder="Provide server auth token" @change="${() => { this.serverConfig = {...this.serverConfig, authToken: this.$authToken.value } as any; }}" />
        <br/>
        <button @click=${this.saveConfig} part="button" ?disabled="${!this.serverConfigIsValid()}">
          Save config
        </button>
      </div>
      <div ?hidden="${this.showConfig}">
        <button @click="${() => { this.showConfig = true; }}">Edit config</button>
      </div>
    `
  }

  serverConfigIsValid(): boolean {
    return !!this.serverConfig?.serverBaseUrl && !!this.serverConfig?.authToken;
  }

  saveConfig() {
    let serverBaseUrl = this.serverConfig!.serverBaseUrl
    serverBaseUrl = serverBaseUrl.endsWith("/")?serverBaseUrl.substring(0, serverBaseUrl.length-1):serverBaseUrl

    this.dispatchEvent(new CustomEvent<ServerConfig>('configUpdated', {
      detail: {
        serverBaseUrl,
        authToken: this.serverConfig!.authToken,
      }
    }))
    this.showConfig = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ih-config': IHConfig
  }
}
