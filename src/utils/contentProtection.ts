export function disableContextMenu(): () => void {
  const handleContextMenu = (e: Event) => {
    e.preventDefault();
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('touchstart', handleTouchStart, { passive: false });

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('touchstart', handleTouchStart);
  };
}

export function disableDragAndDrop(): () => void {
  const handleDragStart = (e: Event) => {
    e.preventDefault();
  };

  document.addEventListener('dragstart', handleDragStart);

  return () => {
    document.removeEventListener('dragstart', handleDragStart);
  };
}

export function disableKeyboardShortcuts(): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
      e.key === 'PrintScreen' ||
      e.key === 'F12'
    ) {
      e.preventDefault();
      return false;
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

export function detectDevTools(): boolean {
  const threshold = 160;
  return (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  );
}

export function startDevToolsDetection(callback: () => void) {
  const interval = setInterval(() => {
    if (detectDevTools()) {
      callback();
    }
  }, 1000);

  return () => clearInterval(interval);
}

export function detectScreenRecording(callback: () => void): () => void {
  if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);

    navigator.mediaDevices.getDisplayMedia = function(...args) {
      callback();
      return originalGetDisplayMedia(...args);
    };

    return () => {
      navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
    };
  }

  return () => {};
}

export function applyBasicProtection(): () => void {
  const cleanupContextMenu = disableContextMenu();
  const cleanupDragAndDrop = disableDragAndDrop();
  const cleanupKeyboardShortcuts = disableKeyboardShortcuts();

  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';

  return () => {
    cleanupContextMenu();
    cleanupDragAndDrop();
    cleanupKeyboardShortcuts();
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  };
}

export interface WatermarkConfig {
  text: string;
  opacity?: number;
  fontSize?: number;
  color?: string;
  container?: HTMLElement;
}

const WATERMARK_STYLE = `
  .wm-label {
    position: absolute;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    font-family: Arial, sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.4px;
    color: white;
    text-shadow:
      0 0 4px rgba(0,0,0,0.85),
      0 0 8px rgba(0,0,0,0.7),
      1px 1px 0 rgba(0,0,0,0.8),
      -1px -1px 0 rgba(0,0,0,0.8),
      1px -1px 0 rgba(0,0,0,0.8),
      -1px 1px 0 rgba(0,0,0,0.8);
    mix-blend-mode: difference;
    z-index: 9998;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .wm-label.wm-visible {
    opacity: 0.18;
  }
  .wm-wrapper {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 9998;
  }
`;

function injectWatermarkStyles(): void {
  if (document.getElementById('wm-styles')) return;
  const style = document.createElement('style');
  style.id = 'wm-styles';
  style.textContent = WATERMARK_STYLE;
  document.head.appendChild(style);
}

function randomPosition(): { left: string; top: string } {
  const left = 5 + Math.random() * 60;
  const top = 5 + Math.random() * 75;
  return { left: `${left}%`, top: `${top}%` };
}

export function startDynamicWatermark(config: WatermarkConfig): () => void {
  injectWatermarkStyles();

  const scrollContainer = config.container || document.body;
  const container = scrollContainer.parentElement || scrollContainer;

  const wrapper = document.createElement('div');
  wrapper.className = 'wm-wrapper';
  container.appendChild(wrapper);

  const CYCLE_MS = 15000;
  const FADE_MS = 500;

  let stopped = false;
  let cycleTimer: ReturnType<typeof setTimeout> | null = null;

  let labelA: HTMLSpanElement | null = null;
  let labelB: HTMLSpanElement | null = null;
  let activeIsA = true;

  function createLabel(): HTMLSpanElement {
    const el = document.createElement('span');
    el.className = 'wm-label';
    el.textContent = config.text;
    const pos = randomPosition();
    el.style.left = pos.left;
    el.style.top = pos.top;
    wrapper.appendChild(el);
    return el;
  }

  function showNext() {
    if (stopped) return;

    const incoming = createLabel();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        incoming.classList.add('wm-visible');
      });
    });

    const outgoing = activeIsA ? labelA : labelB;

    if (outgoing) {
      outgoing.classList.remove('wm-visible');
      setTimeout(() => {
        if (outgoing.parentNode) outgoing.remove();
      }, FADE_MS + 50);
    }

    if (activeIsA) {
      labelB = incoming;
    } else {
      labelA = incoming;
    }
    activeIsA = !activeIsA;

    cycleTimer = setTimeout(showNext, CYCLE_MS);
  }

  showNext();

  return () => {
    stopped = true;
    if (cycleTimer) clearTimeout(cycleTimer);
    wrapper.remove();
  };
}

export function createVideoWatermark(
  videoElement: HTMLVideoElement,
  config: WatermarkConfig
): () => void {
  const container = videoElement.parentElement;
  if (!container) return () => {};

  injectWatermarkStyles();
  container.style.position = 'relative';
  container.style.overflow = 'hidden';

  const label = document.createElement('span');
  label.className = 'wm-float';
  label.textContent = config.text;
  label.style.position = 'absolute';
  label.style.top = '50%';
  label.style.left = '50%';
  label.style.transform = 'translate(-50%, -50%) rotate(-20deg)';
  label.style.fontSize = '14px';
  label.style.fontWeight = '600';
  label.style.fontFamily = 'Arial, sans-serif';
  label.style.whiteSpace = 'nowrap';
  label.style.opacity = '0.22';
  label.style.color = 'white';
  label.style.textShadow = '0 0 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7), 1px 1px 0 rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8)';
  label.style.mixBlendMode = 'difference';
  label.style.pointerEvents = 'none';
  label.style.zIndex = '10';
  label.style.userSelect = 'none';

  container.appendChild(label);

  return () => {
    label.remove();
  };
}
