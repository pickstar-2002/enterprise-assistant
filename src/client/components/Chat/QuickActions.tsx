import { useState } from 'react';

interface QuickActionsProps {
  onAction: (question: string) => void;
}

const quickQuestions = {
  hr: [
    { icon: '📅', question: '年假怎么计算？' },
    { icon: '💰', question: '社保公积金怎么交？' },
    { icon: '🎓', question: '试用期多久？' },
    { icon: '⏰', question: '怎么申请加班？' },
    { icon: '📈', question: '转正需要什么条件？' },
    { icon: '🏥', question: '病假怎么算？' },
  ],
  it: [
    { icon: '🌐', question: '电脑连不上网怎么办？' },
    { icon: '🖨️', question: '打印机坏了怎么报修？' },
    { icon: '🔐', question: '忘记密码怎么办？' },
    { icon: '📡', question: 'VPN怎么连接？' },
    { icon: '💻', question: 'Office软件打不开？' },
    { icon: '🔧', question: '电脑蓝屏了怎么办？' },
  ],
};

export default function QuickActions({ onAction }: QuickActionsProps) {
  const [category, setCategory] = useState<'hr' | 'it'>('hr');
  const questions = quickQuestions[category];

  return (
    <div className="space-y-3">
      {/* Category Toggle */}
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setCategory('hr')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            category === 'hr'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          HR 政策
        </button>
        <button
          onClick={() => setCategory('it')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            category === 'it'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          IT 支持
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-2">
        {questions.map((item, index) => (
          <button
            key={index}
            onClick={() => onAction(item.question)}
            className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span className="text-sm text-slate-700">{item.question}</span>
          </button>
        ))}
      </div>

      {/* Tip */}
      <p className="text-xs text-slate-400 text-center">点击问题快速咨询</p>
    </div>
  );
}
