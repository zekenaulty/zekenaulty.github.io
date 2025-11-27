import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import BackgroundLayer from './components/BackgroundLayer.jsx';
import ProfileSelector from './components/ProfileSelector.jsx';
import { useProfileView } from './hooks/useProfileView.js';
import { resumeData } from './data/resume/index.js';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0d0f1a',
      paper: '#121528',
    },
    primary: {
      main: '#6cf0c2',
    },
    secondary: {
      main: '#7cc2ff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h3: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 500 },
  },
});

const formatDateRange = (dates) => {
  if (!dates) return '';
  const startYear = dates.start?.slice(0, 4);
  const endYear = dates.end?.slice(0, 4);
  return [startYear, endYear].filter(Boolean).join(' — ');
};

function App() {
  const [selectedProfileId, setSelectedProfileId] = useState(
    resumeData.profiles.defaultProfileId,
  );
  const [matrixEnabled, setMatrixEnabled] = useState(true);

  const { headline, about, experiences, skillsPrimary, skillsSecondary, profile } = useProfileView(
    selectedProfileId,
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BackgroundLayer matrixEnabled={matrixEnabled} />
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 0 }}>
        <Stack spacing={4}>
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
                Zeke Nauty
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary">
                {headline}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={matrixEnabled}
                  onChange={(event) => setMatrixEnabled(event.target.checked)}
                  color="primary"
                />
              }
              label="Matrix overlay"
            />
          </Stack>

          <ProfileSelector
            profiles={resumeData.profiles.all}
            value={selectedProfileId}
            onChange={setSelectedProfileId}
          />

          <Box>
            <Typography variant="h5" gutterBottom>
              About: {profile.label}
            </Typography>
            <Stack spacing={1.5}>
              {about?.paragraphs?.map((paragraph, idx) => (
                <Typography key={idx} color="text.secondary">
                  {paragraph}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              Experience
            </Typography>
            <Stack spacing={2}>
              {experiences.map((item) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{
                    backgroundColor: 'rgba(15,18,35,0.7)',
                    borderColor: 'primary.dark',
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" color="primary.main">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {item.company} · {item.location}
                      {item.remote ? ' · Remote' : ''}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDateRange(item.dates)}
                    </Typography>
                    <Stack component="ul" spacing={0.5} sx={{ pl: 2, mt: 1.5, mb: 0 }}>
                      {item.description?.map((line, idx) => (
                        <Typography key={idx} component="li" variant="body2" color="text.primary">
                          {line}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              Skills Focus
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {skillsPrimary.map((skill) => (
                  <Chip key={skill} label={skill} color="primary" variant="filled" size="small" />
                ))}
              </Stack>
              <Divider flexItem />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {skillsSecondary.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
