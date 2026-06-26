import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import BadgeIcon from '@mui/icons-material/Badge';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuthStore } from '../../store/auth.store';
import type { UserRole } from '../../types/user.types';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  {
    label: 'Pacientes',
    icon: <PeopleIcon />,
    path: '/patients',
    allowedRoles: ['superadmin', 'admin_sucursal', 'recepcionista'],
  },
  {
    label: 'Mi perfil',
    icon: <PersonIcon />,
    path: '/my-patient-profile',
    allowedRoles: ['paciente'],
  },
  { label: 'Turnos', icon: <CalendarMonthIcon />, path: '/appointments' },
  {
    label: 'Agenda Clínica',
    icon: <TodayIcon />,
    path: '/professional/schedule',
    allowedRoles: ['superadmin', 'admin_sucursal', 'recepcionista', 'profesional'],
  },
  {
    label: 'Profesionales',
    icon: <BadgeIcon />,
    path: '/professionals',
    allowedRoles: ['superadmin', 'admin_sucursal', 'recepcionista'],
  },
  {
    label: 'Facturación',
    icon: <ReceiptIcon />,
    path: '/billing',
    allowedRoles: ['superadmin', 'admin_sucursal', 'recepcionista'],
  },
  { label: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
];

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = usePermissions();
  const user = useAuthStore((s) => s.user);

  const visibleItems = navItems.filter((item) =>
    item.allowedRoles ? hasRole(...item.allowedRoles) : true
  );

  const getPath = (item: NavItem): string => {
    if (item.path === '/my-patient-profile') {
      return user?.patient_id ? `/patients/${user.patient_id}` : '/dashboard';
    }
    return item.path;
  };

  const isSelected = (item: NavItem): boolean => {
    if (item.path === '/my-patient-profile') {
      return user?.patient_id
        ? location.pathname === `/patients/${user.patient_id}`
        : false;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {visibleItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isSelected(item)}
              onClick={() => navigate(getPath(item))}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
