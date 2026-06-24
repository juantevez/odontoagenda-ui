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
    { key: 'doc_number', label: 'Documento' },
    {
      key: 'birth_date',
      label: 'Fecha nacimiento',
      render: (p) => formatDate(p.birth_date),
    },
    { key: 'phone', label: 'Teléfono' },
    {
      key: 'email',
      label: 'Email',
      render: (p) => p.email ? <Chip label={p.email} size="small" /> : '—',
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
        placeholder="Buscar por nombre, documento..."
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
        rowKey={(p) => p.patient_id}
        isLoading={isLoading}
        total={data?.total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0); }}
        onRowClick={(p) => navigate(`/patients/${p.patient_id}`)}
        emptyMessage="No se encontraron pacientes"
      />
    </Box>
  );
}
