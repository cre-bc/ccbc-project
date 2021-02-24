const initialState = {
  pNendo: 0,
};

// export function tohyo_shokai_nendoReducer(state = initialState, action) {
//   return state
// }

export function tohyo_shokai_nendoReducer(state = initialState, action) {
  if (action.type === "SETTOHYOSHOKAINENDODATA") {
    return {
      pNendo: action.pNendo,
    };
  }
  return state;
}
