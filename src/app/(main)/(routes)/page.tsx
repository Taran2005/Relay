import { ModeToggle } from '@/components/mode-toggle';
import { UserButton } from '@clerk/nextjs';


export default async function HomePage() {

  return (
    <div className="min-h-screen">
      <header className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-violet-600">Relay Dashboard</h1>

            <div className='p-0.5 flex items-center gap-4'>
              <ModeToggle />
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10'
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

