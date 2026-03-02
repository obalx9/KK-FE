import { useState, useRef, useCallback } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GradientStop {
  id: number;
  color: string;
  position: number;
}

interface GradientEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const GRADIENT_DIRECTIONS = [
  { label: '→', angle: 90 },
  { label: '↗', angle: 45 },
  { label: '↑', angle: 0 },
  { label: '↖', angle: 315 },
  { label: '←', angle: 270 },
  { label: '↙', angle: 225 },
  { label: '↓', angle: 180 },
  { label: '↘', angle: 135 },
];

let nextId = 1;

function tokenizeGradientStops(raw: string): string[] {
  const tokens: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) {
      tokens.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function parseCssGradient(css: string): { mode: 'solid' | 'gradient'; angle: number; stops: GradientStop[] } {
  const gradientMatch = css.match(/linear-gradient\(([\s\S]+)\)/);
  if (!gradientMatch) {
    return {
      mode: 'solid',
      angle: 135,
      stops: [
        { id: nextId++, color: css || '#ffffff', position: 0 },
        { id: nextId++, color: '#e0e0e0', position: 100 },
      ]
    };
  }

  const inner = gradientMatch[1].trim();
  const allTokens = tokenizeGradientStops(inner);

  let angle = 135;
  let stopTokens = allTokens;

  const firstToken = allTokens[0].trim();
  const angleMatch = firstToken.match(/^(\d+(?:\.\d+)?)deg$/);
  const dirMatch = firstToken.match(/^to\s+/);
  if (angleMatch) {
    angle = parseFloat(angleMatch[1]);
    stopTokens = allTokens.slice(1);
  } else if (dirMatch) {
    const dirMap: Record<string, number> = {
      'to right': 90, 'to top right': 45, 'to top': 0, 'to top left': 315,
      'to left': 270, 'to bottom left': 225, 'to bottom': 180, 'to bottom right': 135,
    };
    angle = dirMap[firstToken] ?? 135;
    stopTokens = allTokens.slice(1);
  }

  const stops: GradientStop[] = stopTokens.map((token, idx) => {
    const posMatch = token.match(/(\d+(?:\.\d+)?)%\s*$/);
    const position = posMatch ? parseFloat(posMatch[1]) : (idx / Math.max(stopTokens.length - 1, 1)) * 100;
    const color = posMatch ? token.slice(0, token.lastIndexOf(posMatch[0])).trim() : token;
    return { id: nextId++, color: color || '#ffffff', position };
  });

  if (stops.length < 2) {
    stops.push({ id: nextId++, color: '#e0e0e0', position: 100 });
  }

  return { mode: 'gradient', angle, stops };
}

function buildCssGradient(angle: number, stops: GradientStop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopStr = sorted.map(s => `${s.color} ${s.position}%`).join(', ');
  return `linear-gradient(${angle}deg, ${stopStr})`;
}

function isHexColor(color: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color);
}

function colorToHex(color: string): string {
  if (isHexColor(color)) return color;
  return '#888888';
}

export default function GradientEditor({ label, value, onChange }: GradientEditorProps) {
  const { language } = useLanguage();
  const isGradient = value.includes('gradient');

  const parsed = parseCssGradient(value);

  const [mode, setMode] = useState<'solid' | 'gradient'>(isGradient ? 'gradient' : 'solid');
  const [angle, setAngle] = useState(parsed.angle);
  const [stops, setStops] = useState<GradientStop[]>(parsed.stops);
  const [solidColor, setSolidColor] = useState(isGradient ? '#ffffff' : (value || '#ffffff'));
  const [selectedStopId, setSelectedStopId] = useState<number | null>(stops[0]?.id ?? null);

  const barRef = useRef<HTMLDivElement>(null);
  const draggingId = useRef<number | null>(null);

  const emit = useCallback((newMode: 'solid' | 'gradient', newAngle: number, newStops: GradientStop[], newSolid: string) => {
    if (newMode === 'solid') {
      onChange(newSolid);
    } else {
      onChange(buildCssGradient(newAngle, newStops));
    }
  }, [onChange]);

  const handleModeChange = (m: 'solid' | 'gradient') => {
    setMode(m);
    emit(m, angle, stops, solidColor);
  };

  const handleSolidChange = (color: string) => {
    setSolidColor(color);
    emit('solid', angle, stops, color);
  };

  const handleAngleChange = (a: number) => {
    setAngle(a);
    emit('gradient', a, stops, solidColor);
  };

  const handleStopColorChange = (id: number, color: string) => {
    const newStops = stops.map(s => s.id === id ? { ...s, color } : s);
    setStops(newStops);
    emit('gradient', angle, newStops, solidColor);
  };

  const handleStopPositionChange = (id: number, position: number) => {
    const clamped = Math.max(0, Math.min(100, position));
    const newStops = stops.map(s => s.id === id ? { ...s, position: clamped } : s);
    setStops(newStops);
    emit('gradient', angle, newStops, solidColor);
  };

  const addStop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.round((x / rect.width) * 100);
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    let leftStop = sorted[0];
    let rightStop = sorted[sorted.length - 1];
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].position <= position && sorted[i + 1].position >= position) {
        leftStop = sorted[i];
        rightStop = sorted[i + 1];
        break;
      }
    }
    const t = rightStop.position === leftStop.position ? 0.5 :
      (position - leftStop.position) / (rightStop.position - leftStop.position);
    const mixHex = (a: string, b: string, ratio: number): string => {
      const ah = isHexColor(a) ? a : '#888888';
      const bh = isHexColor(b) ? b : '#888888';
      const ar = parseInt(ah.slice(1, 3), 16);
      const ag = parseInt(ah.slice(3, 5), 16);
      const ab = parseInt(ah.slice(5, 7), 16);
      const br = parseInt(bh.slice(1, 3), 16);
      const bg = parseInt(bh.slice(3, 5), 16);
      const bb = parseInt(bh.slice(5, 7), 16);
      const r = Math.round(ar + (br - ar) * ratio);
      const g = Math.round(ag + (bg - ag) * ratio);
      const bv = Math.round(ab + (bb - ab) * ratio);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bv.toString(16).padStart(2, '0')}`;
    };
    const newStop: GradientStop = {
      id: nextId++,
      color: mixHex(leftStop.color, rightStop.color, t),
      position,
    };
    const newStops = [...stops, newStop];
    setStops(newStops);
    setSelectedStopId(newStop.id);
    emit('gradient', angle, newStops, solidColor);
  };

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    const newStops = stops.filter(s => s.id !== id);
    setStops(newStops);
    if (selectedStopId === id) setSelectedStopId(newStops[0]?.id ?? null);
    emit('gradient', angle, newStops, solidColor);
  };

  const handleBarMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: number) => {
    e.stopPropagation();
    draggingId.current = id;
    setSelectedStopId(id);

    const onMove = (me: MouseEvent) => {
      if (!barRef.current || draggingId.current === null) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = me.clientX - rect.left;
      const position = Math.round((x / rect.width) * 100);
      handleStopPositionChange(draggingId.current, position);
    };
    const onUp = () => {
      draggingId.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const selectedStop = stops.find(s => s.id === selectedStopId) ?? null;
  const gradientPreview = buildCssGradient(90, [...stops].sort((a, b) => a.position - b.position));
  const fullPreview = mode === 'solid'
    ? { background: solidColor }
    : { background: buildCssGradient(angle, stops) };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <button
          onClick={() => {
            const defaultStops = [
              { id: nextId++, color: '#ffffff', position: 0 },
              { id: nextId++, color: '#e0e0e0', position: 100 },
            ];
            setStops(defaultStops);
            setAngle(135);
            setMode('gradient');
            setSelectedStopId(defaultStops[0].id);
            emit('gradient', 135, defaultStops, solidColor);
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title={language === 'ru' ? 'Сбросить' : 'Reset'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <button
          onClick={() => handleModeChange('solid')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === 'solid'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {language === 'ru' ? 'Цвет' : 'Solid'}
        </button>
        <button
          onClick={() => handleModeChange('gradient')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === 'gradient'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {language === 'ru' ? 'Градиент' : 'Gradient'}
        </button>
      </div>

      <div
        className="h-12 w-full rounded-lg border border-gray-200 dark:border-gray-600"
        style={fullPreview}
      />

      {mode === 'solid' && (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={isHexColor(solidColor) ? solidColor : '#ffffff'}
            onChange={(e) => handleSolidChange(e.target.value)}
            className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer flex-shrink-0"
          />
          <input
            type="text"
            value={solidColor}
            onChange={(e) => handleSolidChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm"
            placeholder="#ffffff"
          />
        </div>
      )}

      {mode === 'gradient' && (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              {language === 'ru' ? 'Направление' : 'Direction'}
            </p>
            <div className="grid grid-cols-8 gap-1">
              {GRADIENT_DIRECTIONS.map((dir) => (
                <button
                  key={dir.angle}
                  onClick={() => handleAngleChange(dir.angle)}
                  className={`h-8 text-sm rounded transition-colors ${
                    angle === dir.angle
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ru' ? 'Цвета градиента' : 'Gradient stops'}
              </p>
              {stops.length < 6 && (
                <button
                  onClick={() => {
                    const sorted = [...stops].sort((a, b) => a.position - b.position);
                    const mid = sorted[Math.floor(sorted.length / 2)];
                    const newStop: GradientStop = { id: nextId++, color: '#aaaaaa', position: mid.position };
                    const newStops = [...stops, newStop];
                    setStops(newStops);
                    setSelectedStopId(newStop.id);
                    emit('gradient', angle, newStops, solidColor);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {language === 'ru' ? 'Добавить' : 'Add'}
                </button>
              )}
            </div>

            <div className="relative mb-3" style={{ paddingTop: '36px', paddingBottom: '12px' }}>
              <div
                ref={barRef}
                className="h-8 w-full rounded-lg cursor-crosshair relative"
                style={{ background: gradientPreview }}
                onClick={addStop}
              >
                {[...stops].sort((a, b) => a.position - b.position).map((stop) => (
                  <div
                    key={stop.id}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
                    style={{ left: `${stop.position}%` }}
                    onMouseDown={(e) => handleBarMouseDown(e, stop.id)}
                    onClick={(e) => { e.stopPropagation(); setSelectedStopId(stop.id); }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 shadow-md transition-transform ${
                        selectedStopId === stop.id
                          ? 'border-white scale-125 ring-2 ring-blue-500'
                          : 'border-white hover:scale-110'
                      }`}
                      style={{ background: stop.color }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {selectedStop && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {language === 'ru' ? 'Выбранный цвет' : 'Selected stop'}
                  </p>
                  <button
                    onClick={() => removeStop(selectedStop.id)}
                    disabled={stops.length <= 2}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorToHex(selectedStop.color)}
                    onChange={(e) => handleStopColorChange(selectedStop.id, e.target.value)}
                    className="w-9 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={selectedStop.color}
                    onChange={(e) => handleStopColorChange(selectedStop.id, e.target.value)}
                    className="w-28 px-2 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded font-mono text-xs"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedStop.position}
                      onChange={(e) => handleStopPositionChange(selectedStop.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right flex-shrink-0">
                      {selectedStop.position}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {language === 'ru' ? 'Нажмите на полосу чтобы добавить цвет, перетащите маркер для перемещения' : 'Click bar to add stop, drag marker to move'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
