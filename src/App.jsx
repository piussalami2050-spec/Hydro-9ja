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
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Current Streak</div>
          <div className="text-2xl font-bold text-orange-400">{streak} days</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Longest Streak</div>
          <div className="text-2xl font-bold text-yellow-400">{longestStreak} days</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold mb-3">Achievements 🏆</h3>
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${streak >= 7 ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <div className="font-bold">7-Day Warrior</div>
                  <div className="text-sm text-gray-400">Complete 7-day streak</div>
                </div>
              </div>
              {streak >= 7 && <span className="text-green-400">✓</span>}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${streak >= 30 ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💎</span>
                <div>
                  <div className="font-bold">Hydration Master</div>
                  <div className="text-sm text-gray-400">Complete 30-day streak</div>
                </div>
              </div>
              {streak >= 30 && <span className="text-green-400">✓</span>}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${todayIntake >= dailyGoal * 1.5 ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-bold">Overachiever</div>
                  <div className="text-sm text-gray-400">Drink 150% of daily goal</div>
                </div>
              </div>
              {todayIntake >= dailyGoal * 1.5 && <span className="text-green-400">✓</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TipsTab = () => (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold">Hydration Tips 💡</h2>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-3">Benefits of Proper Hydration</h3>
        <ul className="space-y-2 text-gray-300">
          <li>✓ Regulates body temperature</li>
          <li>✓ Improves physical performance</li>
          <li>✓ Boosts brain function and concentration</li>
          <li>✓ Aids digestion and prevents constipation</li>
          <li>✓ Keeps skin healthy and glowing</li>
          <li>✓ Helps flush out toxins</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-3">Signs of Dehydration</h3>
        <ul className="space-y-2 text-gray-300">
          <li>⚠️ Dark yellow urine</li>
          <li>⚠️ Dry mouth and lips</li>
          <li>⚠️ Headaches</li>
          <li>⚠️ Fatigue and dizziness</li>
          <li>⚠️ Rapid heartbeat</li>
          <li>⚠️ Decreased urination</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-3">Tips for Nigerian Climate</h3>
        <ul className="space-y-2 text-gray-300">
          <li>🌞 Drink more during harmattan season</li>
          <li>🌞 Carry a water bottle everywhere</li>
          <li>🌞 Drink before you feel thirsty</li>
          <li>🌞 Increase intake during outdoor activities</li>
          <li>🌞 Start your day with a glass of water</li>
          <li>🌞 Eat water-rich foods (watermelon, cucumber)</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-3">Best Times to Drink Water</h3>
        <div className="space-y-3 text-gray-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌅</span>
            <div>
              <div className="font-bold">Morning</div>
              <div className="text-sm">Right after waking up to kickstart metabolism</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <div className="font-bold">Before Meals</div>
              <div className="text-sm">30 minutes before eating aids digestion</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏃</span>
            <div>
              <div className="font-bold">During Exercise</div>
              <div className="text-sm">Before, during, and after physical activity</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <div>
              <div className="font-bold">Before Bed</div>
              <div className="text-sm">But not too much to avoid night trips</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-3">Calculate Your Water Needs</h3>
        <p className="text-gray-300 mb-3">
          A general rule: Drink 30-35ml of water per kilogram of body weight.
        </p>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Your Weight: {settings.weight}kg</div>
          <div className="text-lg font-bold text-blue-400">
            Recommended: {Math.round(settings.weight * 30)}ml - {Math.round(settings.weight * 35)}ml/day
          </div>
          <div className="text-lg font-bold text-blue-400">
            ({(settings.weight * 30 / 1000).toFixed(1)}L - {(settings.weight * 35 / 1000).toFixed(1)}L/day)
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold">Settings ⚙️</h2>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({...settings, name: e.target.value})}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
            <input
              type="number"
              value={settings.weight}
              onChange={(e) => setSettings({...settings, weight: parseInt(e.target.value) || 70})}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold mb-4">Daily Goal</h3>
        <input
          type="range"
          min="1000"
          max="5000"
          step="100"
          value={dailyGoal}
          onChange={(e) => setDailyGoal(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-blue-400">{convertUnit(dailyGoal)}</span>
        </div>
        <button
          onClick={() => {
            const recommended = Math.round(settings.weight * 32.5);
            setDailyGoal(recommended);
          }}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm transition-colors"
        >
          Use Weight-Based Recommendation
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold mb-4">Measurement Unit</h3>
        <div className="grid grid-cols-2 gap-2">
          {['ml', 'L', 'oz', 'cups'].map(unit => (
            <button
              key={unit}
              onClick={() => setSettings({...settings, unit})}
              className={`py-2 rounded-lg transition-colors ${
                settings.unit === unit 
                  ? 'bg-blue-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold mb-4">Reminders</h3>
        <div className="flex items-center justify-between mb-4">
          <span>Enable Reminders</span>
          <button
            onClick={() => setSettings({...settings, reminderEnabled: !settings.reminderEnabled})}
            className={`w-14 h-7 rounded-full transition-colors relative ${
              settings.reminderEnabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-1 ${
              settings.reminderEnabled ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>
        {settings.reminderEnabled && (
          <div className="text-sm text-gray-400">
            Reminders: {settings.reminderHours.start}:00 - {settings.
```jsx
reminderHours.end}:00
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold mb-4">Data Management</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              const data = localStorage.getItem('hydroNaijaData');
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'hydro-naija-backup.json';
              a.click();
            }}
            className="w-full bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 transition-colors"
          >
            📥 Export Data
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure? This will delete all your data!')) {
                localStorage.removeItem('hydroNaijaData');
                window.location.reload();
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 transition-colors"
          >
            🗑️ Reset All Data
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Hydro Naija 💧</h1>
              <p className="text-sm text-blue-200">Stay hydrated, stay healthy</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'tips' && <TipsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
          <div className="max-w-md mx-auto grid grid-cols-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`p-4 text-center transition-colors ${
                activeTab === 'home' ? 'text-blue-400 bg-gray-700' : 'text-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-xs">Home</div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`p-4 text-center transition-colors ${
                activeTab === 'stats' ? 'text-blue-400 bg-gray-700' : 'text-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xs">Stats</div>
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`p-4 text-center transition-colors ${
                activeTab === 'tips' ? 'text-blue-400 bg-gray-700' : 'text-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">💡</div>
              <div className="text-xs">Tips</div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-4 text-center transition-colors ${
                activeTab === 'settings' ? 'text-blue-400 bg-gray-700' : 'text-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">⚙️</div>
              <div className="text-xs">Settings</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HydroNaija;
