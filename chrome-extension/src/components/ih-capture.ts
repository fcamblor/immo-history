import { html, css, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";

@customElement('ih-capture')
export class IHCapture extends LitElement {
  static styles = [
      CSS_Global,
      css`
        :host {
        }
      `
  ]

  render() {
    return html`
      <button @click=${this.capture} part="button">
        Capture page
      </button>
    `
  }

  private async capture() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id as number },
      func: async () => {
        function delay(duration: number) {
          return new Promise((resolve) => setTimeout(resolve, duration));
        }

        const $galleryButtons = Array.from<HTMLButtonElement>(document.querySelectorAll("[data-qa-id='adview_spotlight_container'] button"));
        const $mainGalleryButton = $galleryButtons.filter(el => el.className && el.className.indexOf("styles_fullHeight") !== -1)[0];
        $mainGalleryButton.click();
        await delay(300);

        const getBase64ImageForUrl = (url: string) => {
          return new Promise((resolve) => {
            const img = new Image();

            img.setAttribute('crossOrigin', 'anonymous');

            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;

              const ctx = canvas.getContext("2d")!;
              ctx.drawImage(img, 0, 0);

              const dataURL = canvas.toDataURL("image/png");

              resolve(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""))
            };

            img.src = url;
          })
        }

        const $pictures = Array.from<HTMLImageElement>(document.querySelectorAll("[data-qa-id='gallery_modal'] .slick-track .slick-slide:not(.slick-cloned) img"));

        console.log(`Found ${$pictures.length} pictures !`);

        let pictureHashes = await Promise.all(
            $pictures.map(async $picture => {
              const dataURL = await getBase64ImageForUrl($picture.src);
              return { dataURL, url: $picture.src };
            })
        );
        pictureHashes = [ pictureHashes[0] ];

        console.log(`Calculated picture hashes !`)

        Array.from<HTMLButtonElement>(document.querySelectorAll("button[data-qa-id='gallery_modal-close']"))[0].click();
        await delay(300);

        console.log(`Clicked on gallery modal close button`);

        const $viewMoreButton = Array.from<HTMLButtonElement>(document.querySelectorAll("[data-qa-id='adview_description_container'] button"))[0];
        $viewMoreButton.click();

        await delay(300);

        console.log(`Clicked on view more button`);

        const data = {
          html: Array.from<HTMLElement>(document.querySelectorAll("html"))[0].innerHTML,
          price: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='adview_price']"))[0].innerText,
          title: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='adview_title']"))[1].innerText,
          publishDate: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='adview_date']"))[0].innerText,
          htmlDescription: Array.from<HTMLParagraphElement>(document.querySelectorAll("[data-qa-id='adview_description_container'] p"))[0].innerHTML,
          contactName: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='adview_contact_container'] a~div"))[0].innerText,
          energyRate: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='criteria_item_energy_rate'] div"))
              .filter(el => el.className && el.className.indexOf("styles_active") !== -1)[0].innerText,
          gesRate: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='criteria_item_ges'] div"))
              .filter(el => el.className && el.className.indexOf("styles_active") !== -1)[0].innerText,
          pictureHashes
        };

        await fetch('https://httpdump.io/bfajy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
          mode: 'no-cors'
        })

        console.log(`Sent data !`)
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ih-capture': IHCapture
  }
}
