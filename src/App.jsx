```jsx

import React, { useState, useEffect } from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const HydroNaija = () => {

  const [activeTab, setActiveTab] = useState('home');

  const [darkMode, setDarkMode] = useState(true);

  const [todayIntake, setTodayIntake] = useState(0);

  const [dailyGoal, setDailyGoal] = useState(2500);

  const [entries, setEntries] = useState([]);

  const [streak, setStreak] = useState(0);

  const [longestStreak, setLongestStreak] = useState(0);

  const [history, setHistory] = useState({});

  const [settings, setSettings] = useState({

    name: 'Friend',

    unit: 'ml',

    reminderEnabled: false,

    reminderHours: { start: 6, end: 22 },

    weight: 70

  });

  const [lastDrinkTime, setLastDrinkTime] = useState(Date.now());


  // Load data from localStorage

  useEffect(() => {

    const saved = localStorage.getItem('hydroNaijaData');

    if (saved) {

      const data = JSON.parse(saved);

      setTodayIntake(data.todayIntake || 0);

      setDailyGoal(data.dailyGoal || 2500);

      setEntries(data.entries || []);

      setStreak(data.streak || 0);

      setLongestStreak(data.longestStreak || 0);

      setHistory(data.history || {});

      setSettings(data.settings || settings);

      setLastDrinkTime(data.lastDrinkTime || Date.now());

    }

  }, []);


  // Save data to localStorage

  useEffect(() => {

    const data = {

      todayIntake,

      dailyGoal,

      entries,

      streak,

      longestStreak,

      history,

      settings,

      lastDrinkTime

    };

    localStorage.setItem('hydroNaijaData', JSON.stringify(data));

  }, [todayIntake, dailyGoal, entries, streak, longestStreak, history, settings, lastDrinkTime]);


  // Check for midnight reset

  useEffect(() => {

    const checkMidnight = setInterval(() => {

      const today = new Date().toDateString();

      const lastEntry = entries[0];

      if (lastEntry && new Date(lastEntry.timestamp).toDateString() !== today) {

        handleDayReset();

      }

    }, 60000);


    return () => clearInterval(checkMidnight);

  }, [entries]);


  const handleDayReset = () => {

    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayKey = yesterday.toISOString().split('T')[0];

    

    const newHistory = { ...history };

    newHistory[yesterdayKey] = todayIntake;


    let newStreak = streak;

    if (todayIntake >= dailyGoal) {

      newStreak += 1;

      if (newStreak > longestStreak) {

        setLongestStreak(newStreak);

      }

    } else {

      newStreak = 0;

    }


    setHistory(newHistory);

    setStreak(newStreak);

    setTodayIntake(0);

    setEntries([]);

  };


  const addWater = (amount) => {

    const newEntry = {

      amount,

      timestamp: Date.now(),

      id: Date.now()

    };

    setEntries([newEntry, ...entries]);

    setTodayIntake(todayIntake + amount);

    setLastDrinkTime(Date.now());

  };


  const undoLast = () => {

    if (entries.length > 0) {

      const lastEntry = entries[0];

      setTodayIntake(todayIntake - lastEntry.amount);

      setEntries(entries.slice(1));

    }

  };


  const getProgress = () => {

    return Math.min((todayIntake / dailyGoal) * 100, 100);

  };


  const getProgressColor = () => {

    const progress = getProgress();

    if (progress < 30) return 'bg-red-500';

    if (progress < 60) return 'bg-orange-500';

    if (progress < 90) return 'bg-yellow-500';

    if (progress < 100) return 'bg-blue-500';

    return 'bg-green-500';

  };


  const getHydrationEmoji = () => {

    const progress = getProgress();

    if (progress < 30) return '😰';

    if (progress < 60) return '😐';

    if (progress < 90) return '🙂';

    if (progress < 100) return '😊';

    return '🎉';

  };


  const getWeeklyData = () => {

    const data = [];

    for (let i = 6; i >= 0; i--) {

      const date = new Date();

      date.setDate(date.getDate() - i);

      const key = date.toISOString().split('T')[0];

      const dayName = date.toLocaleDateString('en-NG', { weekday: 'short' });

      data.push({

        day: dayName,

        intake: i === 0 ? todayIntake : (history[key] || 0),

        goal: dailyGoal

      });

    }

    return data;

  };


  const getWeeklyAverage = () => {

    const weekData = getWeeklyData();

    const total = weekData.reduce((sum, day) => sum + day.intake, 0);

    return Math.round(total / 7);

  };


  const getBestDayThisWeek = () => {

    const weekData = getWeeklyData();

    return Math.max(...weekData.map(d => d.intake));

  };


  const convertUnit = (ml) => {

    switch (settings.unit) {

      case 'L': return (ml / 1000).toFixed(2) + ' L';

      case 'oz': return (ml * 0.033814).toFixed(1) + ' oz';

      case 'cups': return (ml * 0.00422675).toFixed(1) + ' cups';

      default: return ml + ' ml';

    }

  };


  const WaterWave = ({ percentage }) => {

    return (

      <div className="relative w-full h-64 bg-gray-800 rounded-2xl overflow-hidden">

        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">

          <defs>

            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">

              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />

              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />

            </linearGradient>

          </defs>

          <path 

            fill="url(#waveGradient)" 

            d="M0,160L48,154.7C96,149,192,139,288,149.3C384,160,480,192,576,197.3C672,203,768,181,864,165.3C960,149,1056,139,1152,149.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"

            style={{ transform: `translateY(${100 - percentage}%)`, transition: 'transform 1s ease-out' }}

          />

        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-white z-10">

          <div className="text-center">

            <div className="text-6xl font-bold">{Math.round(percentage)}%</div>

            <div className="text-2xl mt-2">{getHydrationEmoji()}</div>

          </div>

        </div>

      </div>

    );

  };


  const HomeTab = () => (

    <div className="space-y-6 pb-20">

      <div className="text-center">

        <h2 className="text-2xl font-bold mb-2">Welcome back, {settings.name}! 👋</h2>

        <p className="text-gray-400">Let's stay hydrated today</p>

      </div>


      <WaterWave percentage={getProgress()} />


      <div className="bg-gray-800 rounded-xl p-6">

        <div className="flex justify-between items-center mb-4">

          <div>

            <p className="text-gray-400 text-sm">Today's Intake</p>

            <p className="text-3xl font-bold text-blue-400">{convertUnit(todayIntake)}</p>

          </div>

          <div className="text-right">

            <p className="text-gray-400 text-sm">Goal</p>

            <p className="text-2xl font-bold">{convertUnit(dailyGoal)}</p>

          </div>

        </div>

        

        <div className="w-full bg-gray-700 rounded-full h-4 mb-2">

          <div 

            className={`h-4 rounded-full ${getProgressColor()} transition-all duration-500`}

            style={{ width: `${getProgress()}%` }}

          />

        </div>

        

        <div className="flex justify-between text-sm">

          <span className="text-gray-400">{entries.length} servings</span>

          <span className="text-gray-400">

            {Math.max(0, dailyGoal - todayIntake)} ml remaining

          </span>

        </div>

      </div>


      <div className="grid grid-cols-2 gap-4">

        <div className="bg-gray-800 rounded-xl p-4 text-center">

          <div className="text-3xl mb-2">🔥</div>

          <div className="text-2xl font-bold text-orange-400">{streak}</div>

          <div className="text-sm text-gray-400">Day Streak</div>

        </div>

        <div className="bg-gray-800 rounded-xl p-4 text-center">

          <div className="text-3xl mb-2">🏆</div>

          <div className="text-2xl font-bold text-yellow-400">{longestStreak}</div>

          <div className="text-sm text-gray-400">Best Streak</div>

        </div>

      </div>


      <div>

        <h3 className="text-lg font-bold mb-3">Quick Add</h3>

        <div className="grid grid-cols-2 gap-3">

          <button

            onClick={() => addWater(250)}

            className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 transition-colors"

          >

            <div className="text-2xl mb-1">💧</div>

            <div className="font-bold">Small Glass</div>

            <div className="text-sm text-gray-300">250ml</div>

          </button>

          <button

            onClick={() => addWater(500)}

            className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 transition-colors"

          >

            <div className="text-2xl mb-1">🥤</div>

            <div className="font-bold">Large Glass</div>

            <div className="text-sm text-gray-300">500ml</div>

          </button>

          <button

            onClick={() => addWater(750)}

            className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 transition-colors"

          >

            <div className="text-2xl mb-1">🍾</div>

            <div className="font-bold">Bottle</div>

            <div className="text-sm text-gray-300">750ml</div>

          </button>

          <button

            onClick={() => addWater(1000)}

            className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 transition-colors"

          >

            <div className="text-2xl mb-1">🚰</div>

            <div className="font-bold">Large Bottle</div>

            <div className="text-sm text-gray-300">1L</div>

          </button>

        </div>

      </div>


      <div className="flex gap-3">

        <button

          onClick={undoLast}

          disabled={entries.length === 0}

          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-xl p-4 font-bold transition-colors"

        >

          ↩️ Undo Last

        </button>

        <button

          onClick={() => {

            const custom = prompt('Enter amount in ml:', '300');

            if (custom && !isNaN(custom)) {

              addWater(parseInt(custom));

            }

          }}

          className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl p-4 font-bold transition-colors"

        >

          ➕ Custom

        </button>

      </div>


      {entries.length > 0 && (

        <div className="bg-gray-800 rounded-xl p-4">

          <h3 className="font-bold mb-3">Recent Entries</h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">

            {entries.slice(0, 5).map(entry => (

              <div key={entry.id} className="flex justify-between text-sm">

                <span className="text-gray-400">

                  {new Date(entry.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}

                </span>

                <span className="font-bold text-blue-400">+{entry.amount}ml</span>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );


  const StatsTab = () => (

    <div className="space-y-6 pb-20">

      <h2 className="text-2xl font-bold">Statistics 📊</h2>


      <div className="bg-gray-800 rounded-xl p-6">

        <h3 className="font-bold mb-4">Weekly Overview</h3>

        <ResponsiveContainer width="100%" height={200}>

          <BarChart data={getWeeklyData()}>

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

            <XAxis dataKey="day" stroke="#9ca3af" />

            <YAxis stroke="#9ca3af" />

            <Tooltip 

              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}

              labelStyle={{ color: '#fff' }}

            />

            <Bar dataKey="intake" fill="#3b82f6" radius={[8, 8, 0, 0]} />

            <Bar dataKey="goal" fill="#374151" radius={[8, 8, 0, 0]} opacity={0.3} />

          </BarChart>

        </ResponsiveContainer>

      </div>


      <div className="grid grid-cols-2 gap-4">

        <div className="bg-gray-800 rounded-xl p-4">

          <div className="text-sm text-gray-400 mb-1">7-Day Average</div>

          <div className="text-2xl font-bold text-blue-400">{convertUnit(getWeeklyAverage())}</div>

        </div>

        <div className="bg-gray-800 rounded-xl p-4">

          <div className="text-sm text-gray-400 mb-1">Best Day</div>

          <div className="text-2xl font-bold text-green-400">{convertUnit(getBestDayThisWeek())}</div>

        </div>

    &nb


