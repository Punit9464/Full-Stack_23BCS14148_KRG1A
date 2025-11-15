import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, Decoration, ViewPlugin } from '@codemirror/view';
import { Compartment } from '@codemirror/state'; // ✅ NEW import
import { Link } from 'react-router';

// 🧠 Language Detection
const detectLanguage = (code) => {
  if (/\b#include\b|std::|cout|cin/.test(code)) return 'cpp';
  if (/\bdef\b|print\(|import/.test(code)) return 'python';
  if (/\bclass\b|\bpublic\b|\bstatic\b|\bvoid\b/.test(code)) return 'java';
  return 'javascript';
};

// 🪶 Line Decorator Plugin
const createLineDecorator = (issues = []) =>
  ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = this.buildDecorations(view);
      }
      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }
      buildDecorations(view) {
        const decos = [];
        if (!issues?.length) return Decoration.none;
        for (const issue of issues) {
          if (!issue.line || issue.line < 1 || issue.line > view.state.doc.lines) continue;
          const line = view.state.doc.line(issue.line);
          const cls =
            issue.type === 'error'
              ? 'dsaa-line-error'
              : issue.type === 'warning'
              ? 'dsaa-line-warning'
              : 'dsaa-line-info';
          decos.push(
            Decoration.line({
              attributes: { class: cls, title: issue.message || '' },
            }).range(line.from)
          );
        }
        return Decoration.set(decos);
      }
    },
    { decorations: (v) => v.decorations }
  );

// 🎨 Inject Highlight Styles (bypass Tailwind purge)
const styles = `
.dsaa-line-error { background-color: rgba(220,38,38,0.25); }
.dsaa-line-warning { background-color: rgba(245,158,11,0.25); }
.dsaa-line-info { background-color: rgba(99,102,241,0.15); }
`;
if (typeof document !== 'undefined' && !document.getElementById('dsaa-debug-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'dsaa-debug-styles';
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);
}

export default function Debugger() {
  const [code, setCode] = useState('');
  const [issues, setIssues] = useState([]);
  const [fixSuggestions, setFixSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const editorRef = useRef(null);

  // ✅ Compartments for dynamic reconfiguration
  const languageCompartment = useRef(new Compartment()).current;
  const decorCompartment = useRef(new Compartment()).current;

  // 🧠 Auto Language Detection
  const getLanguageExtension = (code) => {
    const detected = detectLanguage(code);
    if (detected === 'cpp') return cpp();
    if (detected === 'python') return python();
    if (detected === 'java') return java();
    return javascript();
  };

  // 🪄 Toast Notification
  const showToast = (msg, duration = 3000) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setToastMessage('');
    }, duration);
  };

  // ⚙️ Debug Handler (calls backend)
  const handleDebug = async () => {
    if (!code.trim()) {
      showToast('Please enter code before debugging.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: detectLanguage(code), errorMessage: '' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIssues(Array.isArray(data.issues) ? data.issues : []);
      setFixSuggestions(Array.isArray(data.fixSuggestions) ? data.fixSuggestions : []);
      showToast('Debugging completed successfully!');
    } catch (err) {
      console.error(err);
      showToast('Debug failed: ' + (err.message || 'Unknown error'), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update editor when issues change
  useEffect(() => {
    if (!editorRef.current?.view) return;
    const view = editorRef.current.view;

    // Reconfigure compartments dynamically
    view.dispatch({
      effects: [
        languageCompartment.reconfigure(getLanguageExtension(code)),
        decorCompartment.reconfigure(createLineDecorator(issues)),
      ],
    });
  }, [issues, code]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 relative">
      <h1 className="text-4xl font-bold mb-6 text-lavender-400">Code Debugger</h1>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        {/* Editor */}
        <div className="flex-1 bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700">
          <CodeMirror
            ref={editorRef}
            value={code}
            height="400px"
            extensions={[languageCompartment.of(getLanguageExtension(code)), decorCompartment.of(createLineDecorator(issues))]}
            onChange={(value) => setCode(value)}
            theme={oneDark}
            basicSetup={{ lineNumbers: true }}
          />

          <button
            onClick={handleDebug}
            disabled={loading}
            className={`mt-4 w-full font-semibold px-4 py-2 rounded-lg transition ${
              loading
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-lavender-400 text-gray-900 hover:bg-lavender-300'
            }`}
          >
            {loading ? 'Debugging...' : 'Debug Code'}
          </button>

          <div className="mt-4 flex justify-end">
            <Link
              to="/dashboard"
              className="bg-gray-700 text-lavender-400 font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Go to Analyzer
            </Link>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-lavender-400">Detected Issues</h2>
          {issues.length === 0 ? (
            <p className="text-gray-300">No issues detected yet. Run the debugger to analyze.</p>
          ) : (
            <ul className="list-disc ml-5 space-y-2 text-gray-200">
              {issues.map((issue, idx) => (
                <li key={idx}>
                  <strong>{(issue.type || 'info').toUpperCase()}:</strong> {issue.message}{' '}
                  {issue.line && <span className="text-gray-400">(Line {issue.line})</span>}
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-lg font-semibold mt-6 mb-3 text-lavender-400">Fix Suggestions</h3>
          {fixSuggestions.length === 0 ? (
            <p className="text-gray-300">No suggestions yet.</p>
          ) : (
            <ul className="list-disc ml-5 space-y-2 text-gray-200">
              {fixSuggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-lavender-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
