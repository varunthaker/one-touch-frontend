import { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  useTheme, 
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import useSabhaSelectorStore from '../store/useSabhaSelectorStore';
import useThemeStore from '../store/useThemeStore';
import Dashboard from "./dashboard/Dashboard";
import Youths from "./youths/Youths";
import Attendance from "./attendance/Attendance";
import Report from "./reports/Report";
import SabhaList from "./sabhaCenter/SabhaList";
import SabhaCenter from "./sabhaCenter/SabhaCenter";
import "./navbar.css";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const tabItems = [
  { label: "Dashboard", icon: <DashboardIcon />, component: <Dashboard /> },
  { label: "Youths", icon: <PeopleIcon />, component: <Youths /> },
  { label: "Attendance", icon: <EventNoteIcon />, component: <Attendance /> },
  { label: "Report", icon: <AssessmentIcon />, component: <Report /> },
  { label: "All Sabha", icon: <EventIcon />, component: <SabhaList /> },
  { label: "Sabha Centers", icon: <LocationOnIcon />, component: <SabhaCenter /> }
];

const Layout = () => {
  const [value, setValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const selectedSabhaCenterName = useSabhaSelectorStore(state => state.selectedSabhaCenterName);
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      {tabItems.map((item, index) => (
        <ListItem key={index} disablePadding>
          <ListItemButton
            selected={value === index}
            onClick={(event) => handleChange(event, index)}
          >
            <Box sx={{ mr: 2 }}>{item.icon}</Box>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <AppBar position="static" color="default">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {selectedSabhaCenterName || 'No Sabha Center is Selected'}
          </Typography>
          
          <Tooltip title={isDarkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {!isMobile && (
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  px: 2,
                },
              }}
            >
              {tabItems.map((item, index) => (
                <Tab
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto'
        }}>
          {tabItems.map((item, index) => (
            <TabPanel key={index} value={value} index={index}>
              {item.component}
            </TabPanel>
          ))}
        </Box>
      </Box>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': { width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Layout;
