import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

const ENV_VARS = [
  { label: 'IAM Service', key: 'VITE_API_BASE_URL_IAM' },
  { label: 'Patient Service', key: 'VITE_API_BASE_URL_PATIENT' },
  { label: 'Professional Service', key: 'VITE_API_BASE_URL_PROFESSIONAL' },
  { label: 'Scheduling Service', key: 'VITE_API_BASE_URL_SCHEDULING' },
  { label: 'Coverage Service', key: 'VITE_API_BASE_URL_COVERAGE' },
  { label: 'Billing Service', key: 'VITE_API_BASE_URL_BILLING' },
];

export default function Configuration() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>Configuración</Typography>
      <Paper sx={{ maxWidth: 600 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ p: 2, pb: 1 }}>
          Endpoints de servicios
        </Typography>
        <Divider />
        <List dense>
          {ENV_VARS.map((v) => (
            <ListItem key={v.key}>
              <ListItemText
                primary={v.label}
                secondary={import.meta.env[v.key] || 'No configurado'}
                secondaryTypographyProps={{ fontFamily: 'monospace', fontSize: 12 }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
