import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Table, { type Column } from '../../components/common/Table';
import { usePatientSearch } from '../../hooks/usePatients';
import { formatDate } from '../../utils/formatters';
import type { Patient } from '../../types/patient.types';

export default function PatientList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = usePatientSearch({
    q: query || undefined,
    limit: rowsPerPage,
    offset: page * rowsPerPage,
  });

  const columns: Column<Patient>[] = [
    { key: 'full_name', label: 'Nombre' },
    {
      key: 'document_number',
      label: 'Documento',
      render: (p) => `${p.document_type} ${p.document_number}`,
    },
    {
      key: 'birth_date',
      label: 'Fecha nacimiento',
      render: (p) => `${formatDate(p.birth_date)} (${p.age_years} años)`,
    },
    { key: 'phone', label: 'Teléfono' },
    {
      key: 'has_alerts',
      label: 'Alertas',
      render: (p) => p.has_alerts
        ? <WarningAmberIcon color="warning" fontSize="small" />
        : '—',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Pacientes</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/patients/new')}
        >
          Nuevo paciente
        </Button>
      </Box>

      <TextField
        placeholder="Buscar por nombre, documento o teléfono..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
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
        rowKey={(p) => p.id}
        isLoading={isLoading}
        total={data?.total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0); }}
        onRowClick={(p) => navigate(`/patients/${p.id}`)}
        emptyMessage="No se encontraron pacientes"
      />
    </Box>
  );
}
