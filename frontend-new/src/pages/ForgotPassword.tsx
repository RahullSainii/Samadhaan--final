import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Alert, Box, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState<'request' | 'reset'>('request');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const requestPin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('If the email exists, a reset PIN has been sent.');
      setStage('reset');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request reset PIN');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', { email, pin, newPassword });
      setSuccess('Password reset successful. You can login now.');
      setStage('request');
      setPin('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight={700} color="primary">
          Reset Password
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Receive a 4-digit PIN to reset your account password.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {stage === 'request' ? (
            <Button
              variant="contained"
              size="large"
              disabled={loading || !email}
              onClick={requestPin}
            >
              {loading ? 'Sending...' : 'Send 4-digit PIN'}
            </Button>
          ) : (
            <>
              <TextField
                fullWidth
                label="4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputProps={{ maxLength: 4 }}
                required
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                variant="contained"
                size="large"
                disabled={loading || !pin || !newPassword}
                onClick={resetPassword}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <Button
                variant="text"
                onClick={() => setStage('request')}
              >
                Request new PIN
              </Button>
            </>
          )}
        </Stack>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Remembered your password?{' '}
            <RouterLink to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              Login here
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
