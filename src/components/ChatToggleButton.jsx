import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Tooltip } from '@mui/material';
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
      <Box ref={triggerRef} sx={{ position: 'relative', display: 'inline-flex' }}>
        {showBubble && <Bubble>Chat with Gemini about Zeke!</Bubble>}
        <IconButton
          aria-label={label}
          color="primary"
          onClick={onClick}
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            animation:
              !isOpen && (!hasAnimated || showBubble) ? `${pulse} 1.4s ease-out 0s 2` : 'none',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
        </IconButton>
      </Box>
    </Tooltip>
  );
}

export default ChatToggleButton;
