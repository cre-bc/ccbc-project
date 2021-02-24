const initialState = {
  tTohyoPk: 0,
  tZoyoPk: 0,
  title: "",
  tohyosha: "",
  coin: 0,
};

export function coinShokaiReducer(state = initialState, action) {
  if (action.type === "SETTOHYODATA") {
    return {
      tTohyoPk: action.tTohyoPk,
      tZoyoPk: action.tZoyoPk,
      title: action.title,
      tohyosha: action.tohyosha,
      coin: action.coin,
    };
  } else if (action.type === "SETZOYODATA") {
    console.log("SETZOYODATA");
    return {
      tTohyoPk: action.tTohyoPk,
      tZoyoPk: action.tZoyoPk,
      title: action.title,
      tohyosha: action.tohyosha,
      coin: action.coin,
    };
  }
  return state;
}
