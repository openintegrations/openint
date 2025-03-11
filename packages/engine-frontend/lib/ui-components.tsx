import React from 'react';

// Mock implementations of UI components
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
  size?: string;
}> = ({ children, ...props }) => <button {...props}>{children}</button>;

export const Dialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: React.ReactNode;
}> = ({ children }) => <div className="dialog">{children}</div>;

export const DialogContent: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ children, className, style }) => <div className={className} style={style}>{children}</div>;

export const DialogHeader: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ children, className }) => <div className={className}>{children}</div>;

export const DialogTitle: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => <h2>{children}</h2>;

export const DialogDescription: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => <p>{children}</p>;

export const DialogFooter: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ children, className }) => <div className={className}>{children}</div>;

export const DialogTrigger: React.FC<{
  asChild?: boolean;
  children?: React.ReactNode;
}> = ({ children }) => <div>{children}</div>;

export const Tooltip: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => <div>{children}</div>;

export const TooltipTrigger: React.FC<{
  asChild?: boolean;
  children: React.ReactNode;
}> = ({ children }) => <div>{children}</div>;

export const TooltipContent: React.FC<{
  side?: string;
  children: React.ReactNode;
}> = ({ children }) => <div>{children}</div>;

export const TooltipProvider: React.FC<{
  delayDuration?: number;
  children: React.ReactNode;
}> = ({ children }) => <div>{children}</div>;

// Additional components for IntegrationSearch.tsx
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} />;

export const Separator: React.FC = () => <hr />;

// Utility function
export const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export const parseCategory = (category: string) => category.charAt(0).toUpperCase() + category.slice(1);

// Define Connection interface
interface Connection {
  id: string;
  connectorConfig: {
    id: string;
    connector: {
      name: string;
      displayName: string;
    };
  };
  connectorName: string;
  pipelineIds: string[];
  integration?: {
    logoUrl?: string;
    logo_url?: string;
  };
  status?: string | null;
  statusMessage?: string | null;
  createdAt: string;
  envName?: string;
  type?: string;
}

// Mock ConnectionDetails component
export const ConnectionDetails: React.FC<{
  connection: Connection;
  deleteConnection: () => void;
  onClose: () => void;
  isDeleting: boolean;
  open: boolean;
  isOAuthConnector: boolean;
  onReconnect: () => void;
}> = ({ connection: _connection, deleteConnection, onClose, isDeleting: _isDeleting, open: _open, isOAuthConnector, onReconnect }) => (
  <div className="connection-details">
    <h2>Connection Details</h2>
    <button onClick={onClose}>Close</button>
    <button onClick={deleteConnection}>Delete</button>
    {isOAuthConnector && <button onClick={onReconnect}>Reconnect</button>}
  </div>
);

// Card component
export const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => <div className={className}>{children}</div>;

// ConnectionRawCard component
export const ConnectionRawCard: React.FC<{
  connection: any;
  connector: any;
  className?: string;
  children?: React.ReactNode;
}> = ({ connection, connector, className, children }) => (
  <div className={className}>
    <div>Connection: {connection.id}</div>
    <div>Connector: {connector.name}</div>
    {children}
  </div>
); 