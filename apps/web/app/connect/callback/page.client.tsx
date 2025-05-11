'use client'

import React from 'react'
import {Button} from '@openint/shadcn/ui'

export function ConnectCallbackClient({
  data,
  debug = true,
}: {
  data: unknown
  debug?: boolean
}) {
  React.useEffect(() => {
    const channel = new BroadcastChannel('oauth-channel');
    const opener = window.opener as Window | null;
    
    if (!debug) {
      try {
        // Try direct communication first
        if (opener) {
          opener.postMessage(data, '*');
        }
      } catch (e) {
        console.log('Direct communication failed, using broadcast channel');
      }
      
      // Always broadcast as fallback
      channel.postMessage({
        type: 'oauth_complete',
        data
      });
    }
    
    return () => {
      channel.close();
    };
  }, [data, debug]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      {!debug ? (
        <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <div>
          <pre className="text-muted-foreground max-w-[80vw] overflow-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const channel = new BroadcastChannel('oauth-channel');
                const opener = window.opener as Window | null;
                
                try {
                  // Try direct communication first
                  if (opener) {
                    opener.postMessage(data, '*');
                  }
                } catch (e) {
                  console.log('Direct communication failed, using broadcast channel');
                }
                
                // Always broadcast as fallback
                channel.postMessage({
                  type: 'oauth_complete',
                  data
                });
                
                channel.close();
                window.close();
              }}>
              Complete Authentication
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const channel = new BroadcastChannel('oauth-channel');
                const opener = window.opener as Window | null;
                const errorData = {success: false, error: 'Authentication failed'};
                
                try {
                  // Try direct communication first
                  if (opener) {
                    opener.postMessage(errorData, '*');
                  }
                } catch (e) {
                  console.log('Direct communication failed, using broadcast channel');
                }
                
                // Always broadcast as fallback
                channel.postMessage({
                  type: 'oauth_error',
                  data: errorData
                });
                
                channel.close();
                window.close();
              }}>
              Simulate Error
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
