import { useEffect, useMemo, useState } from "react";
import { YouthInfoForm } from "../forms/youthForm";
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { 
  Button,
  Box,
  Typography,
  Stack,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import useYouthsStore from "../../store/useYouthsStore";
import useSabhaSelectorStore from "../../store/useSabhaSelectorStore";
import { Link } from "react-router-dom";

const Youths = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { youths, loading, error, fetchYouths } = useYouthsStore();
  const selectedCity = useSabhaSelectorStore((state) => state.selectedCity);

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
        accessorKey: 'is_active',
        header: 'Active Status',
        Cell: ({ cell }) => (
          <Typography>{cell.getValue<boolean>() ? 'Active' : 'Inactive'}</Typography>
        ),
      },
    ],
    []
  );

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
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalVisible(true)}
          >
            Add New Youth
          </Button>
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
      </Paper>
      
      <YouthInfoForm
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </Box>
  );
};

export default Youths;
