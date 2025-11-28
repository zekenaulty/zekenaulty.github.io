import { Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material';

function HeaderBar({ name, matrixEnabled, onToggleMatrix }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={2}
    >
      <Box>
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: 1 }}>
          Resume Profiles
        </Typography>
        <Typography variant="h3" component="h1">
          {name}
        </Typography>
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={matrixEnabled}
            onChange={(event) => onToggleMatrix?.(event.target.checked)}
            color="primary"
          />
        }
        label="Matrix overlay"
      />
    </Stack>
  );
}

export default HeaderBar;
