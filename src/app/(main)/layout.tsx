import Sidebar from '@/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col w-full relative pt-[52px] md:pt-0">
        {children}
      </main>
    </div>
  );
}
