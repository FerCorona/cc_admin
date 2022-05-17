export const SET_INITIAL_STATE = 'SET_INITIAL_STATE';
export const SET_PERMISSIONS = 'SET_PERMISSIONS';

export const setPermissions = permissions => {
  return dispatch => {
    dispatch({
      type: SET_PERMISSIONS,
      payload: permissions
    })
  }
}