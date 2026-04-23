import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Alert, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const newUser = await register({ name, email, password });
      navigate(newUser.role === 'Admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight={700} color="primary">
          Create Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Join Samadhaan to start managing complaints digitally
        </Typography>

        {error && <Alert data-testid="register-error" severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit} data-testid="register-form">
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            id="register-name"
            inputProps={{ 'data-testid': 'register-name' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            name="email"
            id="register-email"
            inputProps={{ 'data-testid': 'register-email' }}
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
            id="register-password"
            inputProps={{ 'data-testid': 'register-password' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            helperText="At least 6 characters long"
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            data-testid="register-submit"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;
