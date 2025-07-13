import { useEffect, useMemo, useState } from "react";
import { YouthInfoForm } from "../forms/youthForm";
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { 
  Button,
  Box,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import useYouthsStore from "../../store/useYouthsStore";
import useSabhaSelectorStore from "../../store/useSabhaSelectorStore";
import { API_ENDPOINTS } from "../../config/api";
import { Link } from "react-router-dom";

const Youths = () => {
  const { youths, loading, error, fetchYouths } = useYouthsStore();
  const selectedCity = useSabhaSelectorStore((state) => state.selectedCity);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formInitialValues, setFormInitialValues] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchYouths();
  }, [fetchYouths, selectedCity]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
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
        accessorKey: 'birth_date',
        header: 'Birthdate',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone Number',
      },
      {
        accessorKey: 'educational_field',
        header: 'Education Field',
      },
      {
        accessorKey: 'current_city_germany',
        header: 'City in Germany',
      },
      {
        accessorKey: 'origin_city_india',
        header: 'City in India',
      },
      {
        id: 'edit',
        header: 'Edit',
        Cell: ({ row }) => (
          <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
            <EditIcon />
          </IconButton>
        ),
      },
    ],
    []
  );

  const handleAddClick = () => {
    setFormMode('add');
    setFormInitialValues(null);
    setEditId(null);
    setFormDialogOpen(true);
  };

  const handleEditClick = (row: any) => {
    setFormMode('edit');
    setFormInitialValues({
      ...row,
      sabha_center_ids: Array.isArray(row.sabha_centers)
        ? row.sabha_centers.map((c: any) => c.id)
        : [],
    });
    setEditId(row.id);
    setFormDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setFormInitialValues(null);
    setEditId(null);
  };

  const handleFormSubmit = async (data: any) => {
    if (formMode === 'add') {
      // Let YouthInfoForm handle add (default)
      return;
    } else if (formMode === 'edit' && editId) {
      try {
        await fetch(`${API_ENDPOINTS.YOUTHS}${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            is_active: Boolean(data.is_active),
            karyakarta_id: data.karyakarta_id || 0,
            created_at: data.created_at || new Date().toISOString(),
            sabha_center_ids: data.sabha_center_ids || [0],
          })
        });
        setFormDialogOpen(false);
        setEditId(null);
        setFormInitialValues(null);
        fetchYouths();
      } catch (error) {
        console.error('Error editing youth:', error);
      }
    }
  };

  if (!selectedCity) {
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
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">
          Youths
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => {
              const csvConfig = mkConfig({
                useKeysAsHeaders: true,
                filename: 'youths_data'
              });
              
              const csvData = youths.map(youth => ({
                'First Name': youth.first_name || '',
                'Last Name': youth.last_name || '',
                'Birthdate': youth.birth_date || '',
                'Email': youth.email || '',
                'Phone Number': youth.phone_number || '',
                'Education Field': youth.educational_field || '',
                'City in Germany': youth.current_city_germany || '',
                'City in India': youth.origin_city_india || ''
              }));
              
              const csv = generateCsv(csvConfig)(csvData);
              download(csvConfig)(csv);
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add New Youth
          </Button>
        </Box>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={youths}
          enableColumnResizing
          enableColumnOrdering
          enableSorting
          enableGlobalFilter
          muiTableContainerProps={{
            sx: { maxHeight: '600px' }
          }}
          initialState={{
            density: 'compact'
          }}
        />
      )}
      
      <YouthInfoForm
        visible={formDialogOpen}
        onClose={handleFormClose}
        initialValues={formInitialValues}
        onSubmit={formMode === 'edit' ? handleFormSubmit : undefined}
        dialogTitle={formMode === 'add' ? 'Add New Youth' : 'Edit Youth'}
        submitButtonText={formMode === 'add' ? 'Save' : 'Update'}
      />
    </Box>
  );
};

export default Youths;
