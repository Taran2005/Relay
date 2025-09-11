import { NavigationSidebar } from "@/components/navigation/navigation.sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full flex">
            <div className="hidden md:flex">
                <NavigationSidebar />
            </div>
            <main className="flex-1 md:pl-[72px] h-full overflow-auto">
                {children}
            </main>
        </div>
    );
}
