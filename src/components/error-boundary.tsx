"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2 text-destructive mb-4">
                        <AlertTriangle className="h-8 w-8" />
                        <h2 className="text-xl font-semibold">Something went wrong</h2>
                    </div>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                        An unexpected error occurred. This has been logged and we&apos;re working to fix it.
                    </p>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <details className="mb-6 w-full max-w-2xl">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                Error details (development only)
                            </summary>
                            <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                                {this.state.error.message}
                                {"\n\n"}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                    <Button onClick={this.handleRetry} className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4" />
                        <span>Try again</span>
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}