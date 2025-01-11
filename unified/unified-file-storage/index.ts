import { googleDriveAdapter } from './adapters/google-adapter';

export { fileStorageRouter as default } from './router';

// Add the Google Drive adapter to the adapter map
export const adapters = {
  google: googleDriveAdapter,
  // other adapters...
};
