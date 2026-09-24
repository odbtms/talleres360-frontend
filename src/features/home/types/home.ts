export type ServiceIcon = 'calendar' | 'tracking' | 'shield';

export interface ServiceHighlight {
  title: string;
  description: string;
  icon: ServiceIcon;
}

export interface SchedulingOption {
  id: 'maintenance' | 'diagnostics';
  title: string;
  description: string;
  imageUrl: string;
}

export interface PublicPageProps {
  onLogin?: () => void | Promise<void>;
  busy?: boolean;
  loginDisabled?: boolean;
  error?: string;
  configurationMissing?: boolean;
}
