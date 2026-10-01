import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Check, CloudRain, Flame, Leaf, Moon, Plus, Sun,
  Trash2, Volume2, VolumeX, Waves, Wind, Sparkles, Bird, Building2,
  Play, Pause, Droplets,
} from 'lucide-react';

type Category = 'Salud' | 'Estudio' | 'Trabajo' | 'Creatividad';
type Theme = 'Naturaleza' | 'Galaxia' | 'Cyberpunk';
type Weather = 'Sol' | 'Lluvia' | 'Noche';
type Ambience = 'Lluvia' | 'Bosque' | 'Fuego';
type HabitatKind = 'tree' | 'flower' | 'bush' | 'mushroom' | 'bird' | 'firefly';
type Task = { id: string; title: string; category: Category; xp: number; createdAt: string; completedAt: string | null; completedDate: string | null };
type HabitatElement = { id: string; taskId: string; taskTitle: string; kind: HabitatKind; createdAt: string };
type AppState = { tasks: Task[]; habitatElements: HabitatElement[]; xp: number; streak: number; lastActiveDate: string | null; activityDates: string[]; purchasedRewardIds: string[]; theme: Theme; weather: Weather; ambience: Ambience; volume: number };
type Reward = { id: string; name: string; description: string; cost: number; habitatEffect: string; icon: 'bird' | 'building' | 'sparkles' };

const STORE_KEY = 'ecoworld-state-v1';
const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const offsetDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const seedTasks = (): Task[] => [
  { id: 'demo-water', title: 'Tomar un vaso de agua al despertar', category: 'Salud', xp: 20, createdAt: todayKey(), completedAt: null, completedDate: null },
  { id: 'demo-read', title: 'Leer unas páginas sin prisa', category: 'Estudio', xp: 25, createdAt: todayKey(), completedAt: null, completedDate: null },
  { id: 'demo-sketch', title: 'Dibujar una idea nueva', category: 'Creatividad', xp: 30, createdAt: todayKey(), completedAt: null, completedDate: null },
];
const initialState: AppState = { tasks: seedTasks(), habitatElements: [], xp: 180, streak: 3, lastActiveDate: offsetDate(-1), activityDates: [offsetDate(-3), offsetDate(-2), offsetDate(-1)], purchasedRewardIds: [], theme: 'Naturaleza', weather: 'Sol', ambience: 'Bosque', volume: 34 };
const rewards: Reward[] = [
  { id: 'bird', name: 'Ave tropical', description: 'Una visitante de plumaje brillante.', cost: 120, habitatEffect: 'Un ave nueva encuentra su hogar.', icon: 'bird' },
  { id: 'cabin', name: 'Refugio del bosque', description: 'Un rincón pequeño para descansar.', cost: 180, habitatEffect: 'Aparece un refugio entre los árboles.', icon: 'building' },
  { id: 'aurora', name: 'Luz de luciérnagas', description: 'Pequeños destellos al caer la tarde.', cost: 240, habitatEffect: 'Tu mundo brilla con luciérnagas.', icon: 'sparkles' },
];
const categories: Category[] = ['Salud', 'Estudio', 'Trabajo', 'Creatividad'];
const categoryColors: Record<Category, string> = { Salud: '#d6f0a8', Estudio: '#e8d9ff', Trabajo: '#c8eaff', Creatividad: '#ffd8ea' };
const habitatKinds: HabitatKind[] = ['tree', 'flower', 'bush', 'mushroom', 'bird', 'firefly'];
const habitatKindNames: Record<HabitatKind, string> = { tree: 'un árbol', flower: 'una flor', bush: 'un arbusto', mushroom: 'un hongo', bird: 'un ave', firefly: 'luciérnagas' };
const createHabitatElement = (task: Task, index: number): HabitatElement => ({
  id: `habitat-${task.id}`,
  taskId: task.id,
  taskTitle: task.title,
  kind: habitatKinds[index % habitatKinds.length],
  createdAt: new Date().toISOString(),
});

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AppState>;
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : seedTasks();
      const habitatElements = Array.isArray(parsed.habitatElements)
        ? parsed.habitatElements
        : tasks
            .filter(task => Boolean(task.completedAt))
            .sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt)))
            .map((task, index) => createHabitatElement(task, index));
      return { ...initialState, ...parsed, tasks, habitatElements, activityDates: Array.isArray(parsed.activityDates) ? parsed.activityDates : [], purchasedRewardIds: Array.isArray(parsed.purchasedRewardIds) ? parsed.purchasedRewardIds : [] };
    }
  } catch { /* A damaged local save returns to a fresh habitat. */ }
  return initialState;
}

function Habitat({ state }: { state: AppState }) {
  const positions = [[210, 245], [255, 244], [300, 245], [345, 244], [390, 245], [435, 244], [480, 245], [230, 218], [275, 216], [320, 217], [365, 216], [410, 218], [455, 216], [490, 219]];
  const elements = state.habitatElements.map((element, index) => {
    const row = Math.floor(index / positions.length);
    const [baseX, baseY] = positions[index % positions.length];
    const x = baseX + (row % 2 ? 8 : 0);
    const groundY = baseY - row * 8;
    const scale = Math.max(.58, .88 - row * .08);
    const transform = `translate(${x} ${groundY}) scale(${scale})`;

    if (element.kind === 'tree') {
      const leaves = ['#56b978', '#78c94b', '#38a78a', '#9bd843'];
      return <g key={element.id} className="habitat-new-element" transform={transform}><title>{`Árbol creado al completar: ${element.taskTitle}`}</title>
        <path d="M0 0v-28" stroke="#875b3d" strokeWidth="6" strokeLinecap="round" />
        <circle cx="-9" cy="-31" r="13" fill={leaves[index % leaves.length]} />
        <circle cx="7" cy="-36" r="15" fill={leaves[(index + 1) % leaves.length]} />
        <circle cx="12" cy="-24" r="11" fill={leaves[(index + 2) % leaves.length]} />
      </g>;
    }
    if (element.kind === 'flower') {
      const petal = ['#ff6b9d', '#ffbd3f', '#a477ed', '#fa795e'][index % 4];
      return <g key={element.id} className="habitat-new-element" transform={transform}><title>{`Flor creada al completar: ${element.taskTitle}`}</title>
        <path d="M0 0v-16" stroke="#3e9655" strokeWidth="2.5" /><circle cy="-20" r="4" fill="#ffd64d" />
        <circle cy="-26" r="4" fill={petal} /><circle cx="6" cy="-20" r="4" fill={petal} /><circle cy="-14" r="4" fill={petal} /><circle cx="-6" cy="-20" r="4" fill={petal} />
      </g>;
    }
    if (element.kind === 'bush') {
      return <g key={element.id} className="habitat-new-element" transform={transform}><title>{`Arbusto creado al completar: ${element.taskTitle}`}</title>
        <circle cx="-9" cy="-10" r="11" fill="#36ae68" /><circle cx="4" cy="-15" r="13" fill="#75c947" /><circle cx="13" cy="-8" r="10" fill="#199d7b" />
        <circle cx="-5" cy="-10" r="2.5" fill="#ffda58" /><circle cx="9" cy="-7" r="2.5" fill="#ff759d" />
      </g>;
    }
    if (element.kind === 'mushroom') {
      return <g key={element.id} className="habitat-new-element" transform={transform}><title>{`Hongo creado al completar: ${element.taskTitle}`}</title>
        <path d="M-3 0v-12q3-5 6 0V0Z" fill="#fff3d6" /><path d="M-13-12q1-15 13-15t13 15Z" fill="#f26d5b" />
        <circle cx="-5" cy="-20" r="2" fill="#fff5df" /><circle cx="5" cy="-17" r="2" fill="#fff5df" />
      </g>;
    }
    if (element.kind === 'bird') {
      return <g key={element.id} className="habitat-new-element" transform={`translate(${x} ${groundY - 32}) scale(${scale})`}><title>{`Ave atraída al completar: ${element.taskTitle}`}</title>
        <path d="M-13 0q10-14 23-2-11-1-16 9Z" fill="#ee6b45" /><path d="m7-2 10 1-9 5Z" fill="#f3ad36" /><circle cx="5" cy="-5" r="1.4" fill="#334b48" />
      </g>;
    }
    return <g key={element.id} className="habitat-new-element" transform={`translate(${x} ${groundY - 30})`}><title>{`Luciérnagas atraídas al completar: ${element.taskTitle}`}</title>
      <circle cx="-6" cy="-2" r="4" fill="#ffe45c"><animate attributeName="opacity" values=".35;1;.35" dur="1.5s" repeatCount="indefinite" /></circle>
      <circle cx="5" cy="-7" r="3.5" fill="#fff18a"><animate attributeName="opacity" values="1;.3;1" dur="1.9s" repeatCount="indefinite" /></circle>
      <circle cx="11" cy="3" r="3" fill="#ffd965"><animate attributeName="opacity" values=".3;1;.3" dur="1.7s" repeatCount="indefinite" /></circle>
    </g>;
  });
  return <svg className="habitat-svg" viewBox="0 0 700 340" role="img" aria-label={`Tu hábitat tiene ${state.habitatElements.length} elementos creados al completar tareas`}>
    <defs>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop stopColor={state.theme === 'Galaxia' ? '#aeb9cf' : state.theme === 'Cyberpunk' ? '#d6bdd0' : '#dcebd9'} /><stop offset="1" stopColor={state.theme === 'Galaxia' ? '#d5d4df' : state.theme === 'Cyberpunk' ? '#efd8c9' : '#f3edcf'} /></linearGradient>
      <linearGradient id="water" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#91c5bd" /><stop offset="1" stopColor="#68a49b" /></linearGradient>
      <clipPath id="worldClip"><circle cx="350" cy="176" r="153" /></clipPath>
    </defs>
    <circle cx="350" cy="182" r="160" fill="#a8bc86" opacity=".28" />
    <circle cx="350" cy="176" r="153" fill="url(#sky)" stroke="#fff9e8" strokeWidth="7" />
    <g clipPath="url(#worldClip)">
      <circle className="sun-disc" cx="480" cy="75" r="28" fill="#f6d584" />
      <circle className="weather-night" cx="458" cy="77" r="22" fill="#fff1b7" />
      <path d="M180 193 Q247 108 322 188 Q407 93 513 186 L518 246 180 246Z" fill="#b5c596" />
      <path d="M172 220 Q260 155 339 207 Q430 143 530 211 L523 258 174 258Z" fill="#8eaf75" />
      <path d="M165 239 Q235 210 299 227 Q366 205 425 229 Q486 210 538 237 L534 276 163 276Z" fill="#719861" />
      <path d="M271 211 C286 219 290 238 313 243 C335 248 351 232 366 240 C385 250 374 270 350 276 L270 276Z" fill="url(#water)" />
      <path d="M300 232 Q321 239 342 233" fill="none" stroke="#c4e2ce" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      {elements}
      {state.purchasedRewardIds.includes('cabin') && <g transform="translate(410 198)"><path d="M0 14 24 -4 49 14v31H0Z" fill="#c89565" /><path d="M-4 15 24 -9 54 15" fill="none" stroke="#805c43" strokeWidth="7" strokeLinejoin="round" /><rect x="19" y="26" width="12" height="19" rx="5" fill="#715743" /><rect x="5" y="20" width="9" height="8" fill="#d7e4ad" /></g>}
      {state.purchasedRewardIds.includes('bird') && <g transform="translate(450 140)" fill="#e47757"><path d="M0 0c8-11 19-8 23 0-8 1-12 4-15 10Z" /><path d="m19 0 10 2-9 4Z" /><circle cx="17" cy="-2" r="1.4" fill="#394b3e" /></g>}
      {state.purchasedRewardIds.includes('aurora') && Array.from({ length: 7 }, (_, i) => <circle key={`glow-${i}`} cx={205 + i * 47} cy={218 + (i % 3) * 14} r="2.5" fill="#fff2a9"><animate attributeName="opacity" values=".25;1;.25" dur={`${1.8 + i * .3}s`} repeatCount="indefinite" /></circle>)}
      <path className="weather-rain" d="M0 0h700v300H0Z" fill="#617f91" opacity=".35" />
      {state.weather === 'Lluvia' && Array.from({ length: 18 }, (_, i) => <path key={`rain-${i}`} className="weather-rain" d={`M${190 + (i * 29) % 320} ${70 + (i * 47) % 150}l-7 16`} stroke="#f0f5e8" strokeWidth="2" strokeLinecap="round" opacity=".65" />)}
      {state.weather === 'Noche' && <g className="weather-night"><circle cx="285" cy="98" r="2" fill="white" /><circle cx="355" cy="69" r="2" fill="white" /><circle cx="405" cy="118" r="1.5" fill="white" /><circle cx="250" cy="137" r="1.5" fill="white" /></g>}
    </g>
    <ellipse cx="350" cy="328" rx="106" ry="8" fill="#657e55" opacity=".13" />
    <path d="M311 322 350 333 390 322" fill="none" stroke="#8ca46f" strokeWidth="3" opacity=".45" />
  </svg>;
}

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Salud');
  const [taskXp, setTaskXp] = useState('20');
  const [toast, setToast] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<{ context: AudioContext; nodes: AudioNode[] } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => () => {
    if (audioRef.current) void audioRef.current.context.close();
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (confettiTimer.current) clearTimeout(confettiTimer.current);
  }, []);
  const announce = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };
  const celebrateTask = () => {
    setConfettiKey(key => key + 1);
    setShowConfetti(true);
    if (confettiTimer.current) clearTimeout(confettiTimer.current);
    confettiTimer.current = setTimeout(() => setShowConfetti(false), 1100);
  };
  const completedTasks = useMemo(() => state.tasks.filter(task => task.completedDate === todayKey()).length, [state.tasks]);
  const growth = state.habitatElements.length;
  const level = Math.max(1, Math.floor(state.xp / 150) + 1);
  const health = Math.min(100, 32 + growth * 5 + completedTasks * 4);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const doneDates = new Set(state.activityDates);

  const update = (patch: Partial<AppState>) => setState(current => ({ ...current, ...patch }));
  const toggleTask = (task: Task) => {
    if (task.completedDate === todayKey()) {
      setState(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, completedDate: null } : item) }));
      announce('Tarea devuelta a tu lista. Tu experiencia ganada se conserva.');
      return;
    }
    const alreadyEarned = Boolean(task.completedAt);
    const yesterday = offsetDate(-1);
    setState(current => ({
      ...current,
      xp: current.xp + (alreadyEarned ? 0 : task.xp),
      streak: current.lastActiveDate === todayKey() ? current.streak : current.lastActiveDate === yesterday ? current.streak + 1 : 1,
      lastActiveDate: todayKey(),
      activityDates: current.activityDates.includes(todayKey()) ? current.activityDates : [...current.activityDates, todayKey()],
      habitatElements: alreadyEarned || current.habitatElements.some(element => element.taskId === task.id)
        ? current.habitatElements
        : [...current.habitatElements, createHabitatElement(task, current.habitatElements.length)],
      tasks: current.tasks.map(item => item.id === task.id ? { ...item, completedAt: item.completedAt || new Date().toISOString(), completedDate: todayKey() } : item),
    }));
    celebrateTask();
    announce(alreadyEarned
      ? 'Listo para hoy. Esta tarea ya entregó su experiencia.'
      : `+${task.xp} XP · Tu tarea añadió ${habitatKindNames[habitatKinds[state.habitatElements.length % habitatKinds.length]]} a tu hábitat.`);
  };
  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const amount = Math.min(100, Math.max(5, Number(taskXp) || 20));
    const newTask: Task = { id: crypto.randomUUID(), title: cleanTitle, category, xp: amount, createdAt: todayKey(), completedAt: null, completedDate: null };
    setState(current => ({ ...current, tasks: [newTask, ...current.tasks] }));
    setTitle('');
    setFormOpen(false);
    announce('Nueva intención plantada.');
  };
  const deleteTask = (task: Task) => {
    setState(current => ({ ...current, tasks: current.tasks.filter(item => item.id !== task.id) }));
    announce('Tarea retirada.');
  };
  const buyReward = (reward: Reward) => {
    if (state.purchasedRewardIds.includes(reward.id)) return;
    if (state.xp < reward.cost) { announce(`Te faltan ${reward.cost - state.xp} XP para este regalo.`); return; }
    setState(current => ({ ...current, xp: current.xp - reward.cost, purchasedRewardIds: [...current.purchasedRewardIds, reward.id] }));
    announce(reward.habitatEffect);
  };
  const startAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) { announce('Este navegador no permite reproducir audio.'); return; }
      const context = new AudioContextClass();
      const master = context.createGain();
      master.gain.value = state.volume / 100 * .12;
      master.connect(context.destination);
      const nodes: AudioNode[] = [master];
      if (state.ambience === 'Fuego') {
        const osc = context.createOscillator(); const tone = context.createOscillator(); const gain = context.createGain();
        osc.type = 'triangle'; osc.frequency.value = 78; tone.type = 'sine'; tone.frequency.value = 42;
        osc.connect(gain); tone.connect(gain); gain.gain.value = .35; gain.connect(master); osc.start(); tone.start(); nodes.push(osc, tone, gain);
      } else {
        const size = context.sampleRate * 2;
        const buffer = context.createBuffer(1, size, context.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < size; i++) channel[i] = (Math.random() * 2 - 1) * (state.ambience === 'Lluvia' ? .22 : .08);
        const source = context.createBufferSource(); const filter = context.createBiquadFilter(); const gain = context.createGain();
        source.buffer = buffer; source.loop = true; filter.type = 'lowpass'; filter.frequency.value = state.ambience === 'Lluvia' ? 900 : 420;
        source.connect(filter); filter.connect(gain); gain.gain.value = .7; gain.connect(master); source.start(); nodes.push(source, filter, gain);
        if (state.ambience === 'Bosque') {
          const bird = context.createOscillator(); const birdGain = context.createGain();
          bird.type = 'sine'; bird.frequency.value = 620; birdGain.gain.value = .012; bird.connect(birdGain); birdGain.connect(master); bird.start(); nodes.push(bird, birdGain);
        }
      }
      audioRef.current = { context, nodes };
      setPlaying(true);
    } catch { announce('No se pudo iniciar el sonido en este dispositivo.'); }
  };
  const toggleAudio = () => {
    if (playing && audioRef.current) {
      void audioRef.current.context.close();
      audioRef.current = null;
      setPlaying(false);
    } else startAudio();
  };
  useEffect(() => {
    if (playing && audioRef.current) {
      void audioRef.current.context.close();
      audioRef.current = null;
      setPlaying(false);
      startAudio();
    }
    // Changing the sound choice replaces the live locally generated sound.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ambience, state.volume]);
  const currentTheme = state.theme.toLowerCase();

  return <main className={`app-shell theme-${currentTheme}`} data-testid="app-ecoworld">
    <header className="topbar">
      <div className="brand" aria-label="EcoWorld, tu pequeño mundo">
        <div className="brand-mark"><Leaf size={23} strokeWidth={1.8} /></div>
        <div><div className="brand-name">EcoWorld</div><span className="brand-tag">tu pequeño mundo</span></div>
      </div>
      <div className="top-meta">
        <div className="xp-pill" data-testid="status-xp"><Sparkles size={15} /> {state.xp} XP</div>
        <div className="streak-pill" data-testid="status-streak"><Flame size={15} /> {state.streak} días</div>
      </div>
    </header>
    <div className="layout">
      <section className="main-column" aria-label="Tu mundo y tus tareas">
        <section className="panel world-panel" data-weather={state.weather}>
          <div className="world-heading">
            <div><div className="section-kicker">Un mundo que crece contigo</div><h1>Hola, cuidador/a.</h1><p>Cada tarea completada añade vida a tu hábitat.</p></div>
            <div className="world-level"><strong>{level}</strong><span>nivel</span></div>
          </div>
          <div className="weather-switch" role="group" aria-label="Ambiente del hábitat">
            {(['Sol', 'Lluvia', 'Noche'] as Weather[]).map(weather => <button type="button" key={weather} className={state.weather === weather ? 'active' : ''} aria-pressed={state.weather === weather} onClick={() => update({ weather })} data-testid={`button-weather-${weather.toLowerCase()}`}>
              {weather === 'Sol' ? <Sun size={13} /> : weather === 'Lluvia' ? <CloudRain size={13} /> : <Moon size={13} />}{weather}
            </button>)}
          </div>
          <div className="habitat-wrap"><Habitat state={state} /></div>
          {showConfetti && <div key={confettiKey} className="confetti-burst" aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <span key={index} />)}</div>}
          <div className="habitat-caption"><span>{state.habitatElements.length} {state.habitatElements.length === 1 ? 'pieza' : 'piezas'} en tu hábitat</span><div className="health-bar"><span>Salud</span><div className="health-track"><div className="health-fill" style={{ width: `${health}%` }} /></div><b>{health}%</b></div></div>
        </section>
        <div className="two-metrics">
          <section className="panel metric-card" aria-label="Progreso de esta semana">
            <div className="metric-top"><span>ESTA SEMANA</span><Activity size={17} /></div>
            <div className="metric-big"><strong>{completedTasks}</strong><span>pasos hoy</span></div>
            <div className="week-dots" aria-label="Actividad de lunes a domingo">
              {weekDays.map((day, index) => <div className="day" key={day}><span>{day}</span><i className={`day-dot ${index === todayIndex ? 'today' : ''} ${index === todayIndex && completedTasks ? 'active' : doneDates.has(offsetDate(index - todayIndex)) ? 'active' : ''}`} /></div>)}
            </div>
          </section>
          <section className="panel metric-card" aria-label="Tu racha actual">
            <div className="metric-top"><span>RACHA CONSECUTIVA</span><Flame size={17} /></div>
            <div className="metric-big"><strong>{state.streak}</strong><span>{state.streak === 1 ? 'día cuidando' : 'días cuidando'}</span></div>
            <p className="subtext">{state.streak > 0 ? 'Un gesto diario hace la diferencia.' : 'Un paso pequeño puede empezar hoy.'}</p>
          </section>
        </div>
        <section className="panel tasks-panel">
          <div className="panel-title-row">
            <div><div className="section-kicker">Pequeños pasos, grandes raíces</div><h2>Mis intenciones</h2><p className="subtext">Completa una tarea una sola vez para ganar su recompensa.</p></div>
            <button type="button" className="primary-button" onClick={() => setFormOpen(open => !open)} aria-expanded={formOpen} data-testid="button-add-task"><Plus size={16} /> Nueva tarea</button>
          </div>
          {formOpen && <form className="task-form" onSubmit={addTask}>
            <input autoFocus value={title} onChange={event => setTitle(event.target.value)} maxLength={70} placeholder="¿Qué pequeño paso darás?" aria-label="Título de la tarea" required data-testid="input-task-title" />
            <select aria-label="Categoría" value={category} onChange={event => setCategory(event.target.value as Category)} data-testid="select-task-category">{categories.map(item => <option key={item}>{item}</option>)}</select>
            <select aria-label="Recompensa de experiencia" value={taskXp} onChange={event => setTaskXp(event.target.value)} data-testid="select-task-xp">{[10, 20, 30, 40, 50].map(points => <option key={points} value={points}>{points} XP</option>)}</select>
            <button type="submit" data-testid="button-save-task">Plantar</button>
            <button type="button" className="cancel-form" onClick={() => setFormOpen(false)} data-testid="button-cancel-task">Cancelar</button>
          </form>}
          <div className="task-list">
            {state.tasks.length === 0 ? <div className="empty-state"><div className="empty-orbit"><Leaf size={23} /></div><strong>Hay espacio para algo nuevo</strong><span>Planta una intención pequeña y empieza a hacer crecer tu mundo.</span></div> :
              state.tasks.map(task => <article className={`task-row ${task.completedDate === todayKey() ? 'done' : ''}`} key={task.id} data-testid={`task-${task.id}`}>
                <button type="button" className={`check-button ${task.completedDate === todayKey() ? 'checked' : ''}`} aria-label={`${task.completedDate === todayKey() ? 'Desmarcar' : 'Completar'} ${task.title}`} aria-pressed={task.completedDate === todayKey()} onClick={() => toggleTask(task)} data-testid={`button-complete-${task.id}`}>{task.completedDate === todayKey() && <Check size={14} />}</button>
                <div className="task-copy"><span className="task-name">{task.title}</span><div className="task-meta"><span className="category-tag" style={{ backgroundColor: categoryColors[task.category] }}>{task.category}</span><span className="task-date">{task.id.startsWith('demo-') ? 'Ejemplo · puedes quitarlo' : task.createdAt === todayKey() ? 'Para hoy' : `Creada ${task.createdAt}`}</span></div></div>
                <span className="task-xp">+{task.xp} XP</span>
                <button type="button" className="icon-button" aria-label={`Eliminar ${task.title}`} title="Eliminar tarea" onClick={() => deleteTask(task)} data-testid={`button-delete-${task.id}`}><Trash2 size={15} /></button>
              </article>)}
          </div>
        </section>
      </section>
      <aside className="side-column" aria-label="Recompensas y ambiente">
        <section className="panel side-panel">
          <div className="shop-heading"><div><div className="section-kicker">Pequeños regalos</div><h2>Rincón vivo</h2></div><span className="shop-balance">{state.xp} XP</span></div>
          <p className="subtext">Canjea tu constancia por nuevos habitantes.</p>
          <div className="reward-list">
            {rewards.map(reward => {
              const owned = state.purchasedRewardIds.includes(reward.id);
              const Icon = reward.icon === 'bird' ? Bird : reward.icon === 'building' ? Building2 : Sparkles;
              return <div className="reward-item" key={reward.id}>
                <div className="reward-art"><Icon size={20} /></div>
                <div><span className="reward-name">{reward.name}</span><span className="reward-desc">{reward.description}</span></div>
                <button type="button" className={`reward-action ${owned ? 'owned' : ''}`} disabled={owned} onClick={() => buyReward(reward)} data-testid={`button-reward-${reward.id}`}>{owned ? 'En tu mundo' : `${reward.cost} XP`}</button>
              </div>;
            })}
          </div>
          <hr className="divider" />
          <div className="theme-row"><span className="theme-label">Paleta del mundo</span><div className="theme-options" role="group" aria-label="Paleta del mundo">
            {(['Naturaleza', 'Galaxia', 'Cyberpunk'] as Theme[]).map(theme => <button type="button" key={theme} className={`theme-chip ${state.theme === theme ? 'active' : ''}`} aria-pressed={state.theme === theme} onClick={() => update({ theme })} data-testid={`button-theme-${theme.toLowerCase()}`}>{theme}</button>)}
          </div></div>
        </section>
        <section className="panel focus-card">
          <div className="focus-heading"><div><div className="section-kicker">Un momento para ti</div><h2>Sonidos de enfoque</h2></div><Waves size={22} /></div>
          <p className="focus-description">Un paisaje sonoro suave, creado aquí mismo.</p>
          <div className="sound-options" role="group" aria-label="Sonido de ambiente">
            {(['Lluvia', 'Bosque', 'Fuego'] as Ambience[]).map(sound => <button type="button" key={sound} className={`sound-option ${state.ambience === sound ? 'active' : ''}`} aria-pressed={state.ambience === sound} onClick={() => update({ ambience: sound })} data-testid={`button-sound-${sound.toLowerCase()}`}>{sound === 'Lluvia' ? <Droplets size={14} /> : sound === 'Bosque' ? <Wind size={14} /> : <Flame size={14} />}{sound}</button>)}
          </div>
          <div className="focus-controls">
            <button type="button" className="play-button" aria-label={playing ? 'Pausar ambiente' : 'Reproducir ambiente'} aria-pressed={playing} onClick={toggleAudio} data-testid="button-audio-toggle">{playing ? <Pause size={17} /> : <Play size={17} />}</button>
            <div className="volume-control">{state.volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}<input type="range" min="0" max="100" value={state.volume} aria-label="Volumen del ambiente" onChange={event => update({ volume: Number(event.target.value) })} data-testid="input-volume" /><span className="volume-value">{state.volume}%</span></div>
          </div>
        </section>
      </aside>
    </div>
    <footer className="site-credit">Creado con cuidado por <strong>Sofía Cuatis</strong></footer>
    {toast && <div className="toast-note" role="status" aria-live="polite">{toast}</div>}
  </main>;
}

export default App;