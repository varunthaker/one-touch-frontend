import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Link } from 'react-router-dom';
import { 
  Button, 
  TextField,
  Box,
  Stack,
  Typography,
  Checkbox,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import useSabhaSelectorStore from '../../store/useSabhaSelectorStore';
import useEventStore from '../../store/useEventStore';
import useYouthsStore from '../../store/useYouthsStore';

interface AttendanceRecord {
  [youthName: string]: "present" | "absent";
}

interface AttendanceByDate {
  [date: string]: {
    attendance: AttendanceRecord;
    sabhaTopic: string;
    sabhaSpeakers: string;
  };
}

interface TableData {
  id: number;
  name: string;
  present: boolean;
}

interface Message {
  text: string;
  severity: 'success' | 'error';
}

const Attendance = () => {
  const [attendanceByDate, setAttendanceByDate] = useState<AttendanceByDate>({});
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [sabhaTopic, setSabhaTopic] = useState("");
  const [sabhaSpeakers, setSabhaSpeakers] = useState("");
  const [sabhaDate, setSabhaDate] = useState(dayjs());
  const [isSabhaSaved, setIsSabhaSaved] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const selectedSabhaCenter = useSabhaSelectorStore(state => state.selectedCity);
  const setCurrentSabhaId = useEventStore(state => state.setCurrentSabhaId);
  const { youths, loading: youthsLoading, fetchYouths } = useYouthsStore();

  // Fetch youths when sabha center changes
  useEffect(() => {
    if (selectedSabhaCenter) {
      fetchYouths();
    }
  }, [selectedSabhaCenter, fetchYouths]);

  useEffect(() => {
    const dateKey = sabhaDate.format("DD-MM-YYYY");
    if (attendanceByDate[dateKey]) {
      setAttendance(attendanceByDate[dateKey].attendance);
      setSabhaTopic(attendanceByDate[dateKey].sabhaTopic);
      setSabhaSpeakers(attendanceByDate[dateKey].sabhaSpeakers);
      setIsSabhaSaved(true);
    } else {
      const initial: AttendanceRecord = {};
      youths.forEach((y) => (initial[`${y.first_name} ${y.last_name}`] = "absent"));
      setAttendance(initial);
      setSabhaTopic("");
      setSabhaSpeakers("");
      setIsSabhaSaved(false);
    }
  }, [sabhaDate, youths, attendanceByDate]);

  const showMessage = (text: string, severity: 'success' | 'error') => {
    setMessage({ text, severity });
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  const columns = useMemo<MRT_ColumnDef<TableData>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Youth Name',
      },
      {
        accessorKey: 'present',
        header: 'Present',
        Cell: ({ row }) => (
          <Checkbox
            checked={attendance[row.original.name] === "present"}
            onChange={(e) => {
              setAttendance((prev) => ({
                ...prev,
                [row.original.name]: e.target.checked ? "present" : "absent",
              }));
            }}
          />
        ),
      },
    ],
    [attendance]
  );

  const tableData: TableData[] = useMemo(
    () => youths.map((y) => ({
      id: y.id,
      name: `${y.first_name} ${y.last_name}`,
      present: attendance[`${y.first_name} ${y.last_name}`] === "present",
    })),
    [youths, attendance]
  );

  const handleSaveSabha = async () => {
    if (!sabhaTopic || !sabhaSpeakers || !selectedSabhaCenter) {
      showMessage('Please fill in all Sabha details and select a Sabha center', 'error');
      return;
    }

    try {
      const response = await axios.post('https://onetouch-backend-mi70.onrender.com/api/sabhas/', {
        topic: sabhaTopic,
        speaker_name: sabhaSpeakers,
        date: sabhaDate.format('YYYY-MM-DD'),
        sabha_center_id: selectedSabhaCenter
      });

      setCurrentSabhaId(response.data.sabha_id);
      setIsSabhaSaved(true);
      showMessage(response.data.message, 'success');
    } catch (error) {
      console.error('Error saving sabha:', error);
      showMessage('Failed to save Sabha details', 'error');
    }
  };

  const handleSaveAttendance = async () => {
    const currentSabhaId = useEventStore.getState().currentSabhaId;

    if (!currentSabhaId) {
      showMessage('Please save Sabha details first', 'error');
      return;
    }

    try {
      const attendanceData = youths.map(youth => ({
        youth_id: youth.id,
        is_present: attendance[`${youth.first_name} ${youth.last_name}`] === "present"
      }));
      console.log(attendanceData);

      await axios.post('https://onetouch-backend-mi70.onrender.com/api/attendance/', {
        sabha_id: currentSabhaId,
        attendance_data: attendanceData
      });

      const dateKey = sabhaDate.format("DD-MM-YYYY");
      setAttendanceByDate((prev) => ({
        ...prev,
        [dateKey]: {
          attendance,
          sabhaTopic,
          sabhaSpeakers,
        },
      }));

      showMessage('Attendance saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving attendance:', error);
      showMessage('Failed to save attendance', 'error');
    }
  };

  if (!selectedSabhaCenter) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Alert severity="info">Please select a Sabha Center first to view attendance.</Alert>
          <Button 
            variant="contained" 
            component={Link} 
            to="/sabhacenterselector"
          >
            Select Sabha Center
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 3,
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 800, px: 3, py: 2 }}>
        <Typography variant="h4" gutterBottom>
          Attendance
        </Typography>
        
        <Stack spacing={3}>
          <Stack spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Sabha Date"
                value={sabhaDate}
                onChange={(newValue) => newValue && setSabhaDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal'
                  }
                }}
                disabled={isSabhaSaved}
              />
            </LocalizationProvider>
            <TextField
              label="Sabha Topic"
              value={sabhaTopic}
              onChange={(e) => setSabhaTopic(e.target.value)}
              required
              fullWidth
              disabled={isSabhaSaved}
            />
            <TextField
              label="Sabha Speakers"
              value={sabhaSpeakers}
              onChange={(e) => setSabhaSpeakers(e.target.value)}
              required
              fullWidth
              disabled={isSabhaSaved}
            />
            <Button 
              variant="contained" 
              onClick={handleSaveSabha}
              fullWidth
              disabled={isSabhaSaved}
            >
              Save Sabha Details
            </Button>
          </Stack>

          {isSabhaSaved && (
            <Box sx={{ mt: 2 }}>
              {youthsLoading ? (
                <Typography>Loading youths...</Typography>
              ) : youths.length === 0 ? (
                <Alert severity="info">No youths found for this Sabha center.</Alert>
              ) : (
                <MaterialReactTable
                  columns={columns}
                  data={tableData}
                  muiTablePaperProps={{
                    elevation: 0,
                    sx: {
                      borderRadius: '0',
                      border: '1px solid #e0e0e0',
                    },
                  }}
                  renderTopToolbarCustomActions={() => (
                    <Button
                      color="primary"
                      onClick={handleSaveAttendance}
                      variant="contained"
                      sx={{ m: 1 }}
                    >
                      Save Attendance
                    </Button>
                  )}
                />
              )}
            </Box>
          )}
        </Stack>
      </Paper>

      <Snackbar 
        open={!!message} 
        autoHideDuration={6000} 
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseMessage} 
          severity={message?.severity}
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Attendance;
