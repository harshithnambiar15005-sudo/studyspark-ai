import { useState } from "react";
import OpenAI from "openai";
import pdfToText from "react-pdftotext";
import ReactMarkdown from "react-markdown";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

function App() {
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePDFUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  try {
    const text = await pdfToText(file);
    setNotes(text);
  } catch (error) {
    console.error(error);
  }
}

  async function generateContent(type) {
    if (!notes) return;

    setLoading(true);
    setOutput("");

    let prompt = "";

    if (type === "summary") {
      prompt = `Summarize these notes clearly with headings and bullet points:

${notes}`;
    }

    if (type === "quiz") {
      prompt = `Create 5 MCQ quiz questions with answers from these notes:

${notes}`;
    }

    if (type === "flashcards") {
      prompt = `Create flashcards from these notes.

Format:
Q:
A:

${notes}`;
    }

    if (type === "simple") {
      prompt = `Explain these notes like I'm 12 years old:

${notes}`;
    }

    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
      });

      setOutput(chatCompletion.choices[0].message.content);
    } catch (err) {
      console.error(err);

      if (err.message.includes("429")) {
        setOutput("Rate limit exceeded. Please wait a moment and try again.");
      } else {
        setOutput(err.message);
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
            StudySpark AI
          </h1>
          <div className="flex justify-between items-center mb-10">
  <h1 className="text-3xl font-bold">StudySpark AI</h1>

  <div className="text-slate-400">
    AI-Powered Learning Assistant
  </div>
</div>

          <p className="text-slate-400 text-lg">
            Turn raw lecture notes into summaries, quizzes, flashcards and simplified explanations using AI.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
              ✓ AI-Powered Learning
            </div>

            <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
              ✓ Instant Summaries
            </div>

            <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
              ✓ Quiz Generation
            </div>

            <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
              ✓ Flashcard Creation
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">
              Paste Notes
            </h2>
<label className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 transition px-5 py-3 rounded-2xl cursor-pointer font-semibold mb-4">
  📄 Upload PDF Notes

  <input
    type="file"
    accept=".pdf"
    onChange={handlePDFUpload}
    className="hidden"
  />
</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your study notes here..."
              className="w-full h-[350px] bg-slate-950 border border-slate-700 rounded-2xl p-4 outline-none focus:border-blue-500 resize-none"
            />

            <div className="grid grid-cols-2 gap-4 mt-6">

  <button
    onClick={() =>
      setNotes(`
Machine learning is a branch of artificial intelligence that enables systems to learn from data and improve over time without explicit programming.
`)
    }
    className="w-full bg-orange-600 hover:bg-orange-500 hover:scale-105 transition-all duration-200 p-4 rounded-2xl font-semibold"
  >
    Load Demo Notes
  </button>

  <button
    disabled={loading}
    onClick={() => generateContent("summary")}
    className="w-full bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all duration-200 p-4 rounded-2xl font-semibold"
  >
    Generate Summary
  </button>

  <button
    disabled={loading}
    onClick={() => generateContent("quiz")}
    className="w-full bg-purple-600 hover:bg-purple-500 hover:scale-105 transition-all duration-200 p-4 rounded-2xl font-semibold"
  >
    Generate Quiz
  </button>

  <button
    disabled={loading}
    onClick={() => generateContent("flashcards")}
    className="w-full bg-cyan-600 hover:bg-cyan-500 hover:scale-105 transition-all duration-200 p-4 rounded-2xl font-semibold"
  >
    Flashcards
  </button>

  <button
    disabled={loading}
    onClick={() => generateContent("simple")}
    className="w-full bg-emerald-600 hover:bg-emerald-500 hover:scale-105 transition-all duration-200 p-4 rounded-2xl font-semibold col-span-2"
  >
    Explain Simply
  </button>

</div>
            
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold">
                AI Output
              </h2>

              {loading && (
                <div className="animate-pulse text-blue-400">
                  Generating...
                </div>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-2xl p-5 h-[500px] overflow-y-auto leading-8 text-slate-200 prose prose-invert max-w-none">
  {output ? (
    <ReactMarkdown>{output}</ReactMarkdown>
  ) : (
    "Your AI-generated content will appear here."
  )}
</div>

            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="mt-4 bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl"
            >
              Copy Output
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-10">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-semibold mb-2">
              AI Summaries
            </h3>

            <p className="text-slate-400">
              Convert lengthy notes into concise study material instantly.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-semibold mb-2">
              Quiz Generation
            </h3>

            <p className="text-slate-400">
              Practice using automatically generated MCQs.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-semibold mb-2">
              Flashcards
            </h3>

            <p className="text-slate-400">
              Create revision flashcards powered by AI.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-semibold mb-2">
              Simplified Learning
            </h3>

            <p className="text-slate-400">
              Understand difficult concepts in simpler language.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;