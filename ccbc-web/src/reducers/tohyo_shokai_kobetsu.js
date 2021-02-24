const initialState = {
  pSenkyoPk: 0,
  pName: "",
  pNendo: "",
};

export function tohyoShokaiKobetsuReducer(state = initialState, action) {
  if (action.type === "SETTOHYOSHOKAIKOBETSUDATA") {
    return {
      pSenkyoPk: action.pSenkyoPk,
      pName: action.pName,
      pNendo: action.pNendo,
    };
  }
  return state;
}
