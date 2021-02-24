// 社員検索→社員登録画面に遷移する際に渡す値を設定するアクションクラス

export function setShainTorokuData(pShainPk) {
  return {
    type: "SETSHAINTOROKUDATA",
    pShainPk: pShainPk,
  };
}
