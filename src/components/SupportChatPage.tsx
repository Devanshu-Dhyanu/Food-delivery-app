import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Bot, Loader2, Send, Sparkles, UserRound } from 'lucide-react';
import { applyDefaultSeo, applySeo } from '../lib/seo';
import LandingFooter from './LandingFooter';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

const suggestionChips = [
  'Who is the founder?',
  'What is quantum computing?',
  'When was the company established?',
  'What job roles are open?',
  'Write a short welcome message',
] as const;

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome-message',
    role: 'assistant',
    content:
      'Hi, I am The Vajra support assistant. You can ask me general questions too, and if your question is about The Vajra I will use company-specific context when I answer.',
  },
];

export default function SupportChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    applySeo({
      title: 'Support | The Vajra',
      description:
        'Get support from The Vajra for delivery, platform, careers, founder, and general questions.',
      canonical: 'https://www.vajracognixia.in/support',
    });

    return () => {
      applyDefaultSeo();
    };
  }, []);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const submitMessage = async (rawMessage: string) => {
    const question = rawMessage.trim();

    if (!question || loading) {
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };

    const nextConversation = [...messages, nextUserMessage];
    setMessages(nextConversation);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          history: nextConversation.slice(-8).map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { reply?: string; error?: string }
        | null;

      if (!response.ok || !data?.reply) {
        throw new Error(data?.error || 'The support assistant could not respond right now.');
      }

      const reply = data.reply;

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The support assistant is temporarily unavailable.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage(input);
  };

  return (
    <>
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#2745b6_0%,_#10246f_35%,_#08153d_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/8 shadow-[0_30px_120px_rgba(2,8,23,0.55)] backdrop-blur">
        <div className="flex flex-col gap-6 border-b border-white/10 px-5 py-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-100/80 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to The Vajra
            </a>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
              <Sparkles size={14} />
              Support Chat
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
              Talk to Support
            </h1>
          </div>
        </div>

        <div className="grid flex-1 gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-white/10 bg-[#0a1745]/50 px-5 py-6 lg:border-b-0 lg:border-r lg:px-6">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                Ask About
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => void submitMessage(chip)}
                    className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-left text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/25 to-cyan-400/10 p-5">
              <p className="text-sm font-semibold text-white">Assistant focus</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-blue-100/80">
                <li>General questions and quick writing help</li>
                <li>The Vajra company, founder, careers, and launch details</li>
                <li>Company context takes priority for Vajra-specific answers</li>
              </ul>
            </div>
          </aside>

          <section className="flex min-h-[540px] flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
              {messages.map((message) => {
                const isAssistant = message.role === 'assistant';

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-300 text-slate-900 shadow-lg">
                        <Bot size={20} />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] rounded-[26px] px-5 py-4 text-sm leading-6 shadow-xl sm:text-base ${
                        isAssistant
                          ? 'rounded-bl-md bg-[#1768ff] text-white'
                          : 'rounded-br-md bg-[#df32d9] text-white'
                      }`}
                    >
                      {message.content}
                    </div>

                    {!isAssistant && (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-slate-900 shadow-lg">
                        <UserRound size={20} />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-end gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-300 text-slate-900 shadow-lg">
                    <Bot size={20} />
                  </div>
                  <div className="flex items-center gap-3 rounded-[26px] rounded-bl-md bg-[#1768ff] px-5 py-4 text-sm text-white shadow-xl">
                    <Loader2 size={18} className="animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-3xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <div ref={scrollAnchorRef} />
            </div>

            <div className="border-t border-white/10 bg-[#09163f]/80 px-5 py-5 sm:px-7">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask anything, or ask about The Vajra..."
                  className="h-14 flex-1 rounded-full border border-white/10 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-blue-100/50 focus:border-cyan-300/60"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send
                  <Send size={16} />
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
    <LandingFooter />
    </>
  );
}
