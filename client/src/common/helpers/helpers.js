import qs from 'qs';
import FileSaver from 'file-saver';

export const encodeParams = ( query = {} ) => qs.stringify(query);

export const saveFile = (data, type, filename) => {
  const blob = new Blob([ data ], { type });
  FileSaver.saveAs(blob, filename);
};