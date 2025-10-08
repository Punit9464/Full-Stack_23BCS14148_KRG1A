import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { lintGutter, linter } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router'
import { java } from '@codemirror/lang-java';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const detectLanguage = (code) => {
  if (/\b#include\b|std::|cout|cin/.test(code)) return 'cpp';
  if (/\bdef\b|print\(|import/.test(code)) return 'python';
  return 'javascript';
};

const simpleLinter = (view) => {
  const diagnostics = [];
  const lines = view.state.doc.toString().split('\n');
  lines.forEach((line, i) => {
    if (line.includes('=='))
      diagnostics.push({
        from: view.state.doc.line(i + 1).from,
        to: view.state.doc.line(i + 1).to,
        severity: 'warning',
        message: 'Use === instead of == for strict equality.',
      });
    if (line.includes('TODO'))
      diagnostics.push({
        from: view.state.doc.line(i + 1).from,
        to: view.state.doc.line(i + 1).to,
        severity: 'info',
        message: 'Unresolved TODO found.',
      });
  });
  return diagnostics;
};

const mockReport = {
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Divide & Conquer',
  summary: 'This code sorts an array using the merge sort algorithm.',
  intuition: [
    'Understand the problem and the input array.',
    'Divide the array into two halves recursively.',
    'Sort each half independently.',
    'Merge the sorted halves carefully.',
    'The result is a fully sorted array.',
  ],
  suggestions: [
    'Try in-place merging to reduce space usage.',
    'For small datasets, iterative approaches may be faster.',
    'Avoid unnecessary array copies to optimize memory.',
  ],
  timeGraph: [10, 20, 40, 80, 160],
  spaceGraph: [5, 10, 15, 20, 25],
};

export default function Dashboard() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [showTime, setShowTime] = useState(true);
  const [language, setLanguage] = useState(javascript());

  useEffect(() => {
    const detected = detectLanguage(code);
    if (detected === 'cpp') setLanguage(cpp());
    else if (detected === 'python') setLanguage(python());
    else setLanguage(java());
  }, [code]);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setReport(mockReport);
    }, 2000);
  };

  const chartOptions = (yLabel) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'Input Size', color: '#e0d7f7' }, ticks: { display: false } },
      y: { title: { display: true, text: yLabel, color: '#e0d7f7' }, ticks: { display: false } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-lavender-400 drop-shadow-lg hover:text-lavender-300 transition-colors">
        DSA Code Analyzer
      </h1>

      <div className="w-full max-w-4xl bg-gray-800/80 p-5 rounded-2xl shadow-xl border border-lavender-400/20 backdrop-blur-sm hover:border-lavender-400/40 transition-all duration-300">
        <CodeMirror
          value={code}
          height="320px"
          extensions={[language, lintGutter(), linter(simpleLinter)]}
          onChange={(value) => setCode(value)}
          theme={oneDark}
          className="rounded-md shadow-lg"
        />
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleAnalyze}
            className="bg-lavender-400 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-lavender-300 transition"
          >
            Analyze Code
          </button>

          {/* Link to Debugger */}
          <Link
            to="/debug"
            className="bg-gray-700 text-lavender-400 font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Go to Debugger
          </Link>
        </div>
      </div>

      {loading && (
        <motion.div
          className="flex items-center mt-8 gap-3 text-lavender-300 text-lg"
          animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Loader2 className="animate-spin text-lavender-400" size={22} />
          Analyzing your code and generating report...
        </motion.div>
      )}

      <AnimatePresence>
        {report && !loading && (
          <motion.div
            key="report"
            className="w-full max-w-4xl mt-10 bg-gray-800/80 shadow-lg p-6 rounded-2xl border border-lavender-400/20 backdrop-blur-sm hover:border-lavender-400/40 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <h2 className="text-2xl font-semibold mb-5 text-lavender-400">Analysis Report</h2>

            <div className="flex justify-between text-lavender-300 mb-5">
              <div className="hover:text-lavender-400 transition-colors"><strong>Time Complexity:</strong> {report.timeComplexity}</div>
              <div className="hover:text-lavender-400 transition-colors"><strong>Space Complexity:</strong> {report.spaceComplexity}</div>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShowTime(true)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${showTime
                  ? 'bg-lavender-500 text-gray-900 shadow-lg'
                  : 'bg-gray-700 text-lavender-300 hover:bg-lavender-500 hover:text-gray-900'
                  }`}
              >
                Show Time Graph
              </button>
              <button
                onClick={() => setShowTime(false)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${!showTime
                  ? 'bg-lavender-500 text-gray-900 shadow-lg'
                  : 'bg-gray-700 text-lavender-300 hover:bg-lavender-500 hover:text-gray-900'
                  }`}
              >
                Show Space Graph
              </button>
            </div>

            <div className="flex justify-center mb-6 h-64 bg-gray-800/50 rounded-xl p-4 border border-lavender-400/10">
              {showTime ? (
                <Line
                  data={{
                    labels: ['1', '2', '3', '4', '5'],
                    datasets: [{ label: 'Time', data: report.timeGraph, backgroundColor: '#d8b4fe', borderColor: '#c4b5fd', borderWidth: 2 }]
                  }}
                  options={chartOptions('Time')}
                />
              ) : (
                <Bar
                  data={{
                    labels: ['1', '2', '3', '4', '5'],
                    datasets: [{ label: 'Space', data: report.spaceGraph, backgroundColor: '#d8b4fe', borderColor: '#c4b5fd', borderWidth: 2 }]
                  }}
                  options={chartOptions('Space')}
                />
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 rounded-lg hover:bg-gray-700/50 transition-all">
                <strong className="text-lavender-400">Summary:</strong>
                <p className="text-lavender-300">{report.summary}</p>
              </div>
              <div className="p-3 rounded-lg hover:bg-gray-700/50 transition-all">
                <strong className="text-lavender-400">Pattern:</strong>
                <p className="text-lavender-300">{report.pattern}</p>
              </div>
              <div className="p-3 rounded-lg hover:bg-gray-700/50 transition-all">
                <strong className="text-lavender-400">Intuition:</strong>
                <ul className="list-disc ml-5 text-lavender-300">
                  {report.intuition.map((point, idx) => (
                    <li key={idx} className="hover:text-lavender-400 transition-colors">{point}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg hover:bg-gray-700/50 transition-all">
                <strong className="text-lavender-400">Suggestions:</strong>
                <ul className="list-disc ml-5 text-lavender-300">
                  {report.suggestions.map((point, idx) => (
                    <li key={idx} className="hover:text-lavender-400 transition-colors">{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
