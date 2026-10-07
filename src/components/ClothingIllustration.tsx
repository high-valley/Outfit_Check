import { useId } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { TEMPLATES } from '../../assets/templates';
import { hexToHsl, shade } from '../lib/color';
import type { Category, Pattern } from '../types';

const LINE_COLOR = '#374151';
const LINE_WIDTH = 1.8;

export type IllustrationProps = {
  category: Category;
  mainColor: string;
  subColor?: string | null;
  pattern?: Pattern;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  /** 左右ペアの服（靴）を片方だけ描く / 反転する */
  mirror?: boolean;
};

function parseViewBox(vb: string) {
  const [x, y, w, h] = vb.split(' ').map(Number);
  return { x, y, w, h };
}

/** 柄の色：subColor があればそれ、なければ mainColor と区別できる色 */
function patternColor(main: string, sub?: string | null) {
  if (sub) return sub;
  return hexToHsl(main).l > 60 ? shade(main, -0.35) : shade(main, 0.6);
}

function PatternLayer({
  pattern,
  color,
  box,
}: {
  pattern: Pattern;
  color: string;
  box: { x: number; y: number; w: number; h: number };
}) {
  const { x, y, w, h } = box;
  const els: React.ReactNode[] = [];
  if (pattern === 'stripe') {
    for (let px = x - 2; px < x + w + 4; px += 10)
      els.push(<Rect key={px} x={px} y={y} width={3.5} height={h} fill={color} opacity={0.9} />);
  } else if (pattern === 'check') {
    for (let px = x; px < x + w; px += 14)
      els.push(<Rect key={`v${px}`} x={px} y={y} width={4} height={h} fill={color} opacity={0.45} />);
    for (let py = y; py < y + h; py += 14)
      els.push(<Rect key={`h${py}`} x={x} y={py} width={w} height={4} fill={color} opacity={0.45} />);
  } else if (pattern === 'dot') {
    let row = 0;
    for (let py = y + 4; py < y + h; py += 9, row++)
      for (let px = x + (row % 2 ? 4 : 0); px < x + w; px += 9)
        els.push(<Circle key={`${px}-${py}`} cx={px} cy={py} r={2} fill={color} />);
  } else if (pattern === 'floral') {
    let row = 0;
    for (let py = y + 8; py < y + h; py += 18, row++)
      for (let px = x + (row % 2 ? 8 : 0) + 4; px < x + w; px += 18) {
        const petals = [0, 72, 144, 216, 288].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <Circle
              key={deg}
              cx={px + Math.cos(rad) * 3.2}
              cy={py + Math.sin(rad) * 3.2}
              r={2.2}
              fill={color}
              opacity={0.85}
            />
          );
        });
        els.push(
          <G key={`${px}-${py}`}>
            {petals}
            <Circle cx={px} cy={py} r={1.6} fill="#FFFFFF" opacity={0.9} />
          </G>,
        );
      }
  } else if (pattern === 'logo') {
    els.push(
      <G key="logo">
        <Circle cx={x + w * 0.62} cy={y + h * 0.28} r={4.5} fill={color} />
        <Rect x={x + w * 0.62 - 7} y={y + h * 0.28 + 8} width={14} height={2.6} fill={color} />
      </G>,
    );
  }
  return <>{els}</>;
}

export function ClothingIllustration({
  category,
  mainColor,
  subColor,
  pattern = 'plain',
  width = 100,
  height,
  style,
  mirror = false,
}: IllustrationProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const tpl = TEMPLATES[category];
  const box = parseViewBox(tpl.viewBox);
  const h = height ?? (width * box.h) / box.w;
  const clipId = `clip${uid}`;
  const sub = subColor ?? shade(mainColor, hexToHsl(mainColor).l > 50 ? -0.18 : 0.22);
  const shadowColor = '#000000';

  const body = (
    <>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={tpl.main} />
        </ClipPath>
      </Defs>
      <Path d={tpl.main} fill={mainColor} />
      {pattern !== 'plain' && (
        <G clipPath={`url(#${clipId})`}>
          <PatternLayer
            pattern={pattern}
            color={patternColor(mainColor, subColor)}
            box={{ x: box.x - 5, y: box.y - 5, w: box.w + 10, h: box.h + 10 }}
          />
        </G>
      )}
      {tpl.sub && <Path d={tpl.sub} fill={sub} stroke={LINE_COLOR} strokeWidth={LINE_WIDTH * 0.7} strokeLinejoin="round" />}
      {/* 影は1段階のみ：右側を一律に暗くする */}
      <G clipPath={`url(#${clipId})`}>
        <Rect x={box.x + box.w * 0.68} y={box.y - 5} width={box.w} height={box.h + 10} fill={shadowColor} opacity={0.1} />
      </G>
      <Path d={tpl.main} fill="none" stroke={LINE_COLOR} strokeWidth={LINE_WIDTH} strokeLinejoin="round" />
      {tpl.detail && (
        <Path d={tpl.detail} fill="none" stroke={LINE_COLOR} strokeWidth={LINE_WIDTH * 0.6} strokeLinecap="round" opacity={0.7} />
      )}
    </>
  );

  return (
    <Svg width={width} height={h} viewBox={tpl.viewBox} style={style} preserveAspectRatio="xMidYMid meet">
      {mirror ? <G transform={`translate(${box.x * 2 + box.w} 0) scale(-1 1)`}>{body}</G> : body}
    </Svg>
  );
}
