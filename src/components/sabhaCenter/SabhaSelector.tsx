import React, { useEffect } from 'react';
import useSabhaSelectorStore from '../../store/useSabhaSelectorStore';
import useSabhaCenterStore from '../../store/useSabhaCenterStore';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, FormControlLabel, Checkbox, Button, Container, Paper } from '@mui/material';

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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sabhaCenters.map((center) => (
                <FormControlLabel
                  key={center.id}
                  control={
                    <Checkbox
                      checked={selectedCity === center.id}
                      onChange={() => handleChange(center.id, center.name)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle1">{center.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {center.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contact: {center.responsible_person} ({center.contact_number})
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    alignItems: 'flex-start',
                    marginLeft: 0,
                    width: '100%'
                  }}
                />
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
                Go to Youth Page
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default SabhaSelector;
