import { html, css, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import {CSS_Global} from "../styles/ConstructibleStyleSheets";
import {ISODateString, LetterRate, PictureHash, ScrappedData} from "../../../domain/domain-types";

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
        function toIsoDate(textualDate: string): ISODateString {
          const lvl1Chunks = textualDate.split(" ");
          const [day, month, year] = lvl1Chunks[0].split("/");
          const [hours, minutes] = lvl1Chunks[2].split(":");
          const dateWithoutTZOffset = `${year}-${month}-${day}T${hours}:${minutes}:00.000`;
          return new Date(Date.parse(dateWithoutTZOffset)).toISOString();
        }

        const $galleryButtons = Array.from<HTMLButtonElement>(document.querySelectorAll("[data-qa-id='adview_spotlight_container'] button"));
        const $mainGalleryButton = $galleryButtons.filter(el => el.className && el.className.indexOf("styles_fullHeight") !== -1)[0];
        $mainGalleryButton.click();
        await delay(300);

        const getBase64ImageForUrl = (url: string): Promise<string> => {
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
            $pictures.map(async ($picture): Promise<PictureHash> => {
              const dataURL = await getBase64ImageForUrl($picture.src);
              return { dataURL, url: $picture.src };
            })
        );

        console.log(`Calculated picture hashes !`)

        Array.from<HTMLButtonElement>(document.querySelectorAll("button[data-qa-id='gallery_modal-close']"))[0].click();
        await delay(300);

        console.log(`Clicked on gallery modal close button`);

        const $viewMoreButton = Array.from<HTMLButtonElement>(document.querySelectorAll("[data-qa-id='adview_description_container'] button"))[0];
        if($viewMoreButton) {
          $viewMoreButton.click();
          await delay(300);
          console.log(`Clicked on view more button`);
        }

        const data: ScrappedData = {
          html: Array.from<HTMLElement>(document.querySelectorAll("html"))[0].outerHTML,
          price: Number(Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='adview_price']"))[0].innerText.replace(/[\s€]/gi, "")),
          title: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='adview_title']"))[1].innerText,
          publishDate: toIsoDate(Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='adview_date']"))[0].innerText),
          htmlDescription: Array.from<HTMLParagraphElement>(document.querySelectorAll("[data-qa-id='adview_description_container'] p"))[0].innerHTML,
          contactName: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='adview_contact_container'] a~div"))[0].innerText,
          energyRate: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='criteria_item_energy_rate'] div"))
              .filter(el => el.className && el.className.indexOf("styles_active") !== -1)[0].innerText as LetterRate,
          gesRate: Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='criteria_item_ges'] div"))
              .filter(el => el.className && el.className.indexOf("styles_active") !== -1)[0].innerText as LetterRate,
          livingSurface: Number(Array.from<HTMLDivElement>(document.querySelectorAll("[data-qa-id='criteria_item_square']"))[0].innerText.replace(/[^\d]+(\d+)[^\d]+/g, "$1")),
          pictureHashes
        };

        await fetch('http://localhost:8001/blah', {
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
