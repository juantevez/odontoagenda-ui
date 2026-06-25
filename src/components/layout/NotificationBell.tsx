import { useState } from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useInbox, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications';
import type { InboxNotification } from '../../api/notification.api';

const TYPE_ICONS: Record<string, string> = {
  appointment_booked:    '📅',
  appointment_cancelled: '❌',
  appointment_no_show:   '⚠️',
  license_expiring_soon: '🪪',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export default function NotificationBell() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const { data, isLoading } = useInbox();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unread = data?.unread_count ?? 0;
  const items = data?.items ?? [];

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.currentTarget);
  };
  const handleClose = () => setAnchor(null);

  const handleItemClick = (n: InboxNotification) => {
    if (!n.is_read) {
      markRead.mutate(n.id);
    }
  };

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton color="inherit" onClick={handleOpen}>
          <Badge badgeContent={unread > 0 ? unread : undefined} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 380, maxHeight: 520 } }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notificaciones
            {unread > 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 1, bgcolor: 'error.main', color: 'white', borderRadius: 10, px: 0.8, py: 0.2 }}>
                {unread}
              </Typography>
            )}
          </Typography>
          {unread > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon fontSize="small" />}
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              sx={{ fontSize: 12 }}
            >
              Marcar todas
            </Button>
          )}
        </Box>

        {/* Body */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">Sin notificaciones</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflowY: 'auto', maxHeight: 420 }}>
            {items.map((n, i) => (
              <Box key={n.id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => handleItemClick(n)}
                  sx={{
                    cursor: n.is_read ? 'default' : 'pointer',
                    bgcolor: n.is_read ? 'transparent' : 'primary.50',
                    '&:hover': { bgcolor: n.is_read ? 'action.hover' : 'primary.100' },
                    transition: 'background 0.15s',
                    py: 1.5,
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 20, mt: 0.2, minWidth: 28 }}>
                    {TYPE_ICONS[n.type] ?? '🔔'}
                  </Typography>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={n.is_read ? 400 : 600}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="span">
                        <Typography variant="caption" color="text.secondary" display="block">
                          {n.body}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {relativeTime(n.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                  {!n.is_read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, flexShrink: 0 }} />
                  )}
                </ListItem>
                {i < items.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
