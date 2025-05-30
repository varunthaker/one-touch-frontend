import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  MaterialReactTable, 
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
interface SabhaCenter {
  city: string;
  address: string;
  responsible_person: string;
  contact_number: string;
  name: string;
  id?: number;
}

interface Youth {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  origin_city_india: string;
  current_city_germany: string;
  educational_field: string;
}

const initialFormData: SabhaCenter = {
  city: '',
  address: '',
  responsible_person: '',
  contact_number: '',
  name: ''
};

const SabhaCenter = () => {
  const [data, setData] = useState<SabhaCenter[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<SabhaCenter>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [youthDialogOpen, setYouthDialogOpen] = useState(false);
  const [selectedCenterYouths, setSelectedCenterYouths] = useState<Youth[]>([]);
  const [selectedCenterName, setSelectedCenterName] = useState('');
  const [loadingYouths, setLoadingYouths] = useState(false);
  const navigate = useNavigate();
  const fetchYouths = async (centerId: number, centerName: string) => {
    setLoadingYouths(true);
    try {
      const response = await axios.get(`https://onetouch-backend-mi70.onrender.com/api/youths/?sabha_center_id=${centerId}`);
      setSelectedCenterYouths(response.data);
      setSelectedCenterName(centerName);
      setYouthDialogOpen(true);
    } catch (error) {
      console.error('Error fetching youths:', error);
    } finally {
      setLoadingYouths(false);
    }
  };

  const columns: MRT_ColumnDef<SabhaCenter>[] = [
    {
      accessorKey: 'name',
      header: 'Sabha Name',
    },
    {
      accessorKey: 'city',
      header: 'City',
    },
    {
      accessorKey: 'address',
      header: 'Address',
    },
    {
      accessorKey: 'responsible_person',
      header: 'Responsible Person',
    },
    {
      accessorKey: 'contact_number',
      header: 'Contact Number',
    },
    {
      id: 'actions',
      header: 'Actions',
      Cell: ({ row }) => (
        <Tooltip title="Show Youths">
          <IconButton 
            color="primary"
            onClick={() => fetchYouths(row.original.id!, row.original.name)}
          >
            <GroupIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const youthColumns: MRT_ColumnDef<Youth>[] = [
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
    {
      accessorKey: 'phone_number',
      header: 'Phone Number',
    },
    {
      accessorKey: 'birth_date',
      header: 'Birth Date',
    },
    {
      accessorKey: 'current_city_germany',
      header: 'Current City',
    },
    {
      accessorKey: 'educational_field',
      header: 'Education',
    },
  ];

  const fetchSabhaCenters = async () => {
    try {
      const response = await axios.get('https://onetouch-backend-mi70.onrender.com/api/sabha_centers/');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching sabha centers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSabhaCenters();
  }, []);

  const handleClickOpen = () => {
    navigate('/sabhacenterselector');
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('https://onetouch-backend-mi70.onrender.com/api/sabha_centers/', formData);
      handleClose();
      fetchSabhaCenters(); // Refresh the table
    } catch (error) {
      console.error('Error adding sabha center:', error);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    state: { isLoading: loading },
    enablePagination: true,
    enableSorting: true,
    muiTableContainerProps: { sx: { maxHeight: '500px' } },
  });

  const youthTable = useMaterialReactTable({
    columns: youthColumns,
    data: selectedCenterYouths,
    state: { isLoading: loadingYouths },
    enablePagination: true,
    enableSorting: true,
    muiTableContainerProps: { sx: { maxHeight: '500px' } },
  });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Sabha Centers</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleClickOpen}
        >
          Change Center
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add Sabha Center
        </Button>
      </Box>

      <MaterialReactTable table={table} />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Sabha Center</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="name"
              label="Sabha Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="city"
              label="City"
              value={formData.city}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
              required
              multiline
              rows={2}
            />
            <TextField
              name="responsible_person"
              label="Responsible Person"
              value={formData.responsible_person}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="contact_number"
              label="Contact Number"
              value={formData.contact_number}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={youthDialogOpen} 
        onClose={() => setYouthDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Youths in {selectedCenterName}
        </DialogTitle>
        <DialogContent>
          <MaterialReactTable table={youthTable} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setYouthDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SabhaCenter; 