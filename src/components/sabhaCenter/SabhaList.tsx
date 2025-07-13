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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Close as CloseIcon, Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
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
  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState(false);
  const [presentYouths, setPresentYouths] = useState<any[]>([]);
  const [loadingPresentYouths, setLoadingPresentYouths] = useState(false);
  interface SabhaFormData {
    topic: string;
    speaker_name: string;
    date: string;
  }

  const { handleSubmit, control, reset, formState: { isValid, errors } } = useForm<SabhaFormData>({
    defaultValues: {
      topic: '',
      speaker_name: '',
      date: dayjs().format('YYYY-MM-DD')
    },
    mode: 'onChange'
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
              onClick={() => handleViewAttendees(row.original)}
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

  const handleViewAttendees = async (sabha: any) => {
    setSelectedSabha(sabha.id);
    setLoadingPresentYouths(true);
    setIsModalOpen(true);
    
    try {
      // Fetch present youth IDs for this sabha
      const response = await fetch(`https://onetouch-backend-mi70.onrender.com/api/attendance/${sabha.id}`);
      const data = await response.json();
      
      // Filter youths to only show present ones
      if (data.present_youth_ids && Array.isArray(data.present_youth_ids)) {
        const presentYouthsList = youths.filter((youth: any) => 
          data.present_youth_ids.includes(youth.id)
        );
        setPresentYouths(presentYouthsList);
      } else {
        setPresentYouths([]);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setPresentYouths([]);
    } finally {
      setLoadingPresentYouths(false);
    }
  };

  const onSubmit = async (data: SabhaFormData) => {
    try {
      await fetch('https://onetouch-backend-mi70.onrender.com/api/sabhas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          sabha_center_id: selectedSabhaCenter
        })
      });
      setCreateSabhaDialogOpen(false);
      reset();
      fetchSabhas(); // Refresh the table
    } catch (error) {
      console.error('Error creating sabha:', error);
    }
  };



    const handleFormClose = () => {
    setCreateSabhaDialogOpen(false);
    reset();
  };

  const handleEditAttendees = async (sabha: any) => {
    setSelectedSabhaForAttendance(sabha);
    setAttendanceDialogOpen(true);
    
    try {
      // Fetch present youth IDs for this sabha
      const response = await fetch(`https://onetouch-backend-mi70.onrender.com/api/attendance/${sabha.id}`);
      const data = await response.json();
      
      // Convert present_youth_ids array to rowSelection object
      const initialRowSelection: {[key: number]: boolean} = {};
      if (data.present_youth_ids && Array.isArray(data.present_youth_ids)) {
        data.present_youth_ids.forEach((youthId: number) => {
          initialRowSelection[youthId] = true;
        });
      }
      
      setRowSelection(initialRowSelection);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // If there's an error, initialize with no selections
      setRowSelection({});
    }
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
    // Check if there are any selections made
    const hasSelections = Object.keys(rowSelection).length > 0;
    
    if (hasSelections) {
      // Show confirmation dialog if there are unsaved changes
      setConfirmCloseDialogOpen(true);
    } else {
      // Close directly if no changes
      setAttendanceDialogOpen(false);
      setSelectedSabhaForAttendance(null);
      setRowSelection({});
    }
  };

  const handleConfirmClose = () => {
    setConfirmCloseDialogOpen(false);
    setAttendanceDialogOpen(false);
    setSelectedSabhaForAttendance(null);
    setRowSelection({});
  };

  const handleCancelClose = () => {
    setConfirmCloseDialogOpen(false);
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
        initialState={{
          sorting: [
            {
              id: 'id',
              desc: true
            }
          ]
        }}
        muiTablePaperProps={{
          elevation: 1,
          sx: {
            borderRadius: '0.5rem',
            border: '1px solid #e0e0e0',
          },
        }}
        muiTableBodyRowProps={({ row }) => ({
          sx: {
            backgroundColor: row.original.id === Math.max(...sabhas.map(s => s.id)) ? '#e3f2fd' : 'inherit',
            '&:hover': {
              backgroundColor: row.original.id === Math.max(...sabhas.map(s => s.id)) ? '#bbdefb' : undefined,
            },
          },
        })}
      />

      <Dialog
        open={createSabhaDialogOpen}
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Sabha</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <Controller
                name="topic"
                control={control}
                rules={{ required: "Topic is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Topic"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="speaker_name"
                control={control}
                rules={{ required: "Speaker name is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Speaker Name"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="date"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field, fieldState }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue) => {
                        field.onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!fieldState.error,
                          helperText: fieldState.error?.message
                        }
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFormClose}>Cancel</Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={!isValid}
            >
              Create
            </Button>
          </DialogActions>
        </form>
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
              Attendees - {sabhas.find(sabha => sabha.id === selectedSabha)?.topic || 'Unknown Sabha'}
            </Typography>
            <IconButton onClick={() => setIsModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingPresentYouths ? (
            <Typography>Loading attendees...</Typography>
          ) : presentYouths.length === 0 ? (
            <Typography>No attendees found for this sabha.</Typography>
          ) : (
            <MaterialReactTable
              columns={youthColumns}
              data={presentYouths}
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
                getRowId={(row) => row.id}
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

      <Dialog open={confirmCloseDialogOpen} onClose={handleCancelClose} maxWidth="xs">
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>Are you sure? Your attendance changes are not saved.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose}>Cancel</Button>
          <Button onClick={handleConfirmClose} color="error" variant="contained">
            Close Without Saving
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SabhaList; 