import { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box,
  Alert,
  Typography,
  IconButton,
  Stack,
  TextField,  
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import useSabhaStore from '../../store/useSabhaStore';
import useYouthsStore from '../../store/useYouthsStore';
import useSabhaSelectorStore from '../../store/useSabhaSelectorStore';
import { useAuth } from '../../auth/AuthProvider';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const SabhaList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSabha, setSelectedSabha] = useState<number | null>(null);
  const [createSabhaDialogOpen, setCreateSabhaDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedSabhaForAttendance, setSelectedSabhaForAttendance] = useState<any>(null);
  const [rowSelection, setRowSelection] = useState<{[key: number]: boolean}>({});
  const [formData, setFormData] = useState({
    topic: '',
    speaker_name: '',
    date: dayjs().format('YYYY-MM-DD')
  });

  const { sabhas, loading: sabhasLoading, error: sabhasError, fetchSabhas } = useSabhaStore();
  const { youths, loading: youthsLoading, fetchYouths } = useYouthsStore();
  const selectedSabhaCenter = useSabhaSelectorStore(state => state.selectedCity);
  const { roles } = useAuth();

  useEffect(() => {
    if (selectedSabhaCenter) {
      fetchSabhas();
      fetchYouths();
    }
  }, [selectedSabhaCenter, fetchSabhas, fetchYouths]);

  const sabhaColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Sabha ID',
      },
      {
        accessorKey: 'topic',
        header: 'Sabha Topic',
      },
      {
        accessorKey: 'speaker_name',
        header: 'Speaker Name',
      },
      {
        accessorKey: 'date',
        header: 'Date',
        Cell: ({ cell }) => dayjs(cell.getValue<string>()).format('DD-MM-YYYY'),
      },
      {
        id: 'actions',
        header: 'Actions',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                setSelectedSabha(row.original.id);
                setIsModalOpen(true);
              }}
            >
              View Attendees
            </Button>
            {roles?.includes('superadmin') && (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<GroupIcon />}
                onClick={() => handleEditAttendees(row.original)}
              >
                Edit Attendees
              </Button>
            )}
          </Box>
        ),
      },
    ],
    [youths]
  );

  const youthColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'First Name',
      },
      {
        accessorKey: 'last_name',
        header: 'Last Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
    ],
    []
  );

  const handleCreateSabha = () => {
    setCreateSabhaDialogOpen(true);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async () => {
    try {
      await fetch('https://onetouch-backend-mi70.onrender.com/api/sabhas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sabha_center_id: selectedSabhaCenter
        })
      });
      setCreateSabhaDialogOpen(false);
      setFormData({
        topic: '',
        speaker_name: '',
        date: dayjs().format('YYYY-MM-DD')
      });
      fetchSabhas(); // Refresh the table
    } catch (error) {
      console.error('Error creating sabha:', error);
    }
  };

  const handleFormClose = () => {
    setCreateSabhaDialogOpen(false);
    setFormData({
      topic: '',
      speaker_name: '',
      date: dayjs().format('YYYY-MM-DD')
    });
  };

  const handleEditAttendees = (sabha: any) => {
    setSelectedSabhaForAttendance(sabha);
    // Initialize with no selections (all absent)
    setRowSelection({});
    setAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSabhaForAttendance) return;
    
    try {
      const attendancePayload = {
        sabha_id: selectedSabhaForAttendance.id,
        attendance_data: youths.map((youth: any) => ({
          youth_id: youth.id,
          is_present: rowSelection[youth.id] || false
        }))
      };

      await fetch('https://onetouch-backend-mi70.onrender.com/api/attendance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendancePayload)
      });

      setAttendanceDialogOpen(false);
      setSelectedSabhaForAttendance(null);
      setRowSelection({});
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const handleAttendanceDialogClose = () => {
    setAttendanceDialogOpen(false);
    setSelectedSabhaForAttendance(null);
    setRowSelection({});
  };

  const attendanceColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Name',
        Cell: ({ row }) => (
          <Typography>
            {row.original.first_name} {row.original.last_name}
          </Typography>
        ),
      },
    ],
    []
  );

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

  if (sabhasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{sabhasError}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Sabha List</Typography>
        {roles?.includes('superadmin') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSabha}
          >
            Create New Sabha
          </Button>
        )}
      </Box>

      <MaterialReactTable
        columns={sabhaColumns}
        data={sabhas}
        state={{ isLoading: sabhasLoading }}
        enablePagination={true}
        enableSorting={true}
        muiTablePaperProps={{
          elevation: 1,
          sx: {
            borderRadius: '0.5rem',
            border: '1px solid #e0e0e0',
          },
        }}
      />

      <Dialog
        open={createSabhaDialogOpen}
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Sabha</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="topic"
              label="Topic"
              value={formData.topic}
              onChange={handleFormInputChange}
              fullWidth
              required
            />
            <TextField
              name="speaker_name"
              label="Speaker Name"
              value={formData.speaker_name}
              onChange={handleFormInputChange}
              fullWidth
              required
            />
            <TextField
              name="date"
              label="Date"
              type="date"
              value={formData.date}
              onChange={handleFormInputChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Attendees - Sabha {selectedSabha}
            </Typography>
            <IconButton onClick={() => setIsModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {youthsLoading ? (
            <Typography>Loading youths...</Typography>
          ) : (
            <MaterialReactTable
              columns={youthColumns}
              data={youths}
              enableColumnActions={false}
              enableColumnFilters={false}
              enablePagination={true}
              enableSorting={true}
              muiTablePaperProps={{
                elevation: 0,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={attendanceDialogOpen}
        onClose={handleAttendanceDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Edit Attendance - {selectedSabhaForAttendance?.topic}
            </Typography>
            <IconButton onClick={handleAttendanceDialogClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {youthsLoading ? (
            <Typography>Loading youths...</Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              <MaterialReactTable
                columns={attendanceColumns}
                data={youths}
                enableRowSelection={true}
                onRowSelectionChange={setRowSelection}
                state={{ rowSelection }}
                enableGlobalFilter={true}
                enableColumnFilters={true}
                muiTablePaperProps={{
                  elevation: 0,
                }}
                muiTableContainerProps={{
                  sx: { maxHeight: '400px' }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAttendanceDialogClose}>Cancel</Button>
          <Button onClick={handleSaveAttendance} variant="contained" color="primary">
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SabhaList; 