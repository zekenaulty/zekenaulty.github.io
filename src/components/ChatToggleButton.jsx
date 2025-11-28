import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(106,160,255,0.65); }
  70% { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(106,160,255,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(106,160,255,0); }
`;

const Bubble = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  top: '110%',
  transform: 'translateX(-50%)',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  boxShadow: theme.shadows[4],
  fontSize: '0.78rem',
  whiteSpace: 'normal',
  maxWidth: 200,
  zIndex: 10,
  [theme.breakpoints.up('sm')]: {
    right: '110%',
    left: 'auto',
    top: '50%',
    transform: 'translateY(-50%)',
    whiteSpace: 'nowrap',
    maxWidth: 'none',
    fontSize: '0.85rem',
  },
}));

function ChatToggleButton({ isOpen, onClick }) {
  const label = isOpen ? 'Close AI chat' : 'Open AI chat';
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen || hasAnimated) return;

    const node = triggerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated) {
          setShowBubble(true);
          setHasAnimated(true);
          setTimeout(() => setShowBubble(false), 1100);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isOpen, hasAnimated]);

  return (
    <Tooltip title={label}>
      <Box
        ref={triggerRef}
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          backdropFilter: 'blur(6px)',
        }}
      >
        {showBubble && <Bubble>Chat with Gemini about Zeke!</Bubble>}
        <Box
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            backgroundColor: (theme) => theme.palette.primary.main,
            color: '#0a0f1f',
            px: 1,
            py: 0.25,
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: 0.4,
            boxShadow: (theme) => theme.shadows[6],
            textTransform: 'uppercase',
          }}
        >
          AI
        </Box>
        <IconButton
          aria-label={label}
          color="primary"
          onClick={onClick}
          sx={{
            width: { xs: 44, sm: 50 },
            height: { xs: 44, sm: 50 },
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(106,160,255,0.2), rgba(154,167,255,0.25))',
            border: (theme) => `1px solid ${theme.palette.primary.main}`,
            boxShadow: '0 18px 38px rgba(90,150,255,0.38)',
            animation: !isOpen ? `${pulse} 1.9s ease-in-out infinite` : 'none',
            transition: 'transform 150ms ease, box-shadow 150ms ease, background 180ms ease',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(106,160,255,0.3), rgba(154,167,255,0.32))',
              boxShadow: '0 22px 44px rgba(90,150,255,0.45)',
              transform: 'translateY(-2px) scale(1.02)',
            },
            '& svg': {
              fontSize: 24,
            },
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
        </IconButton>
        <Typography
          variant="body2"
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            fontWeight: 700,
            color: 'primary.main',
            textShadow: '0 0 18px rgba(106,160,255,0.45)',
          }}
        >
          Ask AI
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default ChatToggleButton;
