import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, TextField, Typography, Alert, CircularProgress, Link } from '@mui/material';
import { supabase } from '../../config/supabaseClient';
import oneTouchLogo from '../assets/OneTouchIcon.svg';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 380 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box component="img" src={oneTouchLogo} alt="OneTouch Logo" sx={{ height: 56, width: 56, mb: 1 }} />
          <Typography variant="h6">Reset your password</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {sent ? (
          <Alert severity="success">
            If an account exists for {email}, a password reset link has been sent. Check your inbox.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Enter your email and we'll send you a link to reset your password.
            </Typography>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
              {isSubmitting ? <CircularProgress size={24} /> : 'Send reset link'}
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/sign-in" variant="body2">
            Back to sign in
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
