import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Container,
  CssBaseline,
  Divider,
  FormControlLabel,
  Link,
  IconButton,
  Button,
  Stack,
  Switch,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import BackgroundLayer from './components/BackgroundLayer.jsx';
import ProfileDropdown from './components/ProfileDropdown.jsx';
import { useProfileView } from './hooks/useProfileView.js';
import { resumeData } from './data/resume/index.js';
import projects from './data/projects/index.js';

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

const deriveOtherSkills = (allSkills, primary, secondary) => {
  const focus = new Set([...primary, ...secondary]);
  return allSkills
    .map((s) => s.name ?? s)
    .filter(Boolean)
    .filter((name) => !focus.has(name))
    .slice(0, 30);
};

function App() {
  const [selectedProfileId, setSelectedProfileId] = useState(
    resumeData.profiles.defaultProfileId,
  );
  const [matrixEnabled, setMatrixEnabled] = useState(true);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const { headline, about, experiences, skillsPrimary, skillsSecondary, profile, skills } =
    useProfileView(selectedProfileId);

  const otherSkills = deriveOtherSkills(skills, skillsPrimary, skillsSecondary);
  const summaryParagraphs = about?.paragraphs ?? [];
  const previewParagraphs = showFullSummary ? summaryParagraphs : summaryParagraphs.slice(0, 2);
  const hasOverflow = summaryParagraphs.length > previewParagraphs.length;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BackgroundLayer matrixEnabled={matrixEnabled} />
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 0 }}>
        <Stack spacing={4}>
          <Stack spacing={2}>
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

            <ProfileDropdown
              profiles={resumeData.profiles.all}
              value={selectedProfileId}
              onChange={setSelectedProfileId}
            />
          </Stack>

          <Box component="section">
            <Typography variant="overline" color="primary.light">
              Summary - {profile.label}
            </Typography>
            <Typography variant="h5" gutterBottom>
              {headline}
            </Typography>
            <Stack spacing={1.25}>
              {previewParagraphs.map((paragraph, idx) => (
                <Typography key={idx} color="text.secondary">
                  {paragraph}
                </Typography>
              ))}
              <Collapse in={showFullSummary} timeout="auto" unmountOnExit>
                <Stack spacing={1.25}>
                  {summaryParagraphs.slice(previewParagraphs.length).map((paragraph, idx) => (
                    <Typography key={`more-${idx}`} color="text.secondary">
                      {paragraph}
                    </Typography>
                  ))}
                </Stack>
              </Collapse>
              {hasOverflow ? (
                <Box>
                  <Button
                    variant="text"
                    size="small"
                    color="secondary"
                    onClick={() => setShowFullSummary((prev) => !prev)}
                  >
                    {showFullSummary ? 'Show less' : 'Read more'}
                  </Button>
                </Box>
              ) : null}
            </Stack>
          </Box>

          <Box component="section">
            <Typography variant="overline" color="primary.light">
              Experience
            </Typography>
            <Typography variant="h5" gutterBottom>
              Roles aligned to {profile.label}
            </Typography>
            <Stack spacing={2.5}>
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
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                    >
                      <Box>
                        <Typography variant="subtitle1" color="primary.main">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {item.company} - {item.location}
                          {item.remote ? ' - Remote' : ''}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.disabled">
                        {formatDateRange(item.dates)}
                      </Typography>
                    </Stack>
                    <Stack component="ul" spacing={0.75} sx={{ pl: 2, mt: 1.5, mb: 0 }}>
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

          <Box component="section">
            <Typography variant="overline" color="primary.light">
              Skills
            </Typography>
            <Typography variant="h5" gutterBottom>
              Focus areas
            </Typography>
            <Stack spacing={2}>
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
              <Divider flexItem />
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {otherSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="default"
                    variant="outlined"
                    size="small"
                    sx={{ opacity: 0.8 }}
                  />
                ))}
              </Stack>
            </Stack>
          </Box>

          <Box component="section">
            <Typography variant="overline" color="primary.light">
              Projects
            </Typography>
            <Typography variant="h5" gutterBottom>
              Highlights
            </Typography>
            <Stack spacing={2}>
              {projects.map((project) => (
                <Card
                  key={project.id}
                  variant="outlined"
                  sx={{
                    backgroundColor: 'rgba(15,18,35,0.7)',
                    borderColor: 'secondary.dark',
                  }}
                >
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {project.name}
                      </Typography>
                    }
                    subheader={
                      project.repoUrl ? (
                        <Link
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          color="secondary.light"
                          underline="hover"
                          variant="caption"
                        >
                          {project.repoUrl}
                        </Link>
                      ) : null
                    }
                    action={
                      project.repoUrl ? (
                        <IconButton
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                          aria-label={`Open ${project.name} on GitHub`}
                        >
                          <GitHubIcon fontSize="small" />
                        </IconButton>
                      ) : null
                    }
                    subheaderTypographyProps={{ component: 'div' }}
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {project.description}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {project.techTags?.map((tag) => (
                        <Chip key={tag} label={tag} size="small" color="secondary" variant="filled" />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
