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

        const selectPotentialNthElement = function<T, EL extends HTMLElement>(opts: { selector: string, nth?: number|undefined, transformer: (el: EL) => T, filter?: (el: EL) => boolean }): T|undefined {
          let els = Array.from<EL>(document.querySelectorAll(opts.selector));
          const filter = opts.filter;
          if(filter) {
            els = els.filter(el => filter(el));
          }
          const el: EL|undefined = els[opts.nth || 0];
          if(el !== undefined) {
            return opts.transformer(el);
          }
          return undefined;
        }
        const selectNthElement = function<T, EL extends HTMLElement>(opts: { selector: string, nth?: number|undefined, transformer: (el: EL) => T, filter?: (el: EL) => boolean }): T {
          const result = selectPotentialNthElement(opts);
          if(result === undefined) {
            throw new Error(`Unexpected undefined value for selectNthElement(${JSON.stringify(opts)}) call`)
          }
          return result;
        }

        const data: ScrappedData = {
          html: selectNthElement({ selector: "html", transformer: (el) => el.outerHTML }),
          price: selectNthElement({ selector: "[data-qa-id='adview_price']", transformer: (el) => Number(el.innerText.replace(/[\s€]/gi, "")) }),
          title: selectNthElement({ selector: "[data-qa-id='adview_title']", nth: 1, transformer: (el) => el.innerText }),
          publishDate: selectNthElement({ selector: "[data-qa-id='adview_date']", transformer: (el) => toIsoDate(el.innerHTML) }),
          htmlDescription: selectNthElement({ selector: "[data-qa-id='adview_description_container'] p", transformer: (el) => el.innerHTML }),
          contactName: selectPotentialNthElement({ selector: "[data-qa-id='adview_contact_container'] a~div", transformer: (el) => el.innerText }),
          energyRate: selectPotentialNthElement({
            selector: "[data-qa-id='criteria_item_energy_rate'] div",
            filter: (el) => !!el.className && el.className.indexOf("styles_active") !== -1,
            transformer: el => el.innerText as LetterRate
          }),
          gesRate: selectPotentialNthElement({
            selector: "[data-qa-id='criteria_item_ges'] div",
            filter: (el) => !!el.className && el.className.indexOf("styles_active") !== -1,
            transformer: el => el.innerText as LetterRate
          }),
          livingSurface: selectNthElement({ selector: "[data-qa-id='criteria_item_square']", transformer: el => Number(el.innerText.replace(/[^\d]+(\d+)[^\d]+/g, "$1")) }),
          groundSurface: selectPotentialNthElement({ selector: "[data-qa-id='criteria_item_land_plot_surface']", transformer: el => Number(el.innerText.replace(/[^\d]+(\d+)[^\d]+/g, "$1")) }),
          pictureHashes
        };

        await fetch('http://localhost:8001/blah', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
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
