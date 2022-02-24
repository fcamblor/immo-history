
export type ISODateString = string;

export type PictureHash = {
  dataURL: string,
  url: string
};

export type LetterRate = 'A'|'B'|'C'|'D'|'E'|'F'|'G';

export type ScrappedData = {
  html: string,
  price: number,
  title: string,
  publishDate: ISODateString,
  htmlDescription: string,
  contactName?: string,
  livingSurface: number,
  groundSurface?: number,
  energyRate?: LetterRate,
  gesRate?: LetterRate,
  pictureHashes: PictureHash[]
};

export type ServerConfig = {
  serverBaseUrl: string;
  authToken: string;
}
