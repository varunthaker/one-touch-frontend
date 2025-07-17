import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  OutlinedInput,
  Chip
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import useSabhaCenterStore from "../../store/useSabhaCenterStore";
import useYouthsStore from "../../store/useYouthsStore";
import useSabhaSelectorStore from "../../store/useSabhaSelectorStore";
import { API_ENDPOINTS } from "../../config/api";
import dayjs from 'dayjs';

interface YouthFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  origin_city_india: string;
  current_city_germany: string;
  is_active: boolean;
  is_karyakarta: boolean;
  karyakarta_id: number;
  educational_field: string;
  sabha_center_ids: number[];
}

interface Karyakarta {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  origin_city_india: string;
  current_city_germany: string;
  is_active: boolean;
  educational_field: string;
  created_at: string;
  is_karyakarta: boolean;
  karyakarta_id: number;
  id: number;
  sabha_centers: Array<{
    city: string;
    address: string;
    responsible_person: string;
    contact_number: string;
    name: string;
    id: number;
  }>;
}

interface YouthInfoFormProps {
  visible: boolean;
  onClose: () => void;
  initialValues?: Partial<YouthFormData>;
  onSubmit?: (data: YouthFormData) => Promise<void>;
  dialogTitle?: string;
  submitButtonText?: string;
}

export function YouthInfoForm({ visible, onClose, initialValues, onSubmit, dialogTitle = 'Add New Youth', submitButtonText = 'Save' }: YouthInfoFormProps) {
  const { sabhaCenters, fetchSabhaCenters } = useSabhaCenterStore();
  const { fetchYouths } = useYouthsStore();
  const selectedSabhaCenter = useSabhaSelectorStore(state => state.selectedCity);
  const [karyakartas, setKaryakartas] = useState<Karyakarta[]>([]);
  const [loadingKaryakartas, setLoadingKaryakartas] = useState(false);
  const { handleSubmit, control, reset, formState: { isValid, errors } } = useForm<YouthFormData>({
    defaultValues: initialValues || {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      birth_date: dayjs().format('YYYY-MM-DD'),
      origin_city_india: "",
      current_city_germany: "",
      is_active: true,
      is_karyakarta: false,
      karyakarta_id: 0,
      educational_field: "",
      sabha_center_ids: [],
    },
    mode: "onChange",
  });

  const fetchKaryakartas = async () => {
    if (!selectedSabhaCenter) return;
    
    setLoadingKaryakartas(true);
    try {
      const response = await axios.get(API_ENDPOINTS.YOUTHS_KARYAKARTA(selectedSabhaCenter));
      setKaryakartas(response.data);
    } catch (error) {
      console.error('Error fetching karyakartas:', error);
    } finally {
      setLoadingKaryakartas(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchSabhaCenters();
      fetchKaryakartas();
      if (initialValues) {
        reset({ ...initialValues });
      } else {
        reset({
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          birth_date: dayjs().format('YYYY-MM-DD'),
          origin_city_india: "",
          current_city_germany: "",
          is_active: true,
          is_karyakarta: false,
          karyakarta_id: 0,
          educational_field: "",
          sabha_center_ids: [],
        });
      }
    }
  }, [visible, fetchSabhaCenters, selectedSabhaCenter, initialValues, reset]);

  const defaultOnSubmit = async (data: YouthFormData) => {
    try {
      await axios.post(API_ENDPOINTS.YOUTHS, {
        ...data,
        created_at: dayjs().toISOString(),
      });
      await fetchYouths(); // Refresh the youths data
      reset(); // Reset form
      onClose(); // Close modal
    } catch (error) {
      console.error('Error creating youth:', error);
    }
  };

  return (
    <Dialog 
      open={visible} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit || defaultOnSubmit)}>
        <DialogContent>
          <Box sx={{ 
            display: 'grid', 
            gap: 2, 
            gridTemplateColumns: { 
              xs: '1fr',      // 1 column on extra small screens
              sm: 'repeat(2, 1fr)'  // 2 columns on small screens and up
            }, 
            my: 2 
          }}>
            <Controller
              name="first_name"
              control={control}
              rules={{ required: "First name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="First Name"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="last_name"
              control={control}
              rules={{ required: "Last name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{ 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="phone_number"
              control={control}
              rules={{ required: "Phone number is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="birth_date"
              control={control}
              rules={{ required: "Birth date is required" }}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Birth Date"
                    value={dayjs(field.value)}
                    onChange={(newValue) => {
                      field.onChange(newValue ? dayjs(newValue).format('YYYY-MM-DD') : '');
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !field.value,
                        helperText: !field.value ? "Birth date is required" : ""
                      }
                    }}
                  />
                </LocalizationProvider>
              )}
            />

            <Controller
              name="educational_field"
              control={control}
              rules={{ required: "Educational field is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Educational Field"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="current_city_germany"
              control={control}
              rules={{ required: "Current city is required" }}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>Current City (Germany)</InputLabel>
                  <Select
                    {...field}
                    input={<OutlinedInput label="Current City (Germany)" />}
                  >
                    {Array.from(new Set(sabhaCenters.map(center => center.city)))
                      .sort()
                      .map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                  </Select>
                  {fieldState.error && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {fieldState.error.message}
                    </Box>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="origin_city_india"
              control={control}
              rules={{ required: "Origin city is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Origin City (India)"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="karyakarta_id"
              control={control}
              rules={{ 
                required: "Please select a karyakarta",
                validate: (value) => value > 0 || "Please select a karyakarta"
              }}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>Karyakarta</InputLabel>
                  <Select
                    {...field}
                    disabled={loadingKaryakartas}
                    input={<OutlinedInput label="Karyakarta" />}
                  >
                    {karyakartas.map((karyakarta) => (
                      <MenuItem key={karyakarta.id} value={karyakarta.id}>
                        {karyakarta.first_name} {karyakarta.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {fieldState.error.message}
                    </Box>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="sabha_center_ids"
              control={control}
              rules={{ 
                required: "Please select at least one sabha center",
                validate: (value) => (value && value.length > 0) || "Please select at least one sabha center"
              }}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>Sabha Centers</InputLabel>
                  <Select
                    {...field}
                    multiple
                    input={<OutlinedInput label="Sabha Centers" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={sabhaCenters.find(center => center.id === value)?.name}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {sabhaCenters.map((center) => (
                      <MenuItem key={center.id} value={center.id}>
                        {center.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {fieldState.error.message}
                    </Box>
                  )}
                </FormControl>
              )}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Active Status"
                  />
                )}
              />

              <Controller
                name="is_karyakarta"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Is Karyakarta"
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!isValid || Object.keys(errors).length > 0}
          >
            {submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
