import { useState, useEffect } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Divider, Grid,
  Button, useMediaQuery, createTheme, ThemeProvider, CssBaseline, Chip,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LabelIcon from '@mui/icons-material/Label';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import ImageIcon from '@mui/icons-material/Image';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import InboxIcon from '@mui/icons-material/Inbox';

import AnalyticsPage from '../pages/admin/AnalyticsPage';
import CategoryManager from '../pages/admin/CategoryManager';
import SubcategoryManager from '../pages/admin/SubcategoryManager';
import TitleManager from '../pages/admin/TitleManager';
import PriceManager from '../pages/admin/PriceManager';
import BannerManager from '../pages/admin/BannerManager';
import UserManager from '../pages/admin/UserManager';
import ReligionManager from '../pages/admin/ReligionManager';
import ConfiManager from '../pages/admin/ConfiManager';
import WhatsAppBotManager from '../pages/admin/WhatsAppBotManager';
import LeadsManager from '../pages/admin/LeadsManager';
import InboxManager from '../pages/admin/InboxManager';
import CreateListing from './CreateListing';
import api from '../api';
import { StatCard, SurfaceCard, PageContainer } from './admin/AdminUiKit';

const DRAWER_WIDTH = 240;
const MINI_WIDTH = 64;

const ROLE_COLORS = { admin: 'error', manager: 'warning', sales: 'info', viewer: 'default' };

const theme = createTheme({
  palette: {
    primary: { main: '#2e7d32', light: '#e8f5e9', dark: '#1b5e20' },
    background: { default: '#f6faf7' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: 'none', boxShadow: '2px 0 8px rgba(0,0,0,.06)' },
      },
    },
  },
});

// All nav items with required permission key
const ALL_NAV = [
  { key: 'overview',      label: 'Dashboard',     Icon: DashboardIcon,       permission: 'canViewDashboard' },
  { key: 'analytics',     label: 'Analytics',     Icon: BarChartIcon,        permission: 'canViewAnalytics' },
  { key: 'leads',         label: 'Leads',         Icon: LeaderboardIcon,     permission: 'canManageLeads' },
  { key: 'inbox',         label: 'WA Inbox',      Icon: InboxIcon,           permission: 'canManageWhatsApp' },
  { key: 'listings',      label: 'Products',      Icon: Inventory2Icon,      permission: 'canManageProducts' },
  { key: 'categories',    label: 'Categories',    Icon: CategoryIcon,        permission: 'canManageCategories' },
  { key: 'subcategories', label: 'Subcategories', Icon: AccountTreeIcon,     permission: 'canManageCategories' },
  { key: 'titles',        label: 'Titles',        Icon: LabelIcon,           permission: 'canManageCategories' },
  { key: 'prices',        label: 'Prices',        Icon: AttachMoneyIcon,     permission: 'canManageCategories' },
  { key: 'religions',     label: 'Religions',     Icon: SelfImprovementIcon, permission: 'canManageCategories' },
  { key: 'banners',       label: 'Banners',       Icon: ImageIcon,           permission: 'canManageBanners' },
  { key: 'whatsapp-bot',  label: 'WhatsApp Bot',  Icon: WhatsAppIcon,        permission: 'canManageWhatsApp' },
  { key: 'users',         label: 'Users',         Icon: PeopleIcon,          permission: 'canManageUsers' },
  { key: 'confis',        label: 'Settings',      Icon: SettingsIcon,        permission: 'canManageSettings' },
];

function getPermissions() {
  try {
    const stored = localStorage.getItem('userPermissions');
    if (stored) return JSON.parse(stored);
  } catch {}
  // Fallback: admin has all permissions
  return {
    canViewDashboard: true, canViewAnalytics: true, canManageProducts: true,
    canManageCategories: true, canManageBanners: true, canManageLeads: true,
    canManageUsers: true, canManageSettings: true, canManageWhatsApp: true,
  };
}

function Overview({ onNavigate, userRole }) {
  const [stats, setStats] = useState({});
  const [leadStats, setLeadStats] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/api/listings'),
      api.get('/api/categories'),
      api.get('/api/subcategories'),
      api.get('/api/banners'),
    ]).then(([l, c, s, b]) => setStats({
      products:      (Array.isArray(l.data) ? l.data : []).length,
      categories:    (Array.isArray(c.data) ? c.data : []).length,
      subcategories: (Array.isArray(s.data) ? s.data : s.data?.result || []).length,
      banners:       (Array.isArray(b.data) ? b.data : []).length,
    })).catch(() => {});

    api.get('/api/leads/stats').then((r) => setLeadStats(r.data || {})).catch(() => {});
  }, []);

  const permissions = getPermissions();

  return (
    <PageContainer title="Dashboard" breadcrumb={['Admin', 'Dashboard']}>
      <Grid container spacing={2}>
        {[
          { label: 'Total Products',  value: stats.products,      Icon: Inventory2Icon,  show: permissions.canManageProducts },
          { label: 'Categories',      value: stats.categories,    Icon: CategoryIcon,    show: permissions.canManageCategories },
          { label: 'Subcategories',   value: stats.subcategories, Icon: AccountTreeIcon, show: permissions.canManageCategories },
          { label: 'Banners',         value: stats.banners,       Icon: ImageIcon,       show: permissions.canManageBanners },
          { label: 'Total Leads',     value: leadStats.total,     Icon: LeaderboardIcon, show: permissions.canManageLeads },
          { label: "Today's Leads",   value: leadStats.today,     Icon: LeaderboardIcon, show: permissions.canManageLeads },
          { label: 'New Leads',       value: leadStats.byStatus?.new, Icon: WhatsAppIcon,show: permissions.canManageLeads },
        ].filter((s) => s.show).map(({ label, value, Icon }) => (
          <Grid item xs={12} sm={6} xl={3} key={label}>
            <StatCard label={label} value={value} Icon={Icon} />
          </Grid>
        ))}
      </Grid>

      <SurfaceCard>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Quick Actions</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
          {[
            { label: '+ Add Product',  key: 'listings',      show: permissions.canManageProducts },
            { label: '+ Add Category', key: 'categories',    show: permissions.canManageCategories },
            { label: '+ Upload Banner',key: 'banners',       show: permissions.canManageBanners },
            { label: 'View Leads',     key: 'leads',         show: permissions.canManageLeads },
            { label: 'WA Inbox',       key: 'inbox',         show: permissions.canManageWhatsApp },
            { label: 'WhatsApp Bot',   key: 'whatsapp-bot',  show: permissions.canManageWhatsApp },
            { label: 'Settings',       key: 'confis',        show: permissions.canManageSettings },
          ].filter((a) => a.show).map((a) => (
            <Button key={a.key} variant="outlined" color="primary" size="small"
              onClick={() => onNavigate(a.key)}
              sx={{ borderRadius: 2, textTransform: 'none', py: 1.5 }}>
              {a.label}
            </Button>
          ))}
        </Box>
      </SurfaceCard>
    </PageContainer>
  );
}

export default function AdminDashboard() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminTab') || 'overview');

  const userName = localStorage.getItem('User_name') || 'Admin';
  const userRole = localStorage.getItem('userRole') || 'admin';
  const permissions = getPermissions();

  // Filter nav items based on user permissions
  const NAV = ALL_NAV.filter((item) => permissions[item.permission] !== false);

  // Auth guard
  useEffect(() => {
    const user = localStorage.getItem('User_name');
    if (!user) { window.location.replace('/login'); }
  }, []);

  // If current tab is not accessible, switch to first available
  useEffect(() => {
    const accessible = NAV.some((n) => n.key === activeTab);
    if (!accessible && NAV.length > 0) {
      setActiveTab(NAV[0].key);
    }
  }, []);

  // Prevent browser back from leaving admin
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const prevent = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', prevent);
    return () => window.removeEventListener('popstate', prevent);
  }, []);

  const handleTab = (key) => {
    setActiveTab(key);
    localStorage.setItem('adminTab', key);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('User_name');
    localStorage.removeItem('adminTab');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userPermissions');
    window.location.replace('/login');
  };

  const drawerWidth = isMobile ? DRAWER_WIDTH : (collapsed ? MINI_WIDTH : DRAWER_WIDTH);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <Overview onNavigate={handleTab} userRole={userRole} />;
      case 'analytics':     return <PageContainer title="Analytics" breadcrumb={['Admin', 'Analytics']}><AnalyticsPage /></PageContainer>;
      case 'leads':         return <PageContainer title="Leads" breadcrumb={['Admin', 'Leads']}><LeadsManager /></PageContainer>;
      case 'listings':      return <CreateListing />;
      case 'categories':    return <CategoryManager />;
      case 'subcategories': return <SubcategoryManager />;
      case 'titles':        return <TitleManager />;
      case 'prices':        return <PriceManager />;
      case 'banners':       return <BannerManager />;
      case 'users':         return <UserManager />;
      case 'confis':        return <ConfiManager />;
      case 'religions':     return <ReligionManager />;
      case 'whatsapp-bot':  return <WhatsAppBotManager />;
      case 'inbox':         return <PageContainer title="WhatsApp Inbox" breadcrumb={['Admin', 'Inbox']}><InboxManager /></PageContainer>;
      default:              return null;
    }
  };

  const title = NAV.find((n) => n.key === activeTab)?.label || 'Dashboard';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white' }}>
      <Toolbar sx={{ justifyContent: collapsed && !isMobile ? 'center' : 'space-between', px: 2 }}>
        {(!collapsed || isMobile) && (
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">SK Admin</Typography>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => setCollapsed((p) => !p)} sx={{ color: 'primary.main' }}>
            <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '.2s' }} />
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      {/* User info */}
      {(!collapsed || isMobile) && (
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 13 }}>
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" fontWeight={600} noWrap display="block">{userName}</Typography>
            <Chip label={userRole} size="small" color={ROLE_COLORS[userRole] || 'default'} sx={{ height: 16, fontSize: 10 }} />
          </Box>
        </Box>
      )}

      <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {NAV.map(({ key, label, Icon }) => (
          <ListItem key={key} disablePadding>
            <Tooltip title={collapsed && !isMobile ? label : ''} placement="right">
              <ListItemButton
                selected={activeTab === key}
                onClick={() => handleTab(key)}
                sx={{
                  mx: 1, borderRadius: 2, mb: 0.5,
                  '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.dark' },
                  '&.Mui-selected:hover': { bgcolor: 'primary.light' },
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  minHeight: 44,
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 36, color: 'inherit', justifyContent: 'center' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {(!collapsed || isMobile) && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1, borderRadius: 2, color: 'error.main',
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
              minHeight: 44,
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 36, color: 'error.main', justifyContent: 'center' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {(!collapsed || isMobile) && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile top AppBar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            display: { md: 'none' },
            bgcolor: 'white',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: (t) => t.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setMobileOpen((p) => !p)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} flexGrow={1}>{title}</Typography>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            transition: 'width .2s',
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              overflowX: 'hidden',
              transition: 'width .2s',
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Desktop TopBar */}
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              display: { xs: 'none', md: 'flex' },
              bgcolor: 'white',
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Admin Panel</Typography>
                <Typography variant="h6" fontWeight={600} lineHeight={1.2}>{title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip label={userRole} size="small" color={ROLE_COLORS[userRole] || 'default'} />
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                  {userName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={500} sx={{ display: { sm: 'block', xs: 'none' } }}>
                  {userName}
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Offset for mobile AppBar */}
          <Box sx={{ display: { md: 'none' }, height: 56 }} />

          <Box sx={{ p: { xs: 2, md: 4 }, flex: 1 }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
