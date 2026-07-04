import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_MAP = {
  // Licenca / Anëtarësia
  'Aktive':        { className: 'bg-green-100 text-green-800 border-green-200' },
  'Aktiv':         { className: 'bg-green-100 text-green-800 border-green-200' },
  'Skaduar':       { className: 'bg-red-100 text-red-700 border-red-200' },
  'I skaduar':     { className: 'bg-red-100 text-red-700 border-red-200' },
  'I pezulluar':   { className: 'bg-orange-100 text-orange-700 border-orange-200' },
  'Joaktiv':       { className: 'bg-gray-100 text-gray-500 border-gray-200' },
  'Joaktive':      { className: 'bg-gray-100 text-gray-500 border-gray-200' },
  'I transferuar': { className: 'bg-blue-100 text-blue-700 border-blue-200' },

  // Gara
  'Draft':        { className: 'bg-gray-100 text-gray-600 border-gray-200' },
  'Hapur':        { className: 'bg-green-100 text-green-800 border-green-200' },
  'Mbyllur':      { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'Përfunduar':   { className: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Anuluar':      { className: 'bg-red-100 text-red-700 border-red-200' },
  'Planifikuar':  { className: 'bg-blue-100 text-blue-800 border-blue-200' },

  // Prezenca
  'Regjistruar':  { className: 'bg-gray-100 text-gray-600 border-gray-200' },
  'Prezent':      { className: 'bg-green-100 text-green-800 border-green-200' },
  'Mungon':       { className: 'bg-red-100 text-red-700 border-red-200' },

  // Rezultate
  'Provizor':     { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'Final':        { className: 'bg-green-100 text-green-800 border-green-200' },
  'Finalizuar':   { className: 'bg-green-100 text-green-800 border-green-200' },

  // Armë
  'Aktive_weapon':         { className: 'bg-green-100 text-green-800 border-green-200' },
  'E dëmtuar':             { className: 'bg-red-100 text-red-700 border-red-200' },
  'E hequr nga përdorimi': { className: 'bg-gray-100 text-gray-500 border-gray-200' },

  // Klub
  'active':    { className: 'bg-green-100 text-green-800 border-green-200' },
  'inactive':  { className: 'bg-gray-100 text-gray-500 border-gray-200' },
  'suspended': { className: 'bg-orange-100 text-orange-700 border-orange-200' },
};

const STATUS_LABELS = {
  'active': 'Aktiv', 'inactive': 'Joaktiv', 'suspended': 'I pezulluar',
};

export default function StatusBadge({ status, className }) {
  if (!status) return null;
  const config = STATUS_MAP[status] || { className: 'bg-gray-100 text-gray-600 border-gray-200' };
  const label = STATUS_LABELS[status] || status;
  return (
    <Badge className={cn('text-[11px] font-medium border', config.className, className)}>
      {label}
    </Badge>
  );
}