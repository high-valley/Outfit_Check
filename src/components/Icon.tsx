import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'hanger' | 'shirt' | 'clock' | 'gear' | 'bell' | 'plus' | 'plusCircle' | 'search' | 'sliders'
  | 'chevronLeft' | 'chevronRight' | 'chevronDown' | 'camera' | 'image' | 'palette' | 'ruler' | 'sun'
  | 'sparkle' | 'bulb' | 'close' | 'check' | 'trash' | 'more' | 'sort' | 'refresh' | 'flask' | 'scissors' | 'swap';

// 24x24 の線アイコン（stroke のみ）
const PATHS: Record<IconName, string[]> = {
  home: ['M3 11.5 12 4l9 7.5', 'M5.5 10v10h13V10', 'M10 20v-6h4v6'],
  hanger: ['M12 9V8a2.2 2.2 0 1 0-2.2-2.2', 'M12 9 3.6 15.6a1.6 1.6 0 0 0 1 2.9h14.8a1.6 1.6 0 0 0 1-2.9z'],
  shirt: ['M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.1a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z'],
  clock: ['M12 7v5l3.2 2'],
  gear: ['M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1'],
  bell: ['M18 8.5a6 6 0 0 0-12 0c0 7-3 8.5-3 8.5h18s-3-1.5-3-8.5', 'M13.7 21a2 2 0 0 1-3.4 0'],
  plus: ['M12 5v14M5 12h14'],
  plusCircle: ['M12 8v8M8 12h8'],
  search: ['M21 21l-4.3-4.3'],
  sliders: ['M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0'],
  chevronLeft: ['M15 5l-7 7 7 7'],
  chevronRight: ['M9 5l7 7-7 7'],
  chevronDown: ['M5 9l7 7 7-7'],
  camera: ['M4 8h3l1.6-2.5h6.8L17 8h3v11H4z'],
  image: ['M21 16l-5-5-9 9'],
  palette: ['M12 3a9 9 0 1 0 0 18c1.6 0 2.2-1.1 1.7-2.2-.5-1 0-2.1 1.3-2.1H17a4 4 0 0 0 4-4c0-5-4-9.7-9-9.7z'],
  ruler: ['M3 8h18v8H3z', 'M7 8v3M11 8v4M15 8v3M19 8v4'],
  sun: ['M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4'],
  sparkle: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z'],
  bulb: ['M9 18h6M10 21h4', 'M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.4 1 2.1h5c0-.7.3-1.5 1-2.1A6 6 0 0 0 12 3z'],
  close: ['M6 6l12 12M18 6L6 18'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  trash: ['M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'],
  more: [],
  sort: ['M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3'],
  refresh: ['M20 11a8 8 0 1 0-2.3 5.7', 'M20 4v7h-7'],
  flask: ['M9 3h6M10 3v6L4.6 19a1.5 1.5 0 0 0 1.3 2.2h12.2a1.5 1.5 0 0 0 1.3-2.2L14 9V3'],
  scissors: ['M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12'],
  swap: ['M4 8h14l-3-3M20 16H6l3 3'],
};

export function Icon({ name, size = 22, color = '#12284C', strokeWidth = 1.8 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const common = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {PATHS[name].map((d, i) => (
        <Path key={i} d={d} {...common} />
      ))}
      {name === 'clock' && <Circle cx={12} cy={12} r={9} {...common} />}
      {name === 'gear' && (
        <>
          <Circle cx={12} cy={12} r={3.2} {...common} />
          <Circle cx={12} cy={12} r={7.4} {...common} />
        </>
      )}
      {name === 'plusCircle' && <Circle cx={12} cy={12} r={9} {...common} />}
      {name === 'search' && <Circle cx={11} cy={11} r={7} {...common} />}
      {name === 'sliders' && (
        <>
          <Circle cx={15} cy={6} r={2} {...common} />
          <Circle cx={9} cy={12} r={2} {...common} />
          <Circle cx={17} cy={18} r={2} {...common} />
        </>
      )}
      {name === 'camera' && <Circle cx={12} cy={13} r={3.5} {...common} />}
      {name === 'image' && (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={2.5} {...common} />
          <Circle cx={9} cy={10} r={1.6} {...common} />
        </>
      )}
      {name === 'palette' && (
        <>
          <Circle cx={7.8} cy={11} r={1} fill={color} />
          <Circle cx={11} cy={7.2} r={1} fill={color} />
          <Circle cx={15.4} cy={8.2} r={1} fill={color} />
        </>
      )}
      {name === 'sun' && <Circle cx={12} cy={12} r={4} {...common} />}
      {name === 'more' && (
        <>
          <Circle cx={5} cy={12} r={1.4} fill={color} />
          <Circle cx={12} cy={12} r={1.4} fill={color} />
          <Circle cx={19} cy={12} r={1.4} fill={color} />
        </>
      )}
    </Svg>
  );
}
