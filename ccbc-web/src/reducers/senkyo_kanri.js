const initialState = {
  pSenkyoPk: null,
};

export function senkyoKanriReducer(state = initialState, action) {
  if (action.type === "SETSENKYOKANRIDATA") {
    return {
      pSenkyoPk: action.pSenkyoPk,
    };
  }
  return state;
}
