import React, { useState } from 'react';
import Revision from './Revision';
import { mockSolicitudes, mockOperadores } from '../data/mocks'; // Asegúrate de que esta ruta exista

export default function RevisionPage() {
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes);

  const handleUpdate = (actualizada) => {
    setSolicitudes(prev =>
      prev.map(s => s.id === actualizada.id ? actualizada : s)
    );
  };

  return (
    <Revision
      solicitudes={solicitudes}
      mockOperadores={mockOperadores}
      onUpdateSolicitud={handleUpdate}
    />
  );
}