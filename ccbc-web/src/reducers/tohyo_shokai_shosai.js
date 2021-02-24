const initialState = {
  t_senkyo_pk: 0,
  t_presenter_pk: 0,
  t_rank: 0,
  t_totalcoin: 0,
};

// export function tohyo_shokai_shosaiReducer(state = initialState, action) {
//   return state
// }

export function tohyo_shokai_shosaiReducer(state = initialState, action) {
  if (action.type === "SETTOHYOSHOKAISHOSAIDATA") {
    return {
      t_presenter_pk: action.t_presenter_pk,
      t_senkyo_pk: action.t_senkyo_pk,
      t_rank: action.t_rank,
      t_totalcoin: action.t_totalcoin,
    };
  }
  return state;
}
