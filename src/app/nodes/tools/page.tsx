'use client';

const tools = [
  { name: 'AI Writer Pro', desc: 'Generate high-quality articles, blog posts, and copy with advanced AI.', color: '#8b5cf6', cost: '5 tokens/use' },
  { name: 'Image Generator', desc: 'Create stunning images from text descriptions using diffusion models.', color: '#7c3aed', cost: '10 tokens/use' },
  { name: 'Data Analyzer', desc: 'Upload datasets and get AI-powered insights and visualizations.', color: '#6d28d9', cost: '8 tokens/use' },
  { name: 'Process Automator', desc: 'Automate repetitive tasks with AI-powered workflow builder.', color: '#5b21b6', cost: '15 tokens/use' },
  { name: 'Code Assistant', desc: 'Get help with coding, debugging, and code review.', color: '#4c1d95', cost: '3 tokens/use' },
  { name: 'Translation Engine', desc: 'Translate content across 50+ languages with context awareness.', color: '#3b0764', cost: '2 tokens/use' },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:bg-purple-900 dark:text-purple-300">Premium Node</span>
        <h1 className="text-3xl font-extrabold tracking-tight">AI & Digital Tools</h1>
        <p className="mt-2 text-zinc-500">Unlimited access to cutting-edge AI tools</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(tool => (
          <div key={tool.name} className="group rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${tool.color}15` }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={tool.color} strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <h3 className="mb-1 text-base font-bold">{tool.name}</h3>
            <p className="mb-3 text-sm leading-relaxed text-zinc-500">{tool.desc}</p>
            <span className="text-sm font-semibold" style={{ color: tool.color }}>{tool.cost}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
