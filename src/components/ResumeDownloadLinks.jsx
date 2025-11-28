import { Box, Button, ButtonGroup, Stack, Typography } from '@mui/material';

function ResumeDownloadLinks({ profileId, profileLabel }) {
  if (!profileId) return null;

  const slug = profileId;
  const baseUrl = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const basePath = `${normalizedBase}/resume/${slug}`;
  const htmlUrl = `${basePath}/index.html`;
  const pdfUrl = `${basePath}/resume-${slug}.pdf`;
  const docxUrl = `${basePath}/resume-${slug}.docx`;
  const txtUrl = `${basePath}/resume-${slug}.txt`;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mt: 1 }}
      >
        <Typography variant="caption" color="text.secondary">
          Downloads for profile: {profileLabel ?? slug}
        </Typography>

        <ButtonGroup size="small" variant="outlined">
          <Button component="a" href={htmlUrl} target="_blank" rel="noopener noreferrer">
            HTML
          </Button>
          <Button
            component="a"
            href={pdfUrl}
            download={`resume-${slug}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            PDF
          </Button>
          <Button
            component="a"
            href={docxUrl}
            download={`resume-${slug}.docx`}
            target="_blank"
            rel="noopener noreferrer"
          >
            DOCX
          </Button>
          <Button
            component="a"
            href={txtUrl}
            download={`resume-${slug}.txt`}
            target="_blank"
            rel="noopener noreferrer"
          >
            TXT
          </Button>
        </ButtonGroup>
      </Stack>
    </Box>
  );
}

export default ResumeDownloadLinks;
