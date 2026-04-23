import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Chip, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useColorMode } from '../theme/ColorModeContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const isDark = theme.palette.mode === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.75)',
        color: 'text.primary',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Samadhaan
            <Chip
              label="Campus Edition"
              size="small"
              sx={{
                ml: 1.5,
                bgcolor: 'rgba(14, 165, 233, 0.12)',
                color: 'primary.dark',
                fontWeight: 600,
              }}
            />
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleColorMode}
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.06)',
                  color: 'text.primary',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15, 23, 42, 0.12)' },
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </IconButton>
            </Tooltip>
            {user ? (
              <>
                <Button
                  component={RouterLink}
                  to={user.role === 'Admin' ? '/admin' : '/dashboard'}
                  startIcon={<LayoutDashboard size={18} />}
                  color="inherit"
                >
                  Dashboard
                </Button>
                <Button
                  component={RouterLink}
                  to="/profile"
                  startIcon={<UserIcon size={18} />}
                  color="inherit"
                >
                  Profile
                </Button>
                <Button
                  onClick={handleLogout}
                  startIcon={<LogOut size={18} />}
                  variant="outlined"
                  color="primary"
                  size="small"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit">
                  Login
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" color="primary">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
