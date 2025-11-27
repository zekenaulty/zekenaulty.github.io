import { Box, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';

function ProfileDropdown({ profiles, value, onChange }) {
  return (
    <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 240 }}>
      <Select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        displayEmpty
        aria-label="Select profile"
        sx={{
          borderRadius: 1.5,
          backgroundColor: 'rgba(20,24,40,0.65)',
          borderColor: 'transparent',
          '& .MuiSelect-select': {
            py: 1.25,
            px: 1.5,
          },
        }}
        renderValue={(selected) => {
          const profile = profiles.find((p) => p.id === selected);
          if (!profile) return 'Select profile';
          return (
            <Stack spacing={0.25}>
              <Typography variant="subtitle2" color="text.secondary">
                {profile.label}
              </Typography>
              <Typography variant="body1" component="div" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {profile.headline}
              </Typography>
            </Stack>
          );
        }}
      >
        {profiles.map((profile) => (
          <MenuItem key={profile.id} value={profile.id} divider>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {profile.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                {profile.headline}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, pl: 0.5 }}>
        Switch resume profile
      </Typography>
    </FormControl>
  );
}

export default ProfileDropdown;
