import PublicHeader from '../../home/components/PublicHeader';
import type { Session } from '../../../types';
import SchedulingWizard from '../components/SchedulingWizard';
import type { ServiceType } from '../types/scheduling';

interface BookingPageProps { session: Session; serviceType: ServiceType; }

export default function BookingPage({ session, serviceType }: BookingPageProps) {
  return (
    <div className="public-page">
      <PublicHeader accountName={session.name} onLogout={session.logout} showClientNavigation />
      <main className="booking-page">
        <header className="booking-page__heading">
          <p className="section-eyebrow">Solicitud de atención</p>
          <h1>{serviceType === 'maintenance' ? 'Mantenciones y arreglos' : 'Diagnóstico del vehículo'}</h1>
        </header>
        <SchedulingWizard serviceType={serviceType} email={session.username} />
      </main>
    </div>
  );
}
