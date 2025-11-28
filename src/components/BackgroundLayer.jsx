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
    'repeating-linear-gradient(90deg, rgba(110,180,255,0.16) 0, rgba(110,180,255,0.16) 1px, transparent 1px, transparent 80px), linear-gradient(180deg, rgba(120,170,255,0.14), rgba(8,12,26,0.45))',
  backgroundSize: '120px 100%, 100% 100%',
  mixBlendMode: 'screen',
  opacity: 0.32,
  animation: `${matrixShift} 18s linear infinite`,
  filter: `drop-shadow(0 0 8px ${theme.palette.primary.main})`,
}));

const ColorWash = styled(Box)({
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 15% 20%, rgba(110,170,255,0.18), transparent 32%), radial-gradient(circle at 80% 10%, rgba(120,180,255,0.2), transparent 36%), radial-gradient(circle at 65% 75%, rgba(80,130,200,0.18), transparent 38%), linear-gradient(145deg, rgba(8,12,24,0.9) 0%, rgba(6,10,20,0.92) 35%, rgba(4,8,16,0.96) 100%)',
  mixBlendMode: 'screen',
  opacity: 0.85,
  filter: 'saturate(1.05)',
});

const buildAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
};

const defaultBackground = buildAssetUrl('assets/backgrounds/new-bg-0028.png');

function BackgroundLayer({
  image = defaultBackground,
  matrixEnabled = false,
}) {
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: -2, overflow: 'hidden' }}>
      <ColorWash />
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
          filter: 'brightness(0.35) contrast(1.05)',
          mixBlendMode: 'soft-light',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(2px) saturate(1.08)',
          background: 'linear-gradient(180deg, rgba(5,10,20,0.35), rgba(5,10,20,0.65))',
        }}
      />
      {matrixEnabled ? <MatrixOverlay /> : null}
    </Box>
  );
}

export default BackgroundLayer;
