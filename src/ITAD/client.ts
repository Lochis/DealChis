import axios, { AxiosError } from 'axios';
import 'dotenv/config';

interface Deal {
  id: string;
  title: string;
  type: string;
  banner?: string;
  price: number;
  drm: { id: number, name: string; }[];
  url: string;
}

export class ITAD {

  clientId: string;
  clientSecret: string;
  apiKey: string;
  redirectUri: string;

  constructor() {
    this.checkENV();

    this.clientId = process.env.ITAD_CLIENT_ID!;
    this.clientSecret = process.env.ITAD_CLIENT_SECRET!;
    this.apiKey = process.env.ITAD_API_KEY!;
    this.redirectUri = process.env.ITAD_REDIRECT_URI!;
  }

  checkENV(): Boolean {
    let pass = true;
    if (!process.env.ITAD_CLIENT_ID) {
      console.error("ITAD Client ID is not in env");
      pass = false;
    }

    if (!process.env.ITAD_CLIENT_SECRET) {
      console.error("ITAD Client Secret is not in env");
      pass = false;
    }

    if (!process.env.ITAD_API_KEY) {
      console.error("ITAD API KEY is not in env");
      pass = false;
    }

    if (!process.env.ITAD_REDIRECT_URI) {
      console.error("ITAD REDIRECT URI is not in env");
      pass = false;
    }

    return pass;
  }

  async getDeals(limit = 100): Promise<Deal[]> {
    const api = axios.create({ baseURL: "https://api.isthereanydeal.com" });
    try {
      const { data } = await api.post("/deals/v2", {
        country: "US",
        limit,
        filter: { price: { min: 0, max: 0 } },   // $0/free deals — verify price filter shape against live API
      }, { headers: { "ITAD-API-Key": this.apiKey } });

      const deals: Deal[] = data.list.map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          type: item.type,
          banner: item.assets.banner300,
          price: item.deal.price.amount,
          regPrice: item.deal.regular.amount,
          drm: item.deal.drm,
          url: item.deal.url
        }
      });

      return deals;

    } catch (e) {
      const error = e as AxiosError;
      console.error(error.status);
      console.error(error.code);
      console.error(error.message);
    }
    return [];
  }

  cacheDeals(deals: Deal[]): void {
    // cache the deals so that the same ones aren't re-sent

  }

  getCached() {

  }
}

export const itad = new ITAD();
