const initialState = {
  pShainPk: 0,
};

export function shainTorokuReducer(state = initialState, action) {
  if (action.type === "SETSHAINTOROKUDATA") {
    return {
      pShainPk: action.pShainPk,
    };
  }
  return state;
}
