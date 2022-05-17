const initialState = { 
  permissions: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {

    case 'SET_PERMISSIONS': {
      return {
        ...initialState,
        permissions: action.payload
      };
    }

    default:
      return state;
  }
}

export default reducer;