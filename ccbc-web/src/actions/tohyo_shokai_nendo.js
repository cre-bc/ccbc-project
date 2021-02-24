// 投票一覧→投票照会（年度）画面に遷移する際に渡す値を設定するアクションクラス

export function setTohyoShokaiNendoData(pNendo) {
  return {
    type: "SETTOHYOSHOKAINENDODATA",
    pNendo: pNendo,
  };
}
