import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ py: 2, px: 3, mt: 'auto', backgroundColor: 'background.paper', borderTop: 1, borderColor: 'divider' }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        OdontoAgenda &copy; {new Date().getFullYear()}
      </Typography>
    </Box>
  );
}
