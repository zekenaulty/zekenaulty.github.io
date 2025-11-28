import { Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material';

function HeaderBar({ name, matrixEnabled, onToggleMatrix, rightActions, matrixHelperText }) {
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
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        flexWrap="wrap"
        rowGap={0.5}
      >
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
        {matrixHelperText ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ maxWidth: 320, lineHeight: 1.4 }}
          >
            {matrixHelperText}
          </Typography>
        ) : null}
        {rightActions ? <Box>{rightActions}</Box> : null}
      </Stack>
    </Stack>
  );
}

export default HeaderBar;
