import { useState } from 'react';
import { Box, Button, Collapse, Stack, Typography } from '@mui/material';

function SummarySection({ headline, profileLabel, paragraphs = [] }) {
  const [showFullSummary, setShowFullSummary] = useState(false);
  const previewParagraphs = showFullSummary ? paragraphs : paragraphs.slice(0, 2);
  const hasOverflow = paragraphs.length > previewParagraphs.length;

  return (
    <Box component="section">
      <Typography variant="overline" color="primary.light">
        Summary - {profileLabel}
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
            {paragraphs.slice(previewParagraphs.length).map((paragraph, idx) => (
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
  );
}

export default SummarySection;
