import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { QRCodeSVG } from 'qrcode.react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { specialtyLabel } from '../../utils/constants';

export interface TicketData {
  appointmentId:    string;
  patientName:      string;
  professionalName: string;
  procedureCode:    string;
  slotStart:        string;
  slotEnd:          string;
  clinicName?:      string;
}

interface BookingTicketProps {
  ticket: TicketData;
  onClose?: () => void;
}

export default function BookingTicket({ ticket, onClose }: BookingTicketProps) {
  const navigate  = useNavigate();
  const slotDate  = parseISO(ticket.slotStart);
  const dateLabel = format(slotDate, "EEEE d 'de' MMMM yyyy", { locale: es });
  const timeStart = format(slotDate, 'HH:mm');
  const timeEnd   = format(parseISO(ticket.slotEnd), 'HH:mm');

  const handleDone = () => {
    if (onClose) onClose();
    else navigate('/appointments');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 2 }}>
      {/* Success header */}
      <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main', mb: 1 }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>¡Turno confirmado!</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Guardá este ticket para presentarlo en la clínica
      </Typography>

      {/* Ticket card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 380,
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 4,
        }}
      >
        {/* Header strip */}
        <Box sx={{ bgcolor: 'primary.main', py: 1.5, px: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="primary.contrastText" letterSpacing={3} fontWeight={700}>
            ODONTOAGENDA — TURNO
          </Typography>
        </Box>

        {/* Perforation dots */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, mt: '-1px' }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'background.default', border: '1px solid', borderColor: 'primary.main' }} />
          ))}
        </Box>

        {/* Ticket body */}
        <Box sx={{ px: 3, py: 2 }}>
          <Chip
            label={specialtyLabel(ticket.procedureCode)}
            color="primary"
            size="small"
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
            <PersonIcon sx={{ color: 'text.secondary', mt: 0.3, fontSize: 20 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">Profesional</Typography>
              <Typography fontWeight={600}>{ticket.professionalName}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
            <EventIcon sx={{ color: 'text.secondary', mt: 0.3, fontSize: 20 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">Fecha</Typography>
              <Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>{dateLabel}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <AccessTimeIcon sx={{ color: 'text.secondary', mt: 0.3, fontSize: 20 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">Horario</Typography>
              <Typography fontWeight={600}>{timeStart} – {timeEnd} hs</Typography>
            </Box>
          </Box>

          {ticket.clinicName && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              📍 {ticket.clinicName}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* QR */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <QRCodeSVG
              value={`odontoagenda://appointment/${ticket.appointmentId}`}
              size={120}
              level="M"
              includeMargin
            />
            <Typography variant="caption" color="text.secondary">
              Escaneá al llegar
            </Typography>
            <Typography variant="caption" color="text.disabled" fontFamily="monospace">
              #{ticket.appointmentId.slice(0, 8).toUpperCase()}
            </Typography>
          </Box>
        </Box>

        {/* Bottom perforation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, mb: '-1px' }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'background.default', border: '1px solid', borderColor: 'primary.main' }} />
          ))}
        </Box>

        <Box sx={{ bgcolor: 'primary.main', py: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="primary.contrastText">
            ¡Nos vemos pronto! 🦷
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={handleDone}
        sx={{ mt: 4, minWidth: 200 }}
      >
        Ver mis turnos
      </Button>
    </Box>
  );
}
