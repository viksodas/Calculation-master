import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Calculator, 
  Grid2X2, 
  Box, 
  Percent, 
  Dumbbell, 
  LineChart,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  X,
  Zap,
  Calendar,
  ChevronRight,
  ArrowDown,
  Target,
  BookOpen
} from 'lucide-react';

// --- Constants & Data ---
const MOTIVATIONAL_QUOTES = [
  "Sweat now, shine in the merit list.",
  "Every calculation brings the uniform closer.",
  "Rankers are built in these silent hours.",
  "Beat the clock, secure your dream seat.",
  "Grind today, own the result tomorrow.",
  "Accuracy and speed build top ranks."
];

const SLIDER_PROMPTS = [
  "Your dream deserves your daily effort.",
  "Target 30 Tables Today!",
  "Revise Squares up to 50.",
  "Fraction to Percentage Mastery.",
  "Speed up your calculations!",
  "Consistency beats intensity."
];

const DUMMY_PROGRESS = {
  '2026-11-02': [
    { module: 'Table of 15', total: 10, correct: 9, wrong: 1, accuracy: 90, avgTime: '2.5s' },
    { module: 'Squares (1-100)', total: 10, correct: 8, wrong: 2, accuracy: 80, avgTime: '3.1s' },
    { module: 'Mixed (Moderate)', total: 10, correct: 10, wrong: 0, accuracy: 100, avgTime: '4.2s' }
  ],
  '2026-11-01': [
    { module: 'Table of 12', total: 10, correct: 10, wrong: 0, accuracy: 100, avgTime: '2.1s' },
    { module: 'Fractions to %', total: 10, correct: 7, wrong: 3, accuracy: 70, avgTime: '5.0s' }
  ]
};

const COMMON_FRACTIONS = [
  { f: '1', p: '100%' }, { f: '1/2', p: '50%' }, { f: '1/3', p: '33.33%' }, 
  { f: '1/4', p: '25%' }, { f: '1/5', p: '20%' }, { f: '1/6', p: '16.66%' }, 
  { f: '1/7', p: '14.28%' }, { f: '1/8', p: '12.5%' }, { f: '1/9', p: '11.11%' }, 
  { f: '1/10', p: '10%' }, { f: '1/11', p: '9.09%' }, { f: '1/12', p: '8.33%' },
  { f: '1/14', p: '7.14%' }, { f: '1/15', p: '6.66%' }, { f: '1/16', p: '6.25%' }, 
  { f: '1/20', p: '5%' }, { f: '1/24', p: '4.16%' }, { f: '1/25', p: '4%' }, 
  { f: '1/30', p: '3.33%' }, { f: '1/40', p: '2.5%' }, { f: '1/50', p: '2%' }
];

// --- Helper Functions ---
const generateOptions = (correctAnswer) => {
  const options = new Set([correctAnswer]);
  while (options.size < 4) {
    const variance = Math.floor(Math.random() * (Math.abs(correctAnswer) * 0.2 + 5)) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    let wrong = correctAnswer + (variance * sign);
    if (correctAnswer > 0 && wrong <= 0) wrong = correctAnswer + variance; 
    options.add(wrong);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

const generateFractionOptions = (correctObj, isToPercent) => {
  const options = new Set([isToPercent ? correctObj.p : correctObj.f]);
  while (options.size < 4) {
    const randomFrac = COMMON_FRACTIONS[Math.floor(Math.random() * COMMON_FRACTIONS.length)];
    options.add(isToPercent ? randomFrac.p : randomFrac.f);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

const generateQuestions = (tableNum) => {
  const multipliers = Array.from({length: 10}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  return multipliers.map(m => {
    const answer = tableNum * m;
    return { text: `${tableNum} × ${m}`, answer: answer, options: generateOptions(answer) };
  });
};

const generateSquareQuestions = () => {
  return Array.from({length: 10}, () => {
    const num = Math.floor(Math.random() * 50) + 1;
    const ans = num * num;
    return { text: `${num}²`, answer: ans, options: generateOptions(ans) };
  });
};

const generateCubeQuestions = () => {
  return Array.from({length: 10}, () => {
    const num = Math.floor(Math.random() * 50) + 1;
    const ans = num * num * num;
    return { text: `${num}³`, answer: ans, options: generateOptions(ans) };
  });
};

const generateFractionQuestions = (isToPercent) => {
  return Array.from({length: 10}, () => {
    const frac = COMMON_FRACTIONS[Math.floor(Math.random() * COMMON_FRACTIONS.length)];
    return {
      text: isToPercent ? frac.f : frac.p,
      answer: isToPercent ? frac.p : frac.f,
      options: generateFractionOptions(frac, isToPercent)
    };
  });
};

const generateExerciseQuestions = (type, level) => {
  const types = type === 'Mixed' ? ['Addition', 'Subtraction', 'Multiplication', 'Division'] : [type];
  return Array.from({length: 10}, () => {
      const qType = types[Math.floor(Math.random() * types.length)];
      let a, b, ans, text;
      const max = level === 'Easy' ? 20 : level === 'Moderate' ? 100 : 500;
      const min = level === 'Easy' ? 2 : level === 'Moderate' ? 10 : 50;

      if (qType === 'Addition') {
          a = Math.floor(Math.random() * max) + min;
          b = Math.floor(Math.random() * max) + min;
          ans = a + b;
          text = `${a} + ${b}`;
      } else if (qType === 'Subtraction') {
          a = Math.floor(Math.random() * max) + min;
          b = Math.floor(Math.random() * a) + 1;
          ans = a - b;
          text = `${a} - ${b}`;
      } else if (qType === 'Multiplication') {
          const mulMax = level === 'Easy' ? 10 : level === 'Moderate' ? 30 : 99;
          a = Math.floor(Math.random() * mulMax) + 2;
          b = Math.floor(Math.random() * (level === 'Tough' ? 99 : 20)) + 2;
          ans = a * b;
          text = `${a} × ${b}`;
      } else { 
          const divMax = level === 'Easy' ? 10 : level === 'Moderate' ? 20 : 50;
          b = Math.floor(Math.random() * divMax) + 2;
          ans = Math.floor(Math.random() * divMax) + 2;
          a = b * ans;
          text = `${a} ÷ ${b}`;
      }
      return { text, answer: ans, options: generateOptions(ans) };
  });
};

// --- Learn Data Generators ---
const generateTableLearn = (tableNum) => {
  return Array.from({length: 10}, (_, i) => ({ left: `${tableNum} × ${i + 1}`, right: `${tableNum * (i + 1)}` }));
};

const generateSquareLearn = () => {
  return Array.from({length: 50}, (_, i) => ({ left: `${i + 1}²`, right: `${(i + 1) * (i + 1)}` }));
};

const generateCubeLearn = () => {
  return Array.from({length: 50}, (_, i) => ({ left: `${i + 1}³`, right: `${(i + 1) * (i + 1) * (i + 1)}` }));
};

const generateFractionLearn = (isToPercent) => {
  return COMMON_FRACTIONS.map(frac => ({
    left: isToPercent ? frac.f : frac.p,
    right: isToPercent ? frac.p : frac.f
  }));
};

export default function App() {
  // --- State ---
  const [currentView, setCurrentView] = useState('home'); // home, tableSelect, exerciseSelect, progress, learn, practice, result
  const [practiceTitle, setPracticeTitle] = useState("");
  
  // Home state
  const [sliderIndex, setSliderIndex] = useState(0);

  // Learn state
  const [learnData, setLearnData] = useState({ title: '', items: [], practiceFunc: null });

  // Practice state
  const [selectedTable, setSelectedTable] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  
  // Exercise & Progress State
  const [exerciseType, setExerciseType] = useState('Mixed');
  const [exerciseLevel, setExerciseLevel] = useState('Moderate');
  const [selectedDate, setSelectedDate] = useState('2026-11-02');

  // Refs
  const timerRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    if (currentView === 'home') {
      const interval = setInterval(() => {
        setSliderIndex((prev) => (prev + 1) % SLIDER_PROMPTS.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'practice' && !isAnswered) {
      timerRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
        setQuestionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentView, isAnswered]);

  // --- Handlers ---
  const openLearn = (title, items, practiceFunc) => {
    setLearnData({ title, items, practiceFunc });
    setCurrentView('learn');
  };

  const startPractice = (title, qs) => {
    setPracticeTitle(title);
    setQuestions(qs);
    setCurrentQIndex(0);
    setScore(0);
    setIncorrectCount(0);
    setTotalTime(0);
    setQuestionTime(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentView('practice');
  };

  const startTablePractice = (tableNum) => {
    setSelectedTable(tableNum);
    openLearn(
      `Table of ${tableNum}`, 
      generateTableLearn(tableNum), 
      () => startPractice(`Table of ${tableNum}`, generateQuestions(tableNum))
    );
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);
    setIsAnswered(true);
    setSelectedOption(option);

    const isCorrect = option === questions[currentQIndex].answer;
    if (isCorrect) setScore(prev => prev + 1);
    else setIncorrectCount(prev => prev + 1);

    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setIsAnswered(false);
        setSelectedOption(null);
        setQuestionTime(0);
      } else {
        setCurrentView('result');
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Render Components ---
  const renderHome = () => (
    <div className="flex flex-col space-y-4 pb-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      {/* Compact Banner */}
      <div className="rounded-[1.25rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 animate-gradient-x p-5 shadow-lg flex flex-col relative overflow-hidden min-h-[110px] justify-center">
        <span className="text-[9px] font-bold text-gray-300 tracking-[0.15em] mb-2 uppercase">
          Daily Practice
        </span>
        <h1 className="text-2xl leading-none font-black text-white mb-2 tracking-tight">
          HEY, CHAMPIONS! 🔥
        </h1>
        <p className="text-sm text-indigo-100 font-medium animate-in slide-in-from-bottom-2 fade-in duration-500" key={sliderIndex}>
          {SLIDER_PROMPTS[sliderIndex]}
        </p>
        
        {/* Footer Branding moved inside Hero */}
        <div className="mt-4 pt-4 border-t border-white/10 group cursor-default">
          <span className="animate-heartbeat text-[10px] font-black tracking-[0.2em] italic drop-shadow-[0_0_8px_rgba(0,255,213,0.4)] transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,213,0.8)]">
            ℂℝ𝔸𝔽𝕋𝔼𝔻 & 𝔻𝔼𝕍𝔼𝕃𝕆ℙ𝔼𝔻 𝔹𝕐 𝕍𝕀𝕂𝕊𝕆
          </span>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MenuCard 
          icon={<X size={32} strokeWidth={2.5} />} 
          watermark={<X size={100} strokeWidth={1} />} 
          title="Tables" 
          subtitle="1 to 30"
          theme={{
            border: 'border-blue-900/40 hover:border-blue-400/80',
            bg: 'from-blue-950/20 to-[#0a0a0a]',
            glow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]',
            text: 'text-blue-400'
          }}
          onClick={() => setCurrentView('tableSelect')}
        />
        <MenuCard 
          icon={<Grid2X2 size={32} strokeWidth={2} />} 
          watermark={<Grid2X2 size={100} strokeWidth={1} />} 
          title="Squares" 
          subtitle="1 to 50"
          theme={{
            border: 'border-purple-900/40 hover:border-purple-400/80',
            bg: 'from-purple-950/20 to-[#0a0a0a]',
            glow: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]',
            text: 'text-purple-400'
          }}
          onClick={() => openLearn("Squares (1-50)", generateSquareLearn(), () => startPractice("Squares (1-50)", generateSquareQuestions()))}
        />
        <MenuCard 
          icon={<Box size={32} strokeWidth={2} />} 
          watermark={<Box size={100} strokeWidth={1} />} 
          title="Cubes" 
          subtitle="1 to 50"
          theme={{
            border: 'border-emerald-900/40 hover:border-emerald-400/80',
            bg: 'from-emerald-950/20 to-[#0a0a0a]',
            glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]',
            text: 'text-emerald-400'
          }}
          onClick={() => openLearn("Cubes (1-50)", generateCubeLearn(), () => startPractice("Cubes (1-50)", generateCubeQuestions()))}
        />
        <MenuCard 
          icon={<Percent size={32} strokeWidth={2.5} />} 
          watermark={<Percent size={100} strokeWidth={1} />} 
          title="Percentage to Fraction" 
          subtitle="Convert & revise"
          theme={{
            border: 'border-rose-900/40 hover:border-rose-400/80',
            bg: 'from-rose-950/20 to-[#0a0a0a]',
            glow: 'hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]',
            text: 'text-rose-400'
          }}
          onClick={() => openLearn("% to Fraction", generateFractionLearn(false), () => startPractice("% to Fraction", generateFractionQuestions(false)))}
        />
        <MenuCard 
          icon={<span className="text-2xl font-bold tracking-tighter leading-none">1/2</span>} 
          watermark={<span className="text-[75px] font-black tracking-tighter leading-none opacity-50">1/2</span>} 
          title="Fraction to Percentage" 
          subtitle="Convert & revise"
          theme={{
            border: 'border-amber-900/40 hover:border-amber-400/80',
            bg: 'from-amber-950/20 to-[#0a0a0a]',
            glow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]',
            text: 'text-amber-400'
          }}
          onClick={() => openLearn("Fraction to %", generateFractionLearn(true), () => startPractice("Fraction to %", generateFractionQuestions(true)))}
        />
        <MenuCard 
          icon={<Zap size={32} className="fill-current" />} 
          watermark={<Zap size={100} strokeWidth={1} className="fill-current opacity-20" />} 
          title="Exercise" 
          subtitle="5 calculation types"
          theme={{
            border: 'border-yellow-900/40 hover:border-yellow-400/80',
            bg: 'from-yellow-950/20 to-[#0a0a0a]',
            glow: 'hover:shadow-[0_0_15px_rgba(234,179,8,0.15)]',
            text: 'text-yellow-400'
          }}
          onClick={() => setCurrentView('exerciseSelect')}
        />
      </div>

      {/* Progress Button */}
      <button 
        onClick={() => setCurrentView('progress')}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0f1219] border border-[#1f2937] hover:bg-[#1a1f2e] active:scale-[0.98] transition-all mt-1"
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-lg">
             <Calendar size={20} className="text-gray-300" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white mb-0.5">View My Progress</div>
            <div className="text-[10px] text-gray-400">Choose a date to see your practice history</div>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-500" />
      </button>

      {/* Today's Analyzer - Extremely Compact 4-Grid */}
      <div className="bg-[#111111] rounded-xl border border-[#222222] p-2 mt-1">
        <div className="flex items-center mb-1.5">
          <Target size={12} className="mr-1.5 text-indigo-400"/> 
          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Today's Analyzer
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-[#161616] rounded p-1 text-center">
            <div className="text-[7px] text-slate-500 font-bold uppercase mb-0.5 tracking-wider">Tables</div>
            <div className="text-[12px] font-black text-blue-400 leading-none">90%</div>
          </div>
          <div className="bg-[#161616] rounded p-1 text-center">
            <div className="text-[7px] text-slate-500 font-bold uppercase mb-0.5 tracking-wider">Squares</div>
            <div className="text-[12px] font-black text-purple-400 leading-none">75%</div>
          </div>
          <div className="bg-[#161616] rounded p-1 text-center">
            <div className="text-[7px] text-slate-500 font-bold uppercase mb-0.5 tracking-wider">Cubes</div>
            <div className="text-[12px] font-black text-emerald-400 leading-none">55%</div>
          </div>
          <div className="bg-[#161616] rounded p-1 text-center">
            <div className="text-[7px] text-slate-500 font-bold uppercase mb-0.5 tracking-wider">Percent</div>
            <div className="text-[12px] font-black text-rose-400 leading-none">40%</div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderLearn = () => (
    <div className="flex flex-col h-full relative animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center space-x-4 mb-4 flex-shrink-0">
        <button onClick={() => setCurrentView('home')} className="p-2 bg-slate-800 rounded-full active:bg-slate-700">
          <ChevronLeft size={24} className="text-slate-300" />
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center">
          <BookOpen size={20} className="mr-2 text-indigo-400" />
          {learnData.title}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar flex flex-col items-center">
        <div className="w-full max-w-sm bg-[#111111] border border-[#222222] rounded-2xl p-6 py-8 shadow-xl">
          <div className="space-y-3">
            {learnData.items.map((item, idx) => (
              <div key={idx} className="flex w-full font-mono tabular-nums text-lg md:text-xl font-bold items-center">
                <div className="w-[45%] text-right text-slate-300 pr-3">{item.left}</div>
                <div className="w-[10%] text-center text-slate-600">=</div>
                <div className="w-[45%] text-left text-indigo-400 pl-3">{item.right}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Practice Fixed Bottom Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-12 flex-shrink-0">
         <button 
           onClick={learnData.practiceFunc}
           className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-purple-900/30 active:scale-95 transition-all"
         >
           Start Practice
         </button>
      </div>
    </div>
  );

  const renderTableSelect = () => (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => setCurrentView('home')} className="p-2 bg-slate-800 rounded-full active:bg-slate-700">
          <ChevronLeft size={24} className="text-slate-300" />
        </button>
        <h2 className="text-2xl font-bold text-white">Select Table</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-3 overflow-y-auto pb-20 no-scrollbar">
        {Array.from({length: 30}, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => startTablePractice(num)}
            className="aspect-square flex items-center justify-center text-xl font-bold text-slate-200 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-indigo-600 hover:border-indigo-500 active:scale-90 transition-all"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );

  const renderExerciseSelect = () => (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => setCurrentView('home')} className="p-2 bg-slate-800 rounded-full active:bg-slate-700">
          <ChevronLeft size={24} className="text-slate-300" />
        </button>
        <h2 className="text-2xl font-bold text-white">Custom Exercise</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Operation</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Addition', 'Subtraction', 'Multiplication', 'Division', 'Mixed'].map(type => (
              <button
                key={type}
                onClick={() => setExerciseType(type)}
                className={`p-4 rounded-xl font-bold text-sm transition-all border ${
                  exerciseType === type 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-[#161616] border-[#262626] text-slate-400 hover:bg-[#1f1f1f]'
                } ${type === 'Mixed' ? 'col-span-2' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Difficulty</h3>
          <div className="grid grid-cols-3 gap-3">
            {['Easy', 'Moderate', 'Tough'].map(level => (
              <button
                key={level}
                onClick={() => setExerciseLevel(level)}
                className={`p-3 rounded-xl font-bold text-sm transition-all border ${
                  exerciseLevel === level 
                    ? 'bg-purple-600 border-purple-500 text-white' 
                    : 'bg-[#161616] border-[#262626] text-slate-400 hover:bg-[#1f1f1f]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => startPractice(`${exerciseType} (${exerciseLevel})`, generateExerciseQuestions(exerciseType, exerciseLevel))}
        className="w-full py-4 mt-auto mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        Start Practice
      </button>
    </div>
  );

  const renderProgress = () => {
    const daysInMonth = Array.from({length: 30}, (_, i) => i + 1);
    const currentData = DUMMY_PROGRESS[selectedDate] || [];

    return (
      <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 fade-in duration-500">
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => setCurrentView('home')} className="p-2 bg-slate-800 rounded-full active:bg-slate-700">
            <ChevronLeft size={24} className="text-slate-300" />
          </button>
          <h2 className="text-2xl font-bold text-white">Your Progress</h2>
        </div>

        {/* Mock Calendar */}
        <div className="bg-[#161616] border border-[#262626] rounded-2xl p-4 mb-6">
          <div className="text-center font-bold text-slate-200 mb-4">November 2026</div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map(day => {
              const dateStr = `2026-11-${day.toString().padStart(2, '0')}`;
              const hasData = !!DUMMY_PROGRESS[dateStr];
              const isSelected = selectedDate === dateStr;
              return (
                <button 
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  disabled={!hasData}
                  className={`aspect-square rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 
                      hasData ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-900 hover:bg-indigo-900/50' : 
                      'text-slate-600 opacity-50'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Report */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-8 no-scrollbar">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            Report for {new Date(selectedDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
          </h3>
          
          {currentData.length > 0 ? currentData.map((session, idx) => (
            <div key={idx} className="bg-[#161616] border border-[#262626] rounded-2xl p-4 flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-base">{session.module}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${session.accuracy >= 80 ? 'bg-green-900/30 text-green-400' : session.accuracy >= 50 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                  {session.accuracy}% Acc
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 divide-x divide-[#262626] text-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total</span>
                  <span className="text-sm text-slate-300 font-medium">{session.total}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Right</span>
                  <span className="text-sm text-green-400 font-medium">{session.correct}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Wrong</span>
                  <span className="text-sm text-red-400 font-medium">{session.wrong}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Time</span>
                  <span className="text-sm text-indigo-400 font-medium">{session.avgTime}</span>
                </div>
              </div>
            </div>
          )) : (
             <div className="text-center text-slate-500 py-8 text-sm">No practice recorded on this date.</div>
          )}
        </div>
      </div>
    );
  };

  const renderPractice = () => {
    const q = questions[currentQIndex];
    if (!q) return null;

    return (
      <div className="flex flex-col h-full relative animate-in slide-in-from-bottom-4 fade-in duration-500">
        {/* Header Stats */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4 text-sm font-semibold">
            <span className="flex items-center text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-900/30">
              <CheckCircle2 size={16} className="mr-1" /> {score}
            </span>
            <span className="flex items-center text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-900/30">
              <XCircle size={16} className="mr-1" /> {incorrectCount}
            </span>
          </div>
          <div className="flex items-center text-slate-300 bg-slate-800 px-4 py-1.5 rounded-full font-mono font-bold text-lg border border-slate-700 shadow-inner">
            <Clock size={16} className="mr-2 text-indigo-400 animate-pulse" /> 
            {questionTime}s
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full mb-10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Area - Extra Spacious */}
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-6">
            Question {currentQIndex + 1} of {questions.length}
          </div>
          <div className="text-7xl sm:text-8xl font-black text-white mb-16 drop-shadow-2xl text-center leading-tight">
            {q.text}
          </div>

          {/* Options Grid - Larger Tap Targets */}
          <div className="w-full grid grid-cols-2 gap-4 sm:gap-6 mt-auto">
            {q.options.map((opt, idx) => {
              let btnClass = "py-8 px-2 min-h-[90px] flex items-center justify-center text-3xl sm:text-4xl font-bold rounded-[2rem] border-2 transition-all duration-200 shadow-lg active:scale-95 ";
              
              if (!isAnswered) {
                btnClass += "bg-[#161616] border-[#262626] text-white hover:border-indigo-500 hover:bg-[#1a1a24]";
              } else {
                if (opt === q.answer) {
                  btnClass += "bg-green-500/20 border-green-500 text-green-400 shadow-green-500/20"; 
                } else if (opt === selectedOption) {
                  btnClass += "bg-red-500/20 border-red-500 text-red-400 shadow-red-500/20";
                } else {
                  btnClass += "bg-[#161616] border-[#262626] text-slate-500 opacity-40"; 
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(opt)}
                  className={btnClass}
                >
                  <span className="truncate">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const accuracy = Math.round((score / questions.length) * 100);
    const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Ring Graphic */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" className="stroke-slate-800" strokeWidth="12" fill="none" />
            <circle 
              cx="96" cy="96" r="88" 
              className={`stroke-current ${accuracy > 80 ? 'text-green-500' : accuracy > 50 ? 'text-yellow-500' : 'text-red-500'}`} 
              strokeWidth="12" fill="none" 
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - accuracy / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-white">{accuracy}%</span>
            <span className="text-slate-400 text-sm font-semibold uppercase">Accuracy</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 w-full px-4">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div className="text-green-400 text-2xl font-bold">{score}</div>
            <div className="text-slate-400 text-xs mt-1">Correct</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div className="text-red-400 text-2xl font-bold">{incorrectCount}</div>
            <div className="text-slate-400 text-xs mt-1">Wrong</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div className="text-indigo-400 text-2xl font-bold">{formatTime(totalTime)}</div>
            <div className="text-slate-400 text-xs mt-1">Time</div>
          </div>
        </div>

        {/* Raw Motivation Quote */}
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 mt-4 relative overflow-hidden w-full">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <p className="text-xl font-bold text-slate-200 italic leading-snug">
            "{quote}"
          </p>
        </div>

        <button 
          onClick={() => setCurrentView('home')}
          className="w-full py-4 mt-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-purple-900/30 active:scale-95 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  };

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-black font-sans selection:bg-indigo-500/30">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes gradientX {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 5s ease infinite;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-heartbeat {
          background: linear-gradient(90deg, #00ffd5 0%, #ffffff 50%, #00ffd5 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite, heartbeat 2s ease-in-out infinite;
          display: inline-block;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #00ffd5 0%, #ffffff 50%, #00ffd5 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-md mx-auto h-screen bg-[#0a0a0a] shadow-2xl overflow-hidden relative flex flex-col sm:border-x sm:border-[#1a1a1a]">
        
        {/* Dynamic Top Bar */}
        {currentView !== 'home' && (
          <div className="flex-none p-6 pb-2 flex justify-between items-center bg-[#0a0a0a] z-10 relative">
            <div className="flex items-center space-x-2">
              <Timer className="text-indigo-500" size={24} />
              <span className="text-white font-bold text-xl tracking-tight">SpeedMath</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-xs font-bold text-gray-300 uppercase tracking-wider max-w-[150px] truncate text-center">
              {currentView === 'tableSelect' ? 'Tables' : 
               currentView === 'exerciseSelect' ? 'Exercise' :
               currentView === 'progress' ? 'Report' : 
               currentView === 'learn' ? 'Learn' : practiceTitle}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto ${currentView === 'home' ? 'p-4 sm:p-5' : 'p-6 pt-4'} scroll-smooth no-scrollbar bg-[#0a0a0a] relative`}>
          {currentView === 'home' && renderHome()}
          {currentView === 'tableSelect' && renderTableSelect()}
          {currentView === 'exerciseSelect' && renderExerciseSelect()}
          {currentView === 'progress' && renderProgress()}
          {currentView === 'learn' && renderLearn()}
          {currentView === 'practice' && renderPractice()}
          {currentView === 'result' && renderResult()}
        </div>

      </div>
    </div>
  );
}

// Sub-components
function MenuCard({ icon, watermark, title, subtitle, theme, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden flex flex-col items-start justify-between p-4 h-36 bg-gradient-to-br ${theme.bg} border ${theme.border} rounded-2xl transition-all duration-300 group ${theme.glow} hover:-translate-y-1 active:scale-[0.97] active:translate-y-0`}
    >
      <div className={`absolute -bottom-2 -right-4 opacity-5 transform group-hover:scale-110 group-hover:opacity-10 group-hover:-rotate-6 transition-all duration-500 ${theme.text}`}>
        {watermark}
      </div>
      <div className={`p-2 rounded-lg bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/5 ${theme.text} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
        {icon}
      </div>
      <div className="text-left mt-auto relative z-10 w-full">
        <div className="text-gray-200 font-bold text-[14px] leading-tight mb-0.5 group-hover:text-white transition-colors">{title}</div>
        <div className={`font-medium text-[11px] transition-colors opacity-70 group-hover:opacity-100 ${theme.text}`}>{subtitle}</div>
      </div>
    </button>
  );
}