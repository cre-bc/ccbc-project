// 選挙管理→選挙登録画面に遷移する際に渡す値を設定するアクションクラス

export function setSenkyoKanriData(pSenkyoPk) {
  return {
    type: "SETSENKYOKANRIDATA",
    pSenkyoPk: pSenkyoPk,
  };
}
