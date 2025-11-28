import { Box, Card, CardContent, CardHeader, Chip, IconButton, Link, Stack, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

function ProjectsSection({ projects = [] }) {
  return (
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
  );
}

export default ProjectsSection;
