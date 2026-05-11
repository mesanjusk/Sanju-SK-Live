import { useState, useEffect } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Divider, Grid,
  Button, useMediaQuery, createTheme, ThemeProvider, CssBaseline,
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

import AnalyticsPage from '../pages/admin/AnalyticsPage';
import CategoryManager from '../pages/admin/CategoryManager';
import SubcategoryManager from '../pages/admin/SubcategoryManager';
import TitleManager from '../pages/admin/TitleManager';
import PriceManager from '../pages/admin/PriceManager';
import CreateListing from './CreateListing';
import AddUser from '../pages/addUser';
import AddConfi from '../pages/addConfi';
import AddReligion from '../pages/addReligion';
import UploadBanner from '../pages/UploadBanner';
import api from '../api';
import { StatCard, SurfaceCard, PageContainer } from './admin/AdminUiKit';

const DRAWER_WIDTH = 240;
const MINI_WIDTH = 64;

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

const NAV = [
  { key: 'overview',      label: 'Dashboard',    Icon: DashboardIcon },
  { key: 'analytics',     label: 'Analytics',    Icon: BarChartIcon },
  { key: 'listings',      label: 'Products',     Icon: Inventory2Icon },
  { key: 'categories',    label: 'Categories',   Icon: CategoryIcon },
  { key: 'subcategories', label: 'Subcategories',Icon: AccountTreeIcon },
  { key: 'titles',        label: 'Titles',       Icon: LabelIcon },
  { key: 'prices',        label: 'Prices',       Icon: AttachMoneyIcon },
  { key: 'religions',     label: 'Religions',    Icon: SelfImprovementIcon },
  { key: 'banners',       label: 'Banners',      Icon: ImageIcon },
  { key: 'users',         label: 'Users',        Icon: PeopleIcon },
  { key: 'confis',        label: 'Settings',     Icon: SettingsIcon },
];

function Overview({ onNavigate }) {
  const [stats, setStats] = useState({});
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
  }, []);

  return (
    <PageContainer title="Dashboard" breadcrumb={['Admin', 'Dashboard']}>
      <Grid container spacing={2}>
        {[
          { label: 'Total Products',  value: stats.products,      Icon: Inventory2Icon },
          { label: 'Categories',      value: stats.categories,    Icon: CategoryIcon },
          { label: 'Subcategories',   value: stats.subcategories, Icon: AccountTreeIcon },
          { label: 'Banners',         value: stats.banners,       Icon: ImageIcon },
        ].map(({ label, value, Icon }) => (
          <Grid item xs={12} sm={6} xl={3} key={label}>
            <StatCard label={label} value={value} Icon={Icon} />
          </Grid>
        ))}
      </Grid>
      <SurfaceCard>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Quick Actions</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
          {[
            { label: '+ Add Product',  key: 'listings' },
            { label: '+ Add Category', key: 'categories' },
            { label: '+ Upload Banner',key: 'banners' },
            { label: 'Settings',       key: 'confis' },
          ].map((a) => (
            <Button key={a.key} variant="outlined" color="primary" size="small" onClick={() => onNavigate(a.key)}
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

  // Auth guard
  useEffect(() => {
    const user = localStorage.getItem('User_name');
    if (!user) { window.location.replace('/login'); }
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
    window.location.replace('/login');
  };

  const drawerWidth = isMobile ? DRAWER_WIDTH : (collapsed ? MINI_WIDTH : DRAWER_WIDTH);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <Overview onNavigate={handleTab} />;
      case 'analytics':     return <PageContainer title="Analytics" breadcrumb={['Admin', 'Analytics']}><AnalyticsPage /></PageContainer>;
      case 'listings':      return <CreateListing />;
      case 'categories':    return <CategoryManager />;
      case 'subcategories': return <SubcategoryManager />;
      case 'titles':        return <TitleManager />;
      case 'prices':        return <PriceManager />;
      case 'banners':       return <UploadBanner />;
      case 'users':         return <AddUser />;
      case 'confis':        return <AddConfi />;
      case 'religions':     return <AddReligion />;
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
      <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {NAV.map(({ key, label, Icon }) => (
          <ListItem key={key} disablePadding>
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
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>A</Avatar>
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
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>A</Avatar>
                <Typography variant="body2" fontWeight={500} sx={{ display: { sm: 'block', xs: 'none' } }}>Admin</Typography>
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
