import qs from 'qs';

export const encodeParams = ( query = {} ) => qs.stringify(query);
