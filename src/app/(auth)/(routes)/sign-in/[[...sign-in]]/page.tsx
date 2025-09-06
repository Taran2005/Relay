import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <SignIn
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-violet-600 hover:bg-violet-700 text-sm',
                        card: 'shadow-lg',
                    }
                }}
                forceRedirectUrl="/"
                signUpUrl="/sign-up"
            />
        </div>
    );
}
