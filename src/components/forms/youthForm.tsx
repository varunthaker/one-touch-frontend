import { useEffect } from "react";
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
  karyakarta_id: number;
  educational_field: string;
  sabha_center_ids: number[];
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
  const { handleSubmit, control, reset } = useForm<YouthFormData>({
    defaultValues: initialValues || {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      birth_date: dayjs().format('YYYY-MM-DD'),
      origin_city_india: "",
      current_city_germany: "",
      is_active: true,
      karyakarta_id: 1,
      educational_field: "",
      sabha_center_ids: [],
    },
  });

  useEffect(() => {
    if (visible) {
      fetchSabhaCenters();
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
          karyakarta_id: 1,
          educational_field: "",
          sabha_center_ids: [],
        });
      }
    }
  }, [visible, fetchSabhaCenters, initialValues, reset]);

  const defaultOnSubmit = async (data: YouthFormData) => {
    try {
      await axios.post('https://onetouch-backend-mi70.onrender.com/api/youths/', {
        ...data,
        created_at: dayjs().toISOString(),
        karyakarta_id: 1, // Ensure karyakarta_id is always 1
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
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)', my: 2 }}>
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
                <TextField
                  {...field}
                  label="Current City (Germany)"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
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
              name="sabha_center_ids"
              control={control}
              rules={{ required: "Please select at least one sabha center" }}
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
                </FormControl>
              )}
            />

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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
