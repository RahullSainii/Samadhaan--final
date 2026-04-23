import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, MenuItem } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'User' | 'Admin'>('User');
  const [error, setError] = useState('');
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const loggedInUser = await login({ email, password });
      if (loggedInUser.role !== role) {
        logout();
        setError('Role mismatch. Please select the correct role.');
        return;
      }
      navigate(role === 'Admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight={700} color="primary">
          Login to Samadhaan
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Access your digital complaint management dashboard
        </Typography>

        {error && <Alert data-testid="login-error" severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit} data-testid="login-form">
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            name="email"
            id="login-email"
            inputProps={{ 'data-testid': 'login-email' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            id="login-password"
            inputProps={{ 'data-testid': 'login-password' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Role"
            id="login-role"
            SelectProps={{ inputProps: { 'data-testid': 'login-role' } }}
            value={role}
            onChange={(e) => setRole(e.target.value as 'User' | 'Admin')}
            margin="normal"
            required
          >
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </TextField>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            data-testid="login-submit"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </form>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component="a" href="/forgot-password" variant="text">
            Forgot Password?
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
