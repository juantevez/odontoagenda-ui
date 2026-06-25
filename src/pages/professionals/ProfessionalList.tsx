import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Table, { type Column } from '../../components/common/Table';
import { professionalApi, type Professional } from '../../api/professional.api';
import { usePermissions } from '../../hooks/usePermissions';
import { specialtyLabel } from '../../utils/constants';

const DEFAULT_CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';

export default function ProfessionalList() {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const [query, setQuery] = useState('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['professionals', 'list', query],
    queryFn: () =>
      professionalApi.listByClinic({
        clinic_id: DEFAULT_CLINIC_ID,
        ...(query ? { q: query } : {}),
      }),
  });

  const columns: Column<Professional>[] = [
    { key: 'full_name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono' },
    {
      key: 'status',
      label: 'Estado',
      render: (p) => (
        <Chip
          label={p.status === 'Active' ? 'Activo' : 'Suspendido'}
          color={p.status === 'Active' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      key: 'licenses',
      label: 'Especialidades',
      render: (p) =>
        p.licenses?.filter((l) => l.is_valid).map((l) => specialtyLabel(l.specialty_code)).join(', ') || '—',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Profesionales</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/professionals/new')}
          >
            Nuevo profesional
          </Button>
        )}
      </Box>

      <TextField
        placeholder="Buscar por nombre o especialidad (ej: Orto, Cirugía, Estética, García)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchIcon /></InputAdornment>
          ),
        }}
      />

      <Table
        columns={columns}
        rows={Array.isArray(data) ? data : []}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No se encontraron profesionales"
      />
    </Box>
  );
}
