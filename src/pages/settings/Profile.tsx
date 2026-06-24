import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { useAuthStore } from '../../store/auth.store';

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>Mi perfil</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28 }}>
            {user.role[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.user_id}</Typography>
            <Chip label={user.role} size="small" color="primary" />
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography color="text.secondary" variant="body2">ID de usuario</Typography>
            <Typography variant="body1" fontFamily="monospace">{user.user_id}</Typography>
          </Grid>
          {user.patient_id && (
            <Grid item xs={12}>
              <Typography color="text.secondary" variant="body2">ID de paciente</Typography>
              <Typography variant="body1" fontFamily="monospace">{user.patient_id}</Typography>
            </Grid>
          )}
          {user.family_id && (
            <Grid item xs={12}>
              <Typography color="text.secondary" variant="body2">ID familiar</Typography>
              <Typography variant="body1" fontFamily="monospace">{user.family_id}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}
