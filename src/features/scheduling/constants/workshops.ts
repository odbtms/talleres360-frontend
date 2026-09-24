import type { Region, Workshop } from '../types/scheduling';

export const REGIONS: Region[] = [
  { id: 'biobio', name: 'Biobío' },
  { id: 'maule', name: 'Maule' },
  { id: 'araucania', name: 'La Araucanía' },
];

export const WORKSHOPS: Workshop[] = [
  { id: 1, name: 'Talleres360 Concepción Centro', regionId: 'biobio' },
  { id: 2, name: 'Talleres360 Talcahuano', regionId: 'biobio' },
  { id: 3, name: 'Talleres360 San Pedro de la Paz', regionId: 'biobio' },
  { id: 4, name: 'Talleres360 Chiguayante', regionId: 'biobio' },
  { id: 5, name: 'Talleres360 Los Ángeles', regionId: 'biobio' },
  { id: 6, name: 'Talleres360 Coronel', regionId: 'biobio' },
  { id: 7, name: 'Talleres360 Lota', regionId: 'biobio' },
  { id: 8, name: 'Talleres360 Talca Centro', regionId: 'maule' },
  { id: 9, name: 'Talleres360 Curicó', regionId: 'maule' },
  { id: 10, name: 'Talleres360 Linares', regionId: 'maule' },
  { id: 11, name: 'Talleres360 Constitución', regionId: 'maule' },
  { id: 12, name: 'Talleres360 Cauquenes', regionId: 'maule' },
  { id: 13, name: 'Talleres360 Molina', regionId: 'maule' },
  { id: 14, name: 'Talleres360 Parral', regionId: 'maule' },
  { id: 15, name: 'Talleres360 Temuco Centro', regionId: 'araucania' },
  { id: 16, name: 'Talleres360 Padre Las Casas', regionId: 'araucania' },
  { id: 17, name: 'Talleres360 Villarrica', regionId: 'araucania' },
  { id: 18, name: 'Talleres360 Angol', regionId: 'araucania' },
  { id: 19, name: 'Talleres360 Pucón', regionId: 'araucania' },
  { id: 20, name: 'Talleres360 Victoria', regionId: 'araucania' },
];
