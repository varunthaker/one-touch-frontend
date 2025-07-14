import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip,
  LinearProgress
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { sabhaType } from "../../types";
import { sabhaData } from "../assets/dummydata";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import useYouthsStore from '../../store/useYouthsStore';
import useSabhaCenterStore from '../../store/useSabhaCenterStore';
import useSabhaSelectorStore from '../../store/useSabhaSelectorStore';
import { API_ENDPOINTS } from '../../config/api';
import { useEffect, useMemo, useState } from 'react';

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const { youths, loading, error, fetchYouths } = useYouthsStore();
  const { sabhaCenters, fetchSabhaCenters } = useSabhaCenterStore();
  const selectedSabhaCenter = useSabhaSelectorStore(state => state.selectedCity);
  
  const [centerStats, setCenterStats] = useState<any[]>([]);
  const [karyakartaStats, setKaryakartaStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [attendanceChartData, setAttendanceChartData] = useState<any[]>([]);
  const [karyakartaChartData, setKaryakartaChartData] = useState<any>(null);
  const [dateRanges, setDateRanges] = useState<{[key: string]: {fromDate: any, toDate: any}}>({});
  const [attendanceChartDateRanges, setAttendanceChartDateRanges] = useState<{[key: string]: {fromDate: any, toDate: any}}>({});

  useEffect(() => {
    fetchYouths();
    fetchSabhaCenters();
  }, [fetchYouths, fetchSabhaCenters]);

  useEffect(() => {
    if (sabhaCenters.length > 0) {
      fetchStatistics();
    }
  }, [sabhaCenters, selectedSabhaCenter, dateRanges, attendanceChartDateRanges]);

  const fetchStatistics = async () => {
    setLoadingStats(true);
    try {
      const statsPromises = sabhaCenters.map(async (center) => {
        // Fetch sabhas for this center
        const sabhasResponse = await fetch(`${API_ENDPOINTS.SABHAS}?sabha_center_id=${center.id}`);
        const sabhas = await sabhasResponse.json();
        
        // Get date range for this center (default to 1 month ago to today if not set)
        const centerDateRange = dateRanges[center.id] || {
          fromDate: dayjs().subtract(1, 'month'),
          toDate: dayjs()
        };
        
        // Filter sabhas within the selected date range
        const filteredSabhas = sabhas.filter((sabha: any) => {
          const sabhaDate = dayjs(sabha.date);
          return sabhaDate.isBetween(centerDateRange.fromDate, centerDateRange.toDate, 'day', '[]');
        });
        
        // Get sabhas in the date range
        const sabhasInRange = filteredSabhas;
        
        // Fetch attendance for each sabha
        const attendancePromises = sabhasInRange.map(async (sabha: any) => {
          try {
            const attendanceResponse = await fetch(API_ENDPOINTS.ATTENDANCE_BY_SABHA(sabha.id));
            const attendanceData = await attendanceResponse.json();
            return attendanceData.present_youth_ids?.length || 0;
          } catch (error) {
            console.error(`Error fetching attendance for sabha ${sabha.id}:`, error);
            return 0;
          }
        });
        
        const attendances = await Promise.all(attendancePromises);
        const averageAttendance = attendances.length > 0 ? attendances.reduce((a, b) => a + b, 0) / attendances.length : 0;
        
        // Fetch total youths for this center
        let totalYouths = 0;
        try {
          const youthsResponse = await fetch(API_ENDPOINTS.YOUTHS_BY_SABHA_CENTER(center.id));
          const youths = await youthsResponse.json();
          totalYouths = youths.length;
        } catch (error) {
          console.error(`Error fetching youths for center ${center.id}:`, error);
        }
        
        return {
          centerId: center.id,
          centerName: center.name,
          averageAttendance: Math.round(averageAttendance),
          totalSabhas: sabhasInRange.length,
          lastSabhaDate: sabhasInRange.length > 0 ? dayjs(sabhasInRange[sabhasInRange.length - 1].date).format('DD-MM-YYYY') : 'No sabhas',
          totalYouths: totalYouths,
          dateRange: centerDateRange
        };
      });
      
      const centerStatistics = await Promise.all(statsPromises);
      setCenterStats(centerStatistics);
      
      // Prepare chart data for attendance trends for all centers
      const chartDataPromises = sabhaCenters.map(async (center) => {
        try {
          const sabhasResponse = await fetch(`${API_ENDPOINTS.SABHAS}?sabha_center_id=${center.id}`);
          const sabhas = await sabhasResponse.json();
          
          // Get date range for this center's attendance chart (default to 1 month ago to today if not set)
          const centerChartDateRange = attendanceChartDateRanges[center.id] || {
            fromDate: dayjs().subtract(1, 'month'),
            toDate: dayjs()
          };
          
          // Filter sabhas within the attendance chart date range
          const filteredSabhas = sabhas.filter((sabha: any) => {
            const sabhaDate = dayjs(sabha.date);
            return sabhaDate.isBetween(centerChartDateRange.fromDate, centerChartDateRange.toDate, 'day', '[]');
          });
          
          // Sort sabhas by date (oldest first)
          const sortedSabhas = filteredSabhas.sort((a: any, b: any) => 
            dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1
          );
          
          const chartLabels = sortedSabhas.map((sabha: any) => 
            dayjs(sabha.date).format('DD/MM')
          );
          
          const attendanceData = await Promise.all(
            sortedSabhas.map(async (sabha: any) => {
              try {
                const attendanceResponse = await fetch(API_ENDPOINTS.ATTENDANCE_BY_SABHA(sabha.id));
                const attendanceData = await attendanceResponse.json();
                return attendanceData.present_youth_ids?.length || 0;
              } catch (error) {
                console.error(`Error fetching attendance for chart:`, error);
                return 0;
              }
            })
          );
          
          return {
            centerId: center.id,
            centerName: center.name,
            chartData: {
              labels: chartLabels,
              datasets: [
                {
                  label: 'Attendance',
                  data: attendanceData,
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  tension: 0.4,
                  fill: true,
                },
              ],
            },
            dateRange: centerChartDateRange
          };
        } catch (error) {
          console.error(`Error preparing chart data for center ${center.id}:`, error);
          return {
            centerId: center.id,
            centerName: center.name,
            chartData: null
          };
        }
      });
      
      const allChartData = await Promise.all(chartDataPromises);
      setAttendanceChartData(allChartData);
      
      // Fetch karyakarta statistics only for selected center
      if (selectedSabhaCenter) {
        try {
          const karyakartaResponse = await fetch(API_ENDPOINTS.YOUTHS_KARYAKARTA(selectedSabhaCenter));
          const karyakartas = await karyakartaResponse.json();
          
          // Fetch youth count for each karyakarta
          const karyakartaWithYouthCount = await Promise.all(
            karyakartas.map(async (karyakarta: any) => {
              try {
                const youthResponse = await fetch(`${API_ENDPOINTS.YOUTHS}by-karyakarta/${karyakarta.id}`);
                const youths = await youthResponse.json();
                return {
                  karyakartaId: karyakarta.id,
                  karyakartaName: `${karyakarta.first_name} ${karyakarta.last_name}`,
                  centerName: sabhaCenters.find(center => center.id === selectedSabhaCenter)?.name || 'Unknown Center',
                  youthCount: youths.length,
                  youths: youths // Store the actual youth data for potential future use
                };
              } catch (error) {
                console.error(`Error fetching youths for karyakarta ${karyakarta.id}:`, error);
                return {
                  karyakartaId: karyakarta.id,
                  karyakartaName: `${karyakarta.first_name} ${karyakarta.last_name}`,
                  centerName: sabhaCenters.find(center => center.id === selectedSabhaCenter)?.name || 'Unknown Center',
                  youthCount: 0,
                  youths: []
                };
              }
            })
          );
          
          setKaryakartaStats(karyakartaWithYouthCount);
        } catch (error) {
          console.error(`Error fetching karyakartas for selected center ${selectedSabhaCenter}:`, error);
          setKaryakartaStats([]);
        }
      } else {
        setKaryakartaStats([]);
      }
      
      // Prepare karyakarta chart data for selected center
      if (selectedSabhaCenter && karyakartaStats.length > 0) {
        const chartLabels = karyakartaStats.map(karyakarta => karyakarta.karyakartaName);
        const youthCounts = karyakartaStats.map(karyakarta => karyakarta.youthCount);
        const youthNames = karyakartaStats.map(karyakarta => 
          karyakarta.youths?.map((youth: any) => youth.name).join(', ') || 'No youths assigned'
        );
        
        // Generate different colors for each karyakarta
        const colors = [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
        ];
        
        const karyakartaChart = {
          labels: chartLabels,
          datasets: [
            {
              label: 'Youths Assigned',
              data: youthCounts,
              backgroundColor: colors.slice(0, karyakartaStats.length),
              borderColor: colors.slice(0, karyakartaStats.length).map(color => color.replace('0.8', '1')),
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
              youthNames: youthNames, // Store youth names for tooltip
            },
          ],
        };
        
        setKaryakartaChartData(karyakartaChart);
      } else {
        setKaryakartaChartData(null);
      }
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const todayDate = dayjs();
  const startOfTheWeekDate = todayDate.startOf('week');
  const endOfTheWeekDate = todayDate.endOf('week');
  const todayInString = todayDate.format('DD-MM-YYYY');

  const youthsWithBirthdayThisWeek = useMemo(() => {
    return youths.filter((youth) => {
      const userBirthDate = dayjs(youth.birth_date); // assuming the field is birth_date in the API
      return userBirthDate.isBetween(startOfTheWeekDate, endOfTheWeekDate, 'day', '[]');
    });
  }, [youths, startOfTheWeekDate, endOfTheWeekDate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>

      {/* Statistics Section */}
      {loadingStats ? (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 1 }}>Loading statistics...</Typography>
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, borderBottom: '2px solid #1976d2', pb: 1, display: 'inline-block' }}>
            Sabha Center Average Attendance
          </Typography>
          
          {/* Sabha Center Statistics Cards */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3, 
            mb: 4 
          }}>
            {centerStats.map((stat) => (
              <Card
                key={stat.centerId}
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
                  title={stat.centerName}
                  avatar={<LocationOnIcon color="primary" />}
                  subheader={stat.dateRange ? `${stat.dateRange.fromDate.format('DD/MM/YYYY')} - ${stat.dateRange.toDate.format('DD/MM/YYYY')}` : 'Select date range'}
                />
                <CardContent>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mb: 2, 
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <DatePicker
                        label="From"
                        value={stat.dateRange?.fromDate || dayjs().subtract(1, 'month')}
                        onChange={(newValue) => {
                          setDateRanges(prev => ({
                            ...prev,
                            [stat.centerId]: {
                              ...prev[stat.centerId] || { toDate: dayjs() },
                              fromDate: newValue || dayjs().subtract(1, 'month')
                            }
                          }));
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { minWidth: '120px', fontSize: '0.75rem' }
                          }
                        }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        to
                      </Typography>
                      <DatePicker
                        label="To"
                        value={stat.dateRange?.toDate || dayjs()}
                        onChange={(newValue) => {
                          setDateRanges(prev => ({
                            ...prev,
                            [stat.centerId]: {
                              ...prev[stat.centerId] || { fromDate: dayjs().subtract(1, 'month') },
                              toDate: newValue || dayjs()
                            }
                          }));
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { minWidth: '120px', fontSize: '0.75rem' }
                          }
                        }}
                      />
                    </Box>
                  </LocalizationProvider>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" color="primary" sx={{ mr: 1 }}>
                      {stat.averageAttendance}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      attendees
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={`${stat.totalSabhas} sabhas`} 
                      size="small" 
                      color="secondary" 
                    />
                    <Typography variant="caption" color="textSecondary">
                      Total Youths: {stat.totalYouths}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Attendance Charts Section */}
      {sabhaCenters.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, borderBottom: '2px solid #1976d2', pb: 1, display: 'inline-block' }}>
            Attendance Trends - All Centers
          </Typography>
          

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
            gap: 3 
          }}>
            {loadingStats ? (
              <Box sx={{ 
                gridColumn: '1 / -1',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: 4
              }}>
                <LinearProgress sx={{ width: '200px', mb: 2 }} />
                <Typography>Loading chart data...</Typography>
              </Box>
            ) : attendanceChartData.length > 0 ? (
              attendanceChartData.map((centerChart) => (
                <Card 
                  key={centerChart.centerId}
                  elevation={3}
                  sx={{ 
                    height: '450px',
                    '&:hover': {
                      boxShadow: 6,
                      transition: 'box-shadow 0.3s ease-in-out'
                    }
                  }}
                >
                  <CardHeader 
                    title={`${centerChart.centerName} - Attendance Progress`}
                    avatar={<TrendingUpIcon color="primary" />}
                    subheader={centerChart.dateRange ? `${centerChart.dateRange.fromDate.format('DD/MM/YYYY')} - ${centerChart.dateRange.toDate.format('DD/MM/YYYY')}` : 'Select date range'}
                  />
                  <CardContent sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mb: 2, 
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <DatePicker
                          label="From"
                          value={centerChart.dateRange?.fromDate || dayjs().subtract(1, 'month')}
                          onChange={(newValue) => {
                            setAttendanceChartDateRanges(prev => ({
                              ...prev,
                              [centerChart.centerId]: {
                                ...prev[centerChart.centerId] || { toDate: dayjs() },
                                fromDate: newValue || dayjs().subtract(1, 'month')
                              }
                            }));
                          }}
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { minWidth: '120px', fontSize: '0.75rem' }
                            }
                          }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          to
                        </Typography>
                        <DatePicker
                          label="To"
                          value={centerChart.dateRange?.toDate || dayjs()}
                          onChange={(newValue) => {
                            setAttendanceChartDateRanges(prev => ({
                              ...prev,
                              [centerChart.centerId]: {
                                ...prev[centerChart.centerId] || { fromDate: dayjs().subtract(1, 'month') },
                                toDate: newValue || dayjs()
                              }
                            }));
                          }}
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { minWidth: '120px', fontSize: '0.75rem' }
                            }
                          }}
                        />
                      </Box>
                    </LocalizationProvider>
                    
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {centerChart.chartData ? (
                        <Box sx={{ width: '100%', height: '100%' }}>
                          <Line 
                            data={centerChart.chartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top' as const,
                                },
                                title: {
                                  display: false,
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: {
                                    display: true,
                                    text: 'Number of Attendees'
                                  }
                                },
                                x: {
                                  title: {
                                    display: true,
                                    text: 'Sabha Date'
                                  }
                                }
                              },
                              elements: {
                                point: {
                                  radius: 6,
                                  hoverRadius: 8,
                                },
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography color="textSecondary" align="center">
                          No attendance data available for {centerChart.centerName}.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ 
                gridColumn: '1 / -1',
                display: 'flex', 
                justifyContent: 'center',
                p: 4
              }}>
                <Typography color="textSecondary" align="center">
                  No attendance data available for any center.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Karyakarta Chart Section */}
      {selectedSabhaCenter && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, borderBottom: '2px solid #1976d2', pb: 1, display: 'inline-block' }}>
            Karyakarta Youth Distribution - {sabhaCenters.find(center => center.id === selectedSabhaCenter)?.name}
          </Typography>
          <Card 
            elevation={3}
            sx={{ 
              height: '400px',
              '&:hover': {
                boxShadow: 6,
                transition: 'box-shadow 0.3s ease-in-out'
              }
            }}
          >
            <CardHeader 
              title="Youths Assigned to Karyakartas"
              avatar={<PeopleIcon color="secondary" />}
              subheader="Distribution of youths across karyakartas"
            />
            <CardContent sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loadingStats ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <LinearProgress sx={{ width: '200px', mb: 2 }} />
                  <Typography>Loading karyakarta data...</Typography>
                </Box>
              ) : karyakartaChartData ? (
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Bar 
                    data={karyakartaChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            title: function(context) {
                              return context[0].label;
                            },
                            label: function(context) {
                              const youthNames = (context.dataset as any).youthNames[context.dataIndex];
                              return [
                                `${context.parsed.y} youths assigned`,
                                `Youths: ${youthNames}`
                              ];
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Youths'
                          },
                          ticks: {
                            stepSize: 1
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Karyakartas'
                          }
                        }
                      },
                      elements: {
                        bar: {
                          borderRadius: 8,
                        },
                      },
                    }}
                  />
                </Box>
              ) : (
                <Typography color="textSecondary" align="center">
                  No karyakarta data available for this center.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

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
              {loading ? (
                <Typography>Loading birthdays...</Typography>
              ) : error ? (
                <Typography color="error">Error loading birthdays</Typography>
              ) : youthsWithBirthdayThisWeek.length === 0 ? (
                <Typography color="textSecondary">
                  No birthdays this week
                </Typography>
              ) : (
                youthsWithBirthdayThisWeek.map((youth) => {
                  const youthBirthdayToday = dayjs(youth.birth_date).format('DD-MM-YYYY');
                  const isToday = youthBirthdayToday === todayInString;

                  return (
                    <Accordion key={youth.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                          {isToday ? '🎉 Today: ' : ''}{youth.first_name} {youth.last_name}
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
