import { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box,
  Alert,
  Typography,
  IconButton,
  Stack
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import useSabhaStore from '../../store/useSabhaStore';
import useYouthsStore from '../../store/useYouthsStore';
import useSabhaSelectorStore from '../../store/useSabhaSelectorStore';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const SabhaList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSabha, setSelectedSabha] = useState<number | null>(null);

  const { sabhas, loading: sabhasLoading, error: sabhasError, fetchSabhas } = useSabhaStore();
  const { youths, loading: youthsLoading, fetchYouths } = useYouthsStore();
  const selectedSabhaCenter = useSabhaSelectorStore(state => state.selectedCity);

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
          </Box>
        ),
      },
    ],
    []
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
        renderTopToolbarCustomActions={() => (
          <Typography variant="h6" component="div" sx={{ p: 2 }}>
            Sabha List
          </Typography>
        )}
      />

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
    </Box>
  );
};

export default SabhaList; 