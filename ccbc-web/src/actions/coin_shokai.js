import { isNull } from "util";

// コイン照会→コメント照会に遷移する際に渡す値を設定するアクションクラス

export function setData(pTTohyoPk, pTZoyoPk, pTitle, pTohyosha, pCoin) {
  if (pTTohyoPk == null) {
    return {
      type: "SETZOYODATA",
      tTohyoPk: null,
      tZoyoPk: pTZoyoPk,
      title: pTitle,
      tohyosha: pTohyosha,
      coin: pCoin,
    };
  } else {
    return {
      type: "SETTOHYODATA",
      tTohyoPk: pTTohyoPk,
      tZoyoPk: null,
      title: pTitle,
      tohyosha: pTohyosha,
      coin: pCoin,
    };
  }
}
