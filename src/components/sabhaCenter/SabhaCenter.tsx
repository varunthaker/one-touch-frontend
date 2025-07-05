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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const [formData, setFormData] = useState<SabhaCenter>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [youthDialogOpen, setYouthDialogOpen] = useState(false);
  const [selectedCenterYouths, setSelectedCenterYouths] = useState<Youth[]>([]);
  const [selectedCenterName, setSelectedCenterName] = useState('');
  const [loadingYouths, setLoadingYouths] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
      id: 'youths',
      header: 'Youths',
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
    {
      id: 'edit',
      header: 'Edit',
      Cell: ({ row }) => (
        <Tooltip title="Edit">
          <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      id: 'delete',
      header: 'Delete',
      Cell: ({ row }) => (
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDeleteClick(row.original.id!)}>
            <DeleteIcon />
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

  const handleClickChangeCenter = () => {
    navigate('/sabhacenterselector');
  };

  const handleAddSabhaCenter = () => {
    setFormMode('add');
    setFormData(initialFormData);
    setEditId(null);
    setFormDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (center: SabhaCenter) => {
    setFormMode('edit');
    setFormData(center);
    setEditId(center.id!);
    setFormDialogOpen(true);
  };

  const handleFormDialogClose = () => {
    setFormDialogOpen(false);
    setFormData(initialFormData);
    setEditId(null);
  };

  const handleFormSubmit = async () => {
    if (formMode === 'add') {
      try {
        await axios.post('https://onetouch-backend-mi70.onrender.com/api/sabha_centers/', formData);
        handleFormDialogClose();
        fetchSabhaCenters();
      } catch (error) {
        console.error('Error adding sabha center:', error);
      }
    } else if (formMode === 'edit' && editId != null) {
      try {
        await axios.put(`https://onetouch-backend-mi70.onrender.com/api/sabha_centers/${editId}`, formData);
        handleFormDialogClose();
        fetchSabhaCenters();
      } catch (error) {
        console.error('Error editing sabha center:', error);
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    try {
      await axios.delete(`https://onetouch-backend-mi70.onrender.com/api/sabha_centers/${deleteId}`);
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchSabhaCenters();
    } catch (error) {
      console.error('Error deleting sabha center:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
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
          onClick={handleClickChangeCenter}
        >
          Change Center
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSabhaCenter}
        >
          Add Sabha Center
        </Button>
      </Box>

      <MaterialReactTable table={table} />

      <Dialog open={formDialogOpen} onClose={handleFormDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{formMode === 'add' ? 'Add New Sabha Center' : 'Edit Sabha Center'}</DialogTitle>
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
          <Button onClick={handleFormDialogClose}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">{formMode === 'add' ? 'Save' : 'Update'}</Button>
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

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs">
        <DialogTitle>Delete Sabha Center</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this Sabha Center?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SabhaCenter; 