import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

function ExperienceSection({ profileLabel, experiences, formatDateRange }) {
  return (
    <Box component="section">
      <Typography variant="overline" color="primary.light">
        Experience
      </Typography>
      <Typography variant="h5" gutterBottom>
        Roles aligned to {profileLabel}
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
              {item.summary ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.summary}
                </Typography>
              ) : null}
              <Stack component="ul" spacing={0.75} sx={{ pl: 2, mt: 1.5, mb: 0 }}>
                {item.description?.map((line, idx) => (
                  <Typography key={idx} component="li" variant="body2" color="text.primary">
                    {line}
                  </Typography>
                ))}
              </Stack>
              {item.skillsUsed?.length ? (
                <Stack
                  direction="row"
                  spacing={0.75}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 1.5 }}
                >
                  {item.skillsUsed.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      color="default"
                      variant="outlined"
                      sx={{ opacity: 0.9 }}
                    />
                  ))}
                </Stack>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

export default ExperienceSection;
