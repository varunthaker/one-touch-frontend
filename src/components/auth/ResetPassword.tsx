import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, TextField, Typography, Alert, CircularProgress, Link } from '@mui/material';
import { supabase } from '../../config/supabaseClient';
import oneTouchLogo from '../assets/OneTouchIcon.svg';

const ResetPassword: React.FC = () => {
  const [checkingLink, setCheckingLink] = useState(true);
  const [linkValid, setLinkValid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Supabase's client auto-exchanges the recovery token in the URL for a
    // session on load (detectSessionInUrl is on by default).
    supabase.auth.getSession().then(({ data }) => {
      setLinkValid(!!data.session);
      setCheckingLink(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setLinkValid(!!session);
        setCheckingLink(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      window.location.href = '/';
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
          <Typography variant="h6">Set a new password</Typography>
        </Box>

        {checkingLink ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !linkValid ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              This reset link is invalid or has expired.
            </Alert>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Request a new reset link
              </Link>
            </Box>
          </>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                fullWidth
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
                {isSubmitting ? <CircularProgress size={24} /> : 'Set Password'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
