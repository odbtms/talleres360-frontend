import logoUrl from '../../../assets/images/logo-talleres360.jpg';

interface BrandLogoProps {
  variant?: 'header' | 'footer';
}

export default function BrandLogo({ variant = 'header' }: BrandLogoProps) {
  return (
    <img
      className={`public-brand-logo public-brand-logo--${variant}`}
      src={logoUrl}
      alt="Talleres360, taller mecánico"
    />
  );
}
