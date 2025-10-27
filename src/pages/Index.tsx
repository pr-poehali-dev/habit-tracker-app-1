import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completedDates: string[];
}

const ICON_OPTIONS = ['Droplets', 'Dumbbell', 'Book', 'Moon', 'Coffee', 'Footprints', 'Apple', 'Smile'];
const COLOR_OPTIONS = ['#F2FCE2', '#E5DEFF', '#FDE1D3', '#D3E4FD', '#FFDEE2', '#FEF7CD', '#FEC6A1'];
const STORAGE_KEY = 'habit_tracker_data';

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getTodayString = (): string => {
  return formatDate(new Date());
};

const getLast14Days = (): string[] => {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(formatDate(date));
  }
  return days;
};

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Droplets');
  const [selectedColor, setSelectedColor] = useState('#D3E4FD');

  const today = getTodayString();
  const last14Days = getLast14Days();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHabits(parsed);
      } catch (e) {
        console.error('Failed to load habits:', e);
      }
    } else {
      const demoHabits: Habit[] = [
        { id: '1', name: 'Пить воду', icon: 'Droplets', color: '#D3E4FD', completedDates: [last14Days[10], last14Days[11], last14Days[12], last14Days[13]] },
        { id: '2', name: 'Зарядка', icon: 'Dumbbell', color: '#F2FCE2', completedDates: [last14Days[11], last14Days[12], last14Days[13]] },
        { id: '3', name: 'Читать книгу', icon: 'Book', color: '#E5DEFF', completedDates: [last14Days[12], last14Days[13]] },
      ];
      setHabits(demoHabits);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoHabits));
    }
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits]);

  const toggleDate = (habitId: string, dateString: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(dateString);
        const newCompletedDates = isCompleted
          ? habit.completedDates.filter(d => d !== dateString)
          : [...habit.completedDates, dateString];
        return { ...habit, completedDates: newCompletedDates };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      icon: selectedIcon,
      color: selectedColor,
      completedDates: [],
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setSelectedIcon('Droplets');
    setSelectedColor('#D3E4FD');
    setIsAddDialogOpen(false);
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const calculateStreak = (completedDates: string[]) => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = [...completedDates].sort().reverse();
    let streak = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = formatDate(currentDate);
      
      if (sortedDates[i] === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateSuccessRate = () => {
    if (habits.length === 0) return 0;
    const totalPossible = habits.length * 14;
    const totalCompleted = habits.reduce((sum, habit) => {
      return sum + habit.completedDates.filter(d => last14Days.includes(d)).length;
    }, 0);
    return Math.round((totalCompleted / totalPossible) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 md:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">Цепочка Привычек</h1>
              <p className="text-sm md:text-base text-gray-600">Формируйте полезные привычки каждый день</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full h-12 w-12 md:h-14 md:w-14 shadow-lg hover-scale flex-shrink-0">
                  <Icon name="Plus" size={24} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Новая привычка</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="habit-name">Название</Label>
                    <Input
                      id="habit-name"
                      placeholder="Например: Медитация"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Иконка</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {ICON_OPTIONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setSelectedIcon(icon)}
                          className={`p-3 rounded-lg border-2 transition-all hover-scale ${
                            selectedIcon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}
                        >
                          <Icon name={icon} size={24} className="mx-auto text-gray-700" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Цвет</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {COLOR_OPTIONS.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`h-10 rounded-lg border-2 transition-all hover-scale ${
                            selectedColor === color ? 'border-purple-500 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button onClick={addHabit} className="w-full" size="lg">
                  Создать привычку
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-lg">
            <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-purple-600">{calculateSuccessRate()}%</div>
                <div className="text-xs md:text-sm text-gray-600">Успех</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  {habits.reduce((max, h) => Math.max(max, calculateStreak(h.completedDates)), 0)}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Серия</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-blue-600">{habits.length}</div>
                <div className="text-xs md:text-sm text-gray-600">Привычек</div>
              </div>
            </div>
          </Card>
        </header>

        <div className="space-y-4">
          {habits.map((habit, index) => (
            <Card
              key={habit.id}
              className="p-4 md:p-6 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div
                  className="p-2 md:p-3 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                >
                  <Icon name={habit.icon} size={24} className="text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 truncate">{habit.name}</h3>
                  <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Icon name="Flame" size={14} className="text-orange-500" />
                      {calculateStreak(habit.completedDates)} дней
                    </span>
                    <span>
                      {habit.completedDates.filter(d => last14Days.includes(d)).length}/14
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={habit.completedDates.includes(today) ? 'default' : 'outline'}
                    className={`rounded-full h-10 w-10 md:h-12 md:w-12 transition-all ${
                      habit.completedDates.includes(today) ? 'animate-scale-in' : 'hover-scale'
                    }`}
                    onClick={() => toggleDate(habit.id, today)}
                  >
                    {habit.completedDates.includes(today) ? (
                      <Icon name="Check" size={20} />
                    ) : (
                      <Icon name="Plus" size={20} />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full h-10 w-10 md:h-12 md:w-12 hover-scale text-gray-400 hover:text-red-500"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1">
                {last14Days.map((dateString, idx) => {
                  const isCompleted = habit.completedDates.includes(dateString);
                  const isCurrent = dateString === today;
                  const date = new Date(dateString);
                  const dayNum = date.getDate();

                  return (
                    <button
                      key={dateString}
                      onClick={() => toggleDate(habit.id, dateString)}
                      className={`aspect-square rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center ${
                        isCompleted
                          ? 'scale-105 shadow-sm'
                          : isCurrent
                          ? 'border-2 border-purple-400'
                          : 'hover-scale opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isCompleted ? habit.color : 'transparent',
                        borderColor: isCurrent && !isCompleted ? '#a855f7' : 'transparent',
                        color: isCompleted ? '#374151' : '#9ca3af',
                      }}
                    >
                      {isCompleted ? <Icon name="Check" size={12} className="mx-auto" /> : <span className="text-[10px]">{dayNum}</span>}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}

          {habits.length === 0 && (
            <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
              <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Начните свой путь к успеху
              </h3>
              <p className="text-gray-600 mb-6">
                Добавьте первую привычку и начните строить цепочку успеха
              </p>
              <Button size="lg" onClick={() => setIsAddDialogOpen(true)}>
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить привычку
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;