import binanceAdapter from "./binanceAdapter";
import bybitAdapter from "./bybitAdapter";
import bitgetAdapter from "./bitgetAdapter";
import gateAdapter from "./gateAdapter";
import { ExchangeAdapter } from "../../types";

export const adapters: ExchangeAdapter[] = [
  binanceAdapter,
  bybitAdapter,
  bitgetAdapter,
  gateAdapter,
];
