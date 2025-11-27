import { Box } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';

const matrixShift = keyframes`
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 0 800px, 0 0; }
`;

const MatrixOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(108,240,194,0.14) 0, rgba(108,240,194,0.14) 1px, transparent 1px, transparent 80px), linear-gradient(180deg, rgba(124,194,255,0.12), rgba(12,16,32,0.4))',
  backgroundSize: '120px 100%, 100% 100%',
  mixBlendMode: 'screen',
  opacity: 0.35,
  animation: `${matrixShift} 18s linear infinite`,
  filter: `drop-shadow(0 0 8px ${theme.palette.primary.main})`,
}));

function BackgroundLayer({
  image = '/assets/backgrounds/new-bg-0012-wide.png',
  matrixEnabled = false,
}) {
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: -2, overflow: 'hidden' }}>
      <Box
        component="img"
        src={image}
        alt=""
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.35)',
        }}
      />
      <Box sx={{ position: 'absolute', inset: 0, backdropFilter: 'blur(2px) saturate(1.05)' }} />
      {matrixEnabled ? <MatrixOverlay /> : null}
    </Box>
  );
}

export default BackgroundLayer;
