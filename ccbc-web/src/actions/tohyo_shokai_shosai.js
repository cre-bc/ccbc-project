// 投票照会個別→投票照会詳細画面に遷移する際に渡す値を設定するアクションクラス

export function setTohyoShokaiShosaiData(
  tPresenterPk,
  tSenkyoPk,
  tRank,
  tTotalcoin
) {
  return {
    type: "SETTOHYOSHOKAISHOSAIDATA",
    t_presenter_pk: tPresenterPk,
    t_senkyo_pk: tSenkyoPk,
    t_rank: tRank,
    t_totalcoin: tTotalcoin,
  };
}
