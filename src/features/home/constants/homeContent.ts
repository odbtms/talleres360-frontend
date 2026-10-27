import maintenanceImageUrl from '../../../assets/images/mantenciones-arreglos.png';
import diagnosticsImageUrl from '../../../assets/images/diagnostico.png';
import type { SchedulingOption, ServiceHighlight } from '../types/home';

export const SERVICE_HIGHLIGHTS: ServiceHighlight[] = [
  {
    title: 'Solicita tus repuestos',
    description: 'Elige productos del catálogo y envía tu carrito al taller. No realizamos cobros en línea.',
    icon: 'calendar',
  },
  {
    title: 'Sigue cada avance',
    description: 'Consulta tus solicitudes actuales y anteriores, desde la revisión del operador hasta el retiro.',
    icon: 'tracking',
  },
  {
    title: 'Información segura',
    description: 'Accede con tu cuenta autorizada y mantén protegidos los datos asociados a cada servicio.',
    icon: 'shield',
  },
];

export const SCHEDULING_OPTIONS: SchedulingOption[] = [
  {
    id: 'maintenance',
    title: 'Mantenciones y arreglos',
    description: 'Mantenciones preventivas, servicios programados y reparaciones para conservar tu vehículo en buenas condiciones.',
    imageUrl: maintenanceImageUrl,
  },
  {
    id: 'diagnostics',
    title: 'Diagnósticos',
    description: 'Una revisión especializada para identificar el origen de una falla antes de definir la reparación necesaria.',
    imageUrl: diagnosticsImageUrl,
  },
];
