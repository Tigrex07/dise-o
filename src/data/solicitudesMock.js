export const MOCK_SOLICITUDES = [
  {
    id: '2025-001',
    pieza: 'Molde Inyección #45',
    maquina: 'INJ-03',
    area: 'Plásticos',
    tipo: 'Daño físico',
    prioridad: 'Media',
    estado: 'En proceso',
    solicitante: 'Ana López',
    fecha: '2025-10-25',
    fechaFinalizacion: null,
    diasAbierto: 25,
    tiempoMaquina: 0,
    observaciones: '',
    detalles: 'Grieta en la base que requiere soldadura especializada.'
  },
  {
    id: '2025-002',
    pieza: 'Prensa #12 Insert',
    maquina: 'PRE-12',
    area: 'Metalurgia',
    tipo: 'Ajuste de tolerancia',
    prioridad: 'Alta',
    estado: 'Pendiente',
    solicitante: 'Luis García',
    fecha: '2025-11-10',
    fechaFinalizacion: null,
    diasAbierto: 10,
    tiempoMaquina: 0,
    observaciones: '',
    detalles: 'Ajuste de tolerancia en inserto.'
  },
  {
    id: '2025-003',
    pieza: 'Cilindro Hidráulico #7',
    maquina: 'HID-07',
    area: 'Mantenimiento',
    tipo: 'Fuga de aceite',
    prioridad: 'Crítica',
    estado: 'Terminado',
    solicitante: 'María Torres',
    trabajadoPor: 'Carlos Salas', // ✅ Maquinista agregado
    fecha: '2025-10-10',
    fechaFinalizacion: '2025-10-15',
    diasAbierto: 5,
    tiempoMaquina: 6,
    observaciones: 'Se recomienda revisión mensual.',
    detalles: 'Cambio de sellos y limpieza interna.'
  }
];