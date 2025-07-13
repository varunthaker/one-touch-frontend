import React, { useEffect } from 'react';
import useSabhaSelectorStore from '../../store/useSabhaSelectorStore';
import useSabhaCenterStore from '../../store/useSabhaCenterStore';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, Card, CardContent } from '@mui/material';

const SabhaSelector: React.FC = () => {
  const navigate = useNavigate();
  const selectedCity = useSabhaSelectorStore((state) => state.selectedCity);
  const selectCity = useSabhaSelectorStore((state) => state.selectCity);
  const selectSabhaCenterName = useSabhaSelectorStore((state) => state.selectSabhaCenterName);
  const clearCity = useSabhaSelectorStore((state) => state.clearCity);
  
  const { sabhaCenters, loading, error, fetchSabhaCenters } = useSabhaCenterStore();

  useEffect(() => {
    fetchSabhaCenters();
  }, [fetchSabhaCenters]);

  const handleChange = (value: number, name: string) => {
    if (selectedCity === value) {
      clearCity();
    } else {
      selectCity(value);
      selectSabhaCenterName(name);
    }
  };

  const handleRedirect = () => {
    if (selectedCity) {
      navigate(`/layout`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 4,
          gap: 2
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Select a Sabha Center
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              {sabhaCenters.map((center) => (
                <Card
                  key={center.id}
                  onClick={() => handleChange(center.id, center.name)}
                  sx={{
                    cursor: 'pointer',
                    border: selectedCity === center.id ? '2px solid #1976d2' : '2px solid transparent',
                    backgroundColor: selectedCity === center.id ? 'rgba(25, 118, 210, 0.08)' : 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>{center.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {center.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Contact: {center.responsible_person} ({center.contact_number})
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
          
          {selectedCity && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRedirect}
                size="large"
              >
                Go to Dashboard
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default SabhaSelector;
