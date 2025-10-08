import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { Decoration, ViewPlugin } from '@codemirror/view';
import { Link } from "react-router"

const mockDebugData = {
    code: `
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right); // ⚠️ Warning: Merge function not defined yet
}

mergeSort([5, 3, 8, 2]); // ❌ Error: ReferenceError: merge is not defined
  `,
    issues: [
        { line: 6, type: 'warning', message: 'Merge function not defined yet' },
        { line: 9, type: 'error', message: 'ReferenceError: merge is not defined' },
    ],
};

const detectLanguage = (code) => {
    if (/\b#include\b|std::|cout|cin/.test(code)) return 'cpp';
    if (/\bdef\b|print\(|import/.test(code)) return 'python';
    if (/\bclass\b|\bpublic\b|\bstatic\b|\bvoid\b/.test(code)) return 'java';
    return 'javascript';
};

const createLineDecorator = (issues) =>
    ViewPlugin.fromClass(
        class {
            constructor(view) {
                this.decorations = this.buildDecorations(view);
            }
            update(update) {
                if (update.docChanged) {
                    this.decorations = this.buildDecorations(update.view);
                }
            }
            buildDecorations(view) {
                const builder = [];
                issues.forEach((issue) => {
                    if (issue.line > view.state.doc.lines) return;
                    const line = view.state.doc.line(issue.line);
                    const deco = Decoration.line({
                        attributes: {
                            class: issue.type === 'error' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black',
                            title: issue.message,
                        },
                    });
                    builder.push(deco.range(line.from));
                });
                return Decoration.set(builder);
            }
        },
        {
            decorations: (v) => v.decorations,
        }
    );

export default function Debugger() {
    const [code, setCode] = useState(mockDebugData.code);
    const [language, setLanguage] = useState(javascript());
    const [loading, setLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        const detected = detectLanguage(code);
        if (detected === 'cpp') setLanguage(cpp());
        else if (detected === 'python') setLanguage(python());
        else if (detected === 'java') setLanguage(java());
        else setLanguage(javascript());
    }, [code]);

    const handleDebug = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 relative">
            <h1 className="text-4xl font-bold mb-6 text-lavender-400">Code Debugger</h1>

            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700">
                    <CodeMirror
                        value={code}
                        height="400px"
                        extensions={[language, createLineDecorator(mockDebugData.issues)]}
                        onChange={(value) => setCode(value)}
                        theme={oneDark}
                        basicSetup={{ lineNumbers: true }}
                    />
                    <button
                        onClick={handleDebug}
                        className="mt-4 w-full bg-lavender-400 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-lavender-300 transition"
                    >
                        Debug Code
                    </button>
                    <div className="mt-4 flex justify-end">
                        <Link
                            to="/"
                            className="bg-gray-700 text-lavender-400 font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                        >
                            Go to Analyzer
                        </Link>
                    </div>
                    {loading && <p className="mt-2 text-gray-300 animate-pulse">Debugging in progress...</p>}
                </div>

                <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-lavender-400">Fix Suggestions</h2>
                    <ul className="list-disc ml-5 space-y-2 text-gray-200">
                        {mockDebugData.issues.map((issue, idx) => (
                            <li key={idx}>
                                <strong>{issue.type.toUpperCase()}:</strong> {issue.message} (Line {issue.line})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {toastVisible && (
                <div className="fixed bottom-6 right-6 bg-lavender-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                    Debugging completed successfully!
                </div>
            )}
        </div>
    );
}
