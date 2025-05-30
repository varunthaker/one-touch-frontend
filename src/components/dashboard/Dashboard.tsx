import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import { youthType, sabhaType } from "../../types";
import { youthdata } from "../assets/dummydata";
import { sabhaData } from "../assets/dummydata";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);

const todayDate = dayjs();
const startOfTheWeekDate = todayDate.startOf('week');
const endOfTheWeekDate = todayDate.endOf('week');
const todayInString = todayDate.format('DD-MM-YYYY');

const youthsWithBirthdayThisWeek = youthdata.filter((youth: youthType) => {
  const userBirthDate = dayjs(youth.birthdate);
  return userBirthDate.isBetween(startOfTheWeekDate, endOfTheWeekDate, 'day', '[]');
});

function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3
      }}>
        {/* Birthdays Section */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' },
          minWidth: { xs: '100%', sm: 'calc(50% - 12px)' }
        }}>
          <Card 
            elevation={3}
            sx={{ 
              height: '100%',
              '&:hover': {
                boxShadow: 6,
                transition: 'box-shadow 0.3s ease-in-out'
              }
            }}
          >
            <CardHeader 
              title="Birthdays This Week"
              avatar={<CakeIcon color="primary" />}
            />
            <CardContent>
              {youthsWithBirthdayThisWeek.length === 0 ? (
                <Typography color="textSecondary">
                  No birthdays this week
                </Typography>
              ) : (
                youthsWithBirthdayThisWeek.map((youth: youthType) => {
                  const youthBirthdayToday = dayjs(youth.birthdate).format('DD-MM-YYYY');
                  const isToday = youthBirthdayToday === todayInString;

                  return (
                    <Accordion key={youth.youthId} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                          {isToday ? '🎉 Today: ' : ''}{youth.firstName} {youth.lastName}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          Birthday: {youthBirthdayToday}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Upcoming Events Section */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' },
          minWidth: { xs: '100%', sm: 'calc(50% - 12px)' }
        }}>
          <Card 
            elevation={3}
            sx={{ 
              height: '100%',
              '&:hover': {
                boxShadow: 6,
                transition: 'box-shadow 0.3s ease-in-out'
              }
            }}
          >
            <CardHeader 
              title="Upcoming Events"
              avatar={<EventIcon color="primary" />}
            />
            <CardContent>
              {sabhaData.length === 0 ? (
                <Typography color="textSecondary">
                  No upcoming events
                </Typography>
              ) : (
                sabhaData.map((sabha: sabhaType, index: number) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        {sabha.title}: {sabha.topic}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography>
                          Date: {dayjs(sabha.date).format('DD-MM-YYYY')}
                        </Typography>
                        <Typography>
                          Topic: {sabha.topic}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Speakers:
                        </Typography>
                        <Typography>
                          {sabha.speaker.speakerOne}
                        </Typography>
                        <Typography>
                          {sabha.speaker.speakerTwo}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
