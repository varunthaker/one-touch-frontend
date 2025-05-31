import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BarChart } from '@mui/x-charts/BarChart';
interface SabhaData {
  date: string;
  youthCount: number;
  topic: string;
  speaker: string;
}

interface KaryakartaData {
  name: string;
  youthCount: number;
  youths: string[];
}

// Dummy data for Sabha Report
const sabhaData: SabhaData[] = [
  { date: '2024-03-01', youthCount: 25, topic: 'Bhakti in Modern Age', speaker: 'John Doe' },
  { date: '2024-03-08', youthCount: 30, topic: 'Time Management', speaker: 'Jane Smith' },
  { date: '2024-03-15', youthCount: 28, topic: 'Spiritual Growth', speaker: 'Mike Johnson' },
  { date: '2024-03-22', youthCount: 35, topic: 'Leadership Skills', speaker: 'Sarah Wilson' },
  { date: '2024-03-29', youthCount: 32, topic: 'Stress Management', speaker: 'David Brown' },
  { date: '2024-04-05', youthCount: 40, topic: 'Goal Setting', speaker: 'Emily Davis' },
  { date: '2024-04-12', youthCount: 38, topic: 'Team Building', speaker: 'Chris Taylor' },
  { date: '2024-04-19', youthCount: 42, topic: 'Communication Skills', speaker: 'Lisa Anderson' },
  { date: '2024-04-26', youthCount: 45, topic: 'Personal Development', speaker: 'Mark Thompson' },
  { date: '2024-05-03', youthCount: 50, topic: 'Success Principles', speaker: 'Rachel White' },
];

const karyakartaData: KaryakartaData[] = [
  { 
    name: 'Karyakarta 1', 
    youthCount: 15, 
    youths: ['Youth A', 'Youth B', 'Youth C', 'Youth D', 'Youth E', 'Youth F', 'Youth G', 'Youth H', 'Youth I', 'Youth J', 'Youth K', 'Youth L', 'Youth M', 'Youth N', 'Youth O']
  },
  { 
    name: 'Karyakarta 2', 
    youthCount: 12, 
    youths: ['Youth P', 'Youth Q', 'Youth R', 'Youth S', 'Youth T', 'Youth U', 'Youth V', 'Youth W', 'Youth X', 'Youth Y', 'Youth Z', 'Youth AA']
  },
  { 
    name: 'Karyakarta 3', 
    youthCount: 18, 
    youths: ['Youth AB', 'Youth AC', 'Youth AD', 'Youth AE', 'Youth AF', 'Youth AG', 'Youth AH', 'Youth AI', 'Youth AJ', 'Youth AK', 'Youth AL', 'Youth AM', 'Youth AN', 'Youth AO', 'Youth AP', 'Youth AQ', 'Youth AR', 'Youth AS']
  },
  { 
    name: 'Karyakarta 4', 
    youthCount: 10, 
    youths: ['Youth AT', 'Youth AU', 'Youth AV', 'Youth AW', 'Youth AX', 'Youth AY', 'Youth AZ', 'Youth BA', 'Youth BB', 'Youth BC']
  },
  { 
    name: 'Karyakarta 5', 
    youthCount: 20, 
    youths: ['Youth BD', 'Youth BE', 'Youth BF', 'Youth BG', 'Youth BH', 'Youth BI', 'Youth BJ', 'Youth BK', 'Youth BL', 'Youth BM', 'Youth BN', 'Youth BO', 'Youth BP', 'Youth BQ', 'Youth BR', 'Youth BS', 'Youth BT', 'Youth BU', 'Youth BV', 'Youth BW']
  }
];

const Report = () => {
  const getSabhaTooltip = (index: number) => {
    const data = sabhaData[index];
    return `${data.youthCount} youths\nTopic: ${data.topic}\nSpeaker: ${data.speaker}`;
  };

  const getKaryakartaTooltip = (index: number) => {
    const data = karyakartaData[index];
    return `${data.youthCount} youths\nYouths:\n${data.youths.map(youth => `• ${youth}`).join('\n')}`;
  };

  return (
    <Box sx={{ 
      p: 3,
      height: '100%',
      overflow: 'auto',
      maxHeight: 'calc(100vh - 64px)' // Assuming a 64px header/navbar
    }}>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      
      <Box sx={{ mt: 2 }}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="sabha-report-content"
            id="sabha-report-header"
          >
            <Typography variant="h6">Sabha Report</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <BarChart
                dataset={sabhaData as any}
                xAxis={[{
                  scaleType: 'band',
                  dataKey: 'date',
                  label: 'Sabha Dates'
                }]}
                series={[
                  {
                    dataKey: 'youthCount',
                    label: 'Sabha Info:',
                    valueFormatter: (_value: number | null, context: any) => getSabhaTooltip(context.dataIndex)
                  }
                ]}
                barLabel={(item) => item.value?.toString()}
                height={400}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                slotProps={{
                  tooltip: {
                    sx: {
                      whiteSpace: 'pre-line'
                    }
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="karyakarta-report-content"
            id="karyakarta-report-header"
          >
            <Typography variant="h6">Karyakarta Report</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <BarChart
                dataset={karyakartaData as any}
                xAxis={[{
                  scaleType: 'band',
                  dataKey: 'name',
                  label: 'Karyakarta Names'
                }]}
                barLabel={(item) => item.value?.toString()}
                series={[
                  {
                    dataKey: 'youthCount',
                    label: 'info',
                    valueFormatter: (_value: number | null, context: any) => getKaryakartaTooltip(context.dataIndex)
                  }
                ]}
                height={400}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                slotProps={{
                  tooltip: {
                    sx: {
                      whiteSpace: 'pre-line'
                    }
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default Report;
