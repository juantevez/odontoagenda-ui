import Tooltip from '@mui/material/Tooltip';

export type ToothState = 'available' | 'occupied' | 'selected';
export type TimeBlock  = 'morning' | 'afternoon' | 'evening';

export const BLOCK_COLORS: Record<TimeBlock, string> = {
  morning:   '#F59E0B', // amber
  afternoon: '#06B6D4', // cyan/teal
  evening:   '#7C3AED', // violet
};

const SIZE = 44; // meets 44×44 tap target requirement

interface ToothIconProps {
  state:     ToothState;
  block:     TimeBlock;
  tooltip?:  string;
  onClick?:  () => void;
}

export default function ToothIcon({ state, block, tooltip, onClick }: ToothIconProps) {
  const color   = BLOCK_COLORS[block];
  const isAvail = state === 'available';
  const isSel   = state === 'selected';
  const isOcc   = state === 'occupied';

  const fill    = isSel ? color : isOcc ? '#CBD5E1' : 'white';
  const stroke  = isOcc ? '#94A3B8' : color;
  const opacity = isOcc ? 0.6 : 1;
  const cursor  = isAvail || isSel ? 'pointer' : 'default';

  const icon = (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 44 44"
      style={{ cursor, opacity, display: 'block', flexShrink: 0 }}
      onClick={isOcc ? undefined : onClick}
    >
      {/* Tooth crown */}
      <path
        d="
          M 10 10
          C  8  8,  6 12,  7 18
          C  8 24, 10 28, 12 30
          C 14 34, 15 38, 17 38
          C 19 38, 20 34, 22 34
          C 24 34, 25 38, 27 38
          C 29 38, 30 34, 32 30
          C 34 28, 36 24, 37 18
          C 38 12, 36  8, 34 10
          C 30  6, 26  8, 22  8
          C 18  8, 14  6, 10 10
          Z
        "
        fill={fill}
        stroke={stroke}
        strokeWidth={isAvail ? 2.5 : isSel ? 3 : 2}
        strokeLinejoin="round"
      />
      {/* Root divider line hint */}
      <line
        x1="22" y1="32" x2="22" y2="38"
        stroke={isOcc ? '#94A3B8' : isSel ? 'rgba(255,255,255,0.4)' : color}
        strokeWidth={1.5}
        strokeDasharray={isOcc ? '0' : '2 2'}
      />
      {/* Checkmark when selected */}
      {isSel && (
        <path
          d="M 15 22 L 20 27 L 29 18"
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );

  if (!tooltip) return icon;
  return (
    <Tooltip title={tooltip} placement="top" arrow enterDelay={300}>
      <span style={{ display: 'inline-flex' }}>{icon}</span>
    </Tooltip>
  );
}
