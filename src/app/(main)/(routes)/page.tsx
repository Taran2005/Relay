import { ModeToggle } from '@/components/mode-toggle';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';


export default async function HomePage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-violet-600">Relay Dashboard</h1>
            <ModeToggle />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10'
                }
              }}
              showName
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow px-6 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h2>
            <p className="text-gray-600 mb-6">
              This is your protected dashboard. Only authenticated users can see this content.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-violet-50 p-6 rounded-lg">
                <h3 className="font-semibold text-violet-800 mb-2">Email</h3>
                <p className="text-violet-600">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">User ID</h3>
                <p className="text-blue-600 text-sm font-mono">{user?.id}</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Joined</h3>
                <p className="text-green-600">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

