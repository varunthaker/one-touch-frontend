import { useState } from "react";
import { Box, Tabs, Tab, useTheme, useMediaQuery, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, AppBar, Toolbar, Typography, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import useSabhaSelectorStore from "../store/useSabhaSelectorStore";
import useThemeStore from "../store/useThemeStore";
import { useAuth } from "../auth/AuthProvider";
import Dashboard from "./dashboard/Dashboard";
import Youths from "./youths/Youths";
import Report from "./reports/Report";
import SabhaList from "./sabhaCenter/SabhaList";
import SabhaCenter from "./sabhaCenter/SabhaCenter";
import "./navbar.css";
import oneTouchLogo from "./assets/OneTouchIcon.svg"; // Adjust the path as necessary

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
};

const Layout = () => {
  const [value, setValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const selectedSabhaCenterName = useSabhaSelectorStore((state) => state.selectedSabhaCenterName);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, logout, roles } = useAuth();
  const themeStore = useThemeStore(); // Import and initialize theme store

  // Define all possible tab items
  const allTabItems = [
    { label: "Dashboard", icon: <DashboardIcon />, component: <Dashboard />, roles: ["admin", "superadmin"] },
    { label: "Youths", icon: <PeopleIcon />, component: <Youths />, roles: ["admin", "superadmin"] },
    { label: "Report", icon: <AssessmentIcon />, component: <Report />, roles: ["superadmin"] },
    { label: "Sabha & Attendance", icon: <EventIcon />, component: <SabhaList />, roles: ["admin", "superadmin"] },
    { label: "Sabha Centers", icon: <LocationOnIcon />, component: <SabhaCenter />, roles: ["admin", "superadmin"] },
  ];

  // Filter tab items based on user role
  const tabItems = allTabItems.filter((item) => {
    if (!user || !roles) {
      console.log("No user or roles found");
      return false;
    }

    return item.roles.some((role) => roles.includes(role));
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const drawer = (
    <List>
      {tabItems.map((item, index) => (
        <ListItem key={index} disablePadding>
          <ListItemButton selected={value === index} onClick={(event) => handleChange(event, index)}>
            <Box sx={{ mr: 2 }}>{item.icon}</Box>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AppBar position="static" color="default">
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component="img"
            src={oneTouchLogo}
            alt="OneTouch Logo"
            sx={{
              height: 40,
              width: 40,
              marginLeft: isMobile ? -2 : 0,
              marginRight: isMobile ? 1 : 2,
              objectFit: "contain",
            }}
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {selectedSabhaCenterName || "No Sabha Center is Selected"}
          </Typography>

          {!isMobile && (
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: themeStore.indicatorColor, // Use indicator color from theme store
                },
                "& .MuiTab-root": {
                  "&.Mui-selected": {
                    color: themeStore.textColor, // Use text color from theme store
                  },
                  minHeight: 48,
                  px: 2,
                },
              }}
            >
              {tabItems.map((item, index) => (
                <Tab key={index} label={item.label} icon={item.icon} iconPosition="start" />
              ))}
            </Tabs>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={isDarkMode ? "Light mode" : "Dark mode"}>
              <IconButton onClick={toggleTheme} color="inherit">
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {user && (
              <Tooltip title="Logout">
                <IconButton color="inherit" onClick={handleLogout} size="small">
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "auto",
          }}
        >
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
          "& .MuiDrawer-paper": { width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Layout;
