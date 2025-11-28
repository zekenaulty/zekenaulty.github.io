import { Box, Chip, Divider, Stack, Typography } from '@mui/material';

function SkillsSection({ skillsPrimary = [], skillsSecondary = [], otherSkills = [] }) {
  return (
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
            <Chip key={skill} label={skill} color="secondary" variant="outlined" size="small" />
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
  );
}

export default SkillsSection;
