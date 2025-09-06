import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <SignUp
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-violet-600 hover:bg-violet-700 text-sm',
                        card: 'shadow-lg',
                    }
                }}
                forceRedirectUrl="/"
                signInUrl="/sign-in"
            />
        </div>
    );
}