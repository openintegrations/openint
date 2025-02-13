import type React from "react";
import { useEffect, useCallback } from "react";
import type {
  ConnectionDetails,
  FilePickerOptions,
  ThemeColors,
  SelectedFile,
} from "../../types";
import {persistSelectedFilesOnConnection} from "../../openint";

interface GoogleDrivePickerProps {
  connectionDetails: ConnectionDetails;
  options: FilePickerOptions;
  themeColors: ThemeColors;
  onClose: () => void;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
// https://developers.google.com/drive/picker/guides/overview
export const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({
  connectionDetails,
  options,
  onClose,
}) => {
  const loadGoogleDriveAPI = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window.gapi !== "undefined" && window.gapi.load) {
        window.gapi.load("picker", { callback: resolve });
      } else {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
          window.gapi.load("picker", { callback: resolve });
        };
        document.body.appendChild(script);
      }
    });
  }, []);


  const openNativePicker = useCallback(() => {
    const fileAndFolderView = new window.google.picker.DocsView()
      .setIncludeFolders(true) 
      .setMode(window.google.picker.DocsViewMode.LIST)
      .setSelectFolderEnabled(true);

    const picker = new window.google.picker.PickerBuilder()
      .addView(fileAndFolderView)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(connectionDetails.accessToken)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  }, [connectionDetails.accessToken, options.multiselect]);

  function fileMapper(doc: any): SelectedFile {
    const isFolder = doc.mimeType === 'application/vnd.google-apps.folder';
    return {
      id: doc.id,
      name: doc.name,
      type: isFolder ? 'folder' : 'file',
    };
  }

  const pickerCallback = useCallback(
    async (data: any) => {
      if (
        data[window.google.picker.Response.ACTION] ===
        window.google.picker.Action.PICKED
      ) {
        const docs = data[window.google.picker.Response.DOCUMENTS];
        const selectedFiles: SelectedFile[] = docs.map(fileMapper);

        await persistSelectedFilesOnConnection(selectedFiles);
        if (options.onSelect) {
          options.onSelect(selectedFiles);
        }
      } else if (
        data[window.google.picker.Response.ACTION] ===
        window.google.picker.Action.CANCEL
      ) {
        close();
      }
    },
    [options.onSelect]
  );

  const open = useCallback(async () => {
    await loadGoogleDriveAPI();
    openNativePicker();
  }, [loadGoogleDriveAPI, openNativePicker]);

  const close = useCallback(() => {
    if (options.onClose) {
      options.onClose();
    }
    onClose();
  }, [options.onClose, onClose]);

  useEffect(() => {
    open();
  }, [open]);

  // Remove all UI rendering and just return null
  return null;
};
