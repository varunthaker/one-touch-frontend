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
import { Close as CloseIcon, Add as AddIcon, Group as GroupIcon, PersonAdd as PersonAddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import useSabhaStore from '../../store/useSabhaStore';
import useYouthsStore from '../../store/useYouthsStore';
import useSabhaSelectorStore from '../../store/useSabhaSelectorStore';
import { useAuth } from '../../auth/AuthProvider';
import { API_ENDPOINTS } from '../../config/api';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { YouthInfoForm } from '../forms/youthForm';
import axiosInstance from '../../config/axios';

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
  const [youthFormOpen, setYouthFormOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [selectedSabhaForDelete, setSelectedSabhaForDelete] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSabhaForEdit, setSelectedSabhaForEdit] = useState<any>(null);
  
  interface SabhaFormData {
    topic: string;
    speaker_name: string;
    date: string;
    food: string;
  }

  const { handleSubmit, control, reset, formState: { isValid } } = useForm<SabhaFormData>({
    defaultValues: {
      topic: '',
      speaker_name: '',
      date: dayjs().format('YYYY-MM-DD'),
      food: ''
    },
    mode: 'onChange'
  });

  const { sabhas, loading: sabhasLoading, error: sabhasError, fetchSabhas } = useSabhaStore();
  const { youths, loading: youthsLoading, fetchYouths } = useYouthsStore();
  const selectedSabhaCenter = useSabhaSelectorStore(state => state.selectedCity);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (selectedSabhaCenter) {
      fetchSabhas();
      fetchYouths();
    }
  }, [selectedSabhaCenter, fetchSabhas, fetchYouths]);

  const sabhaColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        id: 'attendees',
        header: 'Attendees',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleViewAttendees(row.original)}
            >
              View
            </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<GroupIcon />}
                onClick={() => handleEditAttendees(row.original)}
              >
                Edit
              </Button>
          </Box>
        ),
      },
      {
        accessorKey: 'topic',
        header: 'Sabha Topic',
      },
      {
        accessorKey: 'date',
        header: 'Date',
        Cell: ({ cell }) => dayjs(cell.getValue<string>()).format('DD-MM-YYYY'),
      },
      {
        accessorKey: 'speaker_name',
        header: 'Speaker Name',
      },
      {
        accessorKey: 'food',
        header: 'Food',
      },
      {
        accessorKey: 'id',
        header: 'Sabha ID',
        size: 20
      },
      {
        id: 'actions',
        header: 'Actions',
        Cell: ({ row }: { row: any }) => (
          <Box sx={{ display: 'flex', gap: '0.5rem' }}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditSabha(row.original)}
            >
              <EditIcon />
            </IconButton>
            {isAdmin() && (
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteSabha(row.original)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ),
      },
    ],
    [youths, isAdmin]
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
    setIsEditMode(false);
    setSelectedSabhaForEdit(null);
    reset({
      topic: '',
      speaker_name: '',
      date: dayjs().format('YYYY-MM-DD'),
      food: ''
    });
    setCreateSabhaDialogOpen(true);
  };

  const handleViewAttendees = async (sabha: any) => {
    setSelectedSabha(sabha.id);
    setLoadingPresentYouths(true);
    setIsModalOpen(true);
    
    try {
      // Fetch present youth IDs for this sabha
      const response = await axiosInstance.get(API_ENDPOINTS.ATTENDANCE_BY_SABHA(sabha.id));
      const data = response.data;
      
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
      if (isEditMode && selectedSabhaForEdit) {
        // Edit existing sabha
        await axiosInstance.put(`${API_ENDPOINTS.SABHAS}${selectedSabhaForEdit.id}`, {
          ...data,
          sabha_center_id: selectedSabhaCenter
        });
      } else {
        // Create new sabha
        await axiosInstance.post(API_ENDPOINTS.SABHAS, {
          ...data,
          sabha_center_id: selectedSabhaCenter
        });
      }
      
      setCreateSabhaDialogOpen(false);
      setIsEditMode(false);
      setSelectedSabhaForEdit(null);
      reset();
      fetchSabhas(); // Refresh the table
    } catch (error) {
      console.error('Error saving sabha:', error);
    }
  };



    const handleFormClose = () => {
    setCreateSabhaDialogOpen(false);
    setIsEditMode(false);
    setSelectedSabhaForEdit(null);
    reset();
  };

  const handleEditAttendees = async (sabha: any) => {
    setSelectedSabhaForAttendance(sabha);
    setAttendanceDialogOpen(true);
    
    try {
      // Fetch present youth IDs for this sabha
      const response = await axiosInstance.get(API_ENDPOINTS.ATTENDANCE_BY_SABHA(sabha.id));
      const data = response.data;
      
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

      await axiosInstance.post(API_ENDPOINTS.ATTENDANCE, attendancePayload);

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

  const handleCreateYouth = () => {
    setYouthFormOpen(true);
  };

  const handleYouthFormClose = () => {
    setYouthFormOpen(false);
  };

  const handleEditSabha = (sabha: any) => {
    setIsEditMode(true);
    setSelectedSabhaForEdit(sabha);
    reset({
      topic: sabha.topic,
      speaker_name: sabha.speaker_name,
      date: sabha.date,
      food: sabha.food || ''
    });
    setCreateSabhaDialogOpen(true);
  };

  const handleDeleteSabha = (sabha: any) => {
    setSelectedSabhaForDelete(sabha);
    setDeleteConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSabhaForDelete) return;
    
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.SABHAS}${selectedSabhaForDelete.id}`);
      setDeleteConfirmDialogOpen(false);
      setSelectedSabhaForDelete(null);
      fetchSabhas(); // Refresh the table
    } catch (error) {
      console.error('Error deleting sabha:', error);
    }
  };



  const handleYouthCreated = async (data: any) => {
    try {
      // Send the youth data to the backend
      await axiosInstance.post(API_ENDPOINTS.YOUTHS, {
        ...data,
        created_at: dayjs().toISOString(),
      });
      
      // Refresh the youths list after a new youth is created
      await fetchYouths();
      setYouthFormOpen(false);
      
      // If we're in the attendance dialog, refresh the attendance data as well
      if (selectedSabhaForAttendance) {
        try {
          // Fetch updated attendance data for the current sabha
          const response = await axiosInstance.get(API_ENDPOINTS.ATTENDANCE_BY_SABHA(selectedSabhaForAttendance.id));
          const attendanceData = response.data;
          
          // Update row selection with the new data
          const updatedRowSelection: {[key: number]: boolean} = {};
          if (attendanceData.present_youth_ids && Array.isArray(attendanceData.present_youth_ids)) {
            attendanceData.present_youth_ids.forEach((youthId: number) => {
              updatedRowSelection[youthId] = true;
            });
          }
          setRowSelection(updatedRowSelection);
        } catch (error) {
          console.error('Error refreshing attendance data:', error);
        }
      }
    } catch (error) {
      console.error('Error creating youth:', error);
    }
  };

  const attendanceColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Name',
        Cell: ({ row }) => (
          <Typography>
            {row.original.first_name} {row.original.last_name}
            {row.original.origin_city_india && (
              <span style={{ color: '#666', fontSize: '0.9em' }}>
                {' '}({row.original.origin_city_india})
              </span>
            )}
          </Typography>
        ),
      },
      {
        accessorKey: 'birth_date',
        header: 'Birth Date',
        enableHiding: true,
        Cell: ({ cell }) => (
          <Typography>
            {cell.getValue<string>() ? dayjs(cell.getValue<string>()).format('DD-MM-YYYY') : '-'}
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
        {isAdmin() && (
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
            backgroundColor: row.original.id === Math.max(...sabhas.map(s => s.id)) ? 'rgba(82, 154, 209, 0.16)' : 'inherit',
            '&:hover': {
              backgroundColor: row.original.id === Math.max(...sabhas.map(s => s.id)) ? 'rgba(166, 176, 184, 0.24)' : undefined,
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
        <DialogTitle>{isEditMode ? 'Edit Sabha' : 'Create New Sabha'}</DialogTitle>
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
                name="food"
                control={control}
                rules={{ required: "Food is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Food"
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
              {isEditMode ? 'Update' : 'Create'}
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
              ({presentYouths.length}) Attendees - {sabhas.find(sabha => sabha.id === selectedSabha)?.topic || 'Unknown Sabha'}
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={handleCreateYouth}
              color="primary"
            >
              Create New Youth
            </Button>
          </Box>
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
                enableSelectAll={false}
                positionToolbarAlertBanner='none'
                initialState={{
                  columnVisibility: {
                    birth_date: false,
                  }
                }}
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

      <YouthInfoForm
        visible={youthFormOpen}
        onClose={handleYouthFormClose}
        dialogTitle="Create New Youth"
        submitButtonText="Create Youth"
        onSubmit={handleYouthCreated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onClose={() => setDeleteConfirmDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the sabha "{selectedSabhaForDelete?.topic}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SabhaList; 