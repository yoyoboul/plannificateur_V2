import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  useMediaQuery,
  useTheme,
  ListSubheader,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ViewList as ListIcon,
  Event as CalendarIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const drawerWidth = 260;
const mobileDrawerWidth = 220;

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuSections = [
    {
      subheader: "Navigation",
      items: [
        { text: "Tableau de bord", icon: <DashboardIcon />, path: "/" },
        { text: "Liste des travaux", icon: <ListIcon />, path: "/travaux" },
        { text: "Agenda", icon: <CalendarIcon />, path: "/agenda" },
        { text: "Rapport", icon: <ChartIcon />, path: "/rapport" },
      ],
    },
    {
      subheader: "Outils",
      items: [
        {
          text: "Liste de courses",
          icon: <ShoppingCartIcon />,
          path: "/courses",
        },
        { text: "Gérer les tâches", icon: <SettingsIcon />, path: "/gestion" },
      ],
    },
  ];

  const allMenuItems = menuSections.flatMap((section) => section.items);

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: "center", py: 1.5 }}>
        <Box display="flex" alignItems="center">
          <HomeIcon sx={{ mr: 1, color: "primary.main", fontSize: "2rem" }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Planificateur
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuSections.map((section) => (
          <Box key={section.subheader}>
            <ListSubheader
              sx={{ bgcolor: "transparent", color: "text.secondary" }}
            >
              {section.subheader}
            </ListSubheader>
            {section.items.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={router.pathname === item.path}
                  onClick={() => {
                    router.push(item.path);
                    if (isMobile) {
                      setMobileOpen(false);
                    }
                  }}
                  sx={{
                    borderRadius: "0 20px 20px 0",
                    mx: 1,
                    my: 0.5,
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 45,
                      color:
                        router.pathname === item.path ? "white" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
          </Box>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: "none",
          backgroundColor: "white",
          color: "text.primary",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="ouvrir le menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {allMenuItems.find((item) => item.path === router.pathname)?.text ||
              "Planificateur de Travaux"}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { xs: mobileDrawerWidth, sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
        aria-label="menu de navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Meilleure performance sur mobile
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: mobileDrawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  );
}
