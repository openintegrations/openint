import type React from "react";
import { useEffect, useCallback } from "react";
import type {
  ConnectionDetails,
  FilePickerOptions,
  ThemeColors,
  SelectedFile,
} from "../../types";

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
  themeColors,
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
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(connectionDetails.accessToken)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  }, [connectionDetails.accessToken]);

  const pickerCallback = useCallback(
    (data: any) => {
      if (
        data[window.google.picker.Response.ACTION] ===
        window.google.picker.Action.PICKED
      ) {
        const docs = data[window.google.picker.Response.DOCUMENTS];
        const selectedFiles: SelectedFile[] = docs.map((doc: any) => ({
          id: doc[window.google.picker.Document.ID],
          name: doc[window.google.picker.Document.NAME],
          url: doc[window.google.picker.Document.URL],
          parentReference: {
            driveId: doc[window.google.picker.Document.PARENT_ID] || "",
          },
          "@sharePoint.endpoint": "",
        }));

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

  const buttonStyle: React.CSSProperties = {
    backgroundColor: themeColors.button,
    color: themeColors.buttonForeground,
    border: `1px solid ${themeColors.buttonStroke}`,
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <div style={{ color: themeColors.foreground }}>
      <h2 style={{ color: themeColors.primary }}>Google Drive Picker</h2>
      <p>Google Drive picker is open.</p>
      <button style={buttonStyle} onClick={close}>
        Close Picker
      </button>
    </div>
  );
};
