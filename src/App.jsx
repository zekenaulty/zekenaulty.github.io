import { useMemo, useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import BackgroundLayer from './components/BackgroundLayer.jsx';
import ProfileDropdown from './components/ProfileDropdown.jsx';
import ResumeDownloadLinks from './components/ResumeDownloadLinks.jsx';
import HeaderBar from './components/HeaderBar.jsx';
import SummarySection from './components/SummarySection.jsx';
import ExperienceSection from './components/ExperienceSection.jsx';
import SkillsSection from './components/SkillsSection.jsx';
import ProjectsSection from './components/ProjectsSection.jsx';
import HomeIntroSection from './components/HomeIntroSection.jsx';
import ChatDrawer from './components/ChatDrawer.jsx';
import ChatToggleButton from './components/ChatToggleButton.jsx';
import { useProfileView } from './hooks/useProfileView.js';
import { resumeData } from './data/resume/index.js';
import projects from './data/projects/index.js';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0b1020',
      paper: '#12192a',
    },
    primary: {
      main: '#6aa0ff',
    },
    secondary: {
      main: '#9aa7ff',
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
  return [startYear, endYear].filter(Boolean).join(' - ');
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { headline, about, experiences, skillsPrimary, skillsSecondary, profile, skills } =
    useProfileView(selectedProfileId);

  const otherSkills = useMemo(
    () => deriveOtherSkills(skills, skillsPrimary, skillsSecondary),
    [skills, skillsPrimary, skillsSecondary],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BackgroundLayer matrixEnabled={matrixEnabled} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <HomeIntroSection />
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1, background: 'transparent' }}>
        <Stack spacing={4}>
          <HeaderBar
            name="Zeke Naulty"
            matrixEnabled={matrixEnabled}
            onToggleMatrix={setMatrixEnabled}
            rightActions={
              <ChatToggleButton
                isOpen={isChatOpen}
                onClick={() => setIsChatOpen((open) => !open)}
              />
            }
          />

          <ProfileDropdown
            profiles={resumeData.profiles.visible ?? resumeData.profiles.all}
            value={selectedProfileId}
            onChange={setSelectedProfileId}
          />

          <ResumeDownloadLinks profileId={profile.id} profileLabel={profile.label} />

          <SummarySection headline={headline} profileLabel={profile.label} paragraphs={about?.paragraphs} />

          <ExperienceSection
            profileLabel={profile.label}
            experiences={experiences}
            formatDateRange={formatDateRange}
          />

          <SkillsSection
            skillsPrimary={skillsPrimary}
            skillsSecondary={skillsSecondary}
            otherSkills={otherSkills}
          />

          <ProjectsSection projects={projects} />
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
