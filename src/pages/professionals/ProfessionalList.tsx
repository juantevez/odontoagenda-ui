import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Chip from '@mui/material/Chip';
import { useQuery } from '@tanstack/react-query';
import Table, { type Column } from '../../components/common/Table';
import { professionalApi, type Professional } from '../../api/professional.api';
import { usePermissions } from '../../hooks/usePermissions';

export default function ProfessionalList() {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['professionals', query],
    queryFn: () => professionalApi.list({ q: query || undefined }),
  });

  const columns: Column<Professional>[] = [
    { key: 'full_name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono' },
    {
      key: 'is_active',
      label: 'Estado',
      render: (p) => (
        <Chip
          label={p.is_active ? 'Activo' : 'Suspendido'}
          color={p.is_active ? 'success' : 'error'}
          size="small"
        />
      ),
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
        placeholder="Buscar profesional..."
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
        rows={data?.items ?? []}
        rowKey={(p) => p.professional_id}
        isLoading={isLoading}
        emptyMessage="No se encontraron profesionales"
      />
    </Box>
  );
}
