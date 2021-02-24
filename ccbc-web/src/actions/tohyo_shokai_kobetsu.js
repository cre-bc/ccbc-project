// 投票一覧→投票照会個別画面に遷移する際に渡す値を設定するアクションクラス

export function setTohyoShokaiKobetsuData(pSenkyoPk, pName, pNendo) {
  return {
    type: "SETTOHYOSHOKAIKOBETSUDATA",
    pSenkyoPk: pSenkyoPk,
    pName: pName,
    pNendo: pNendo,
  };
}
