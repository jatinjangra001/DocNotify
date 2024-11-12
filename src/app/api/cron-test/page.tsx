// // src/app/api/cron-test/page.tsx
// 'use client';

// import { useState } from 'react';

// export default function TestCronPage() {
//     const [result, setResult] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const testCron = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await fetch('/api/test-cron', {
//                 headers: {
//                     'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET_KEY || ''}`
//                 }
//             });
//             const data = await response.json();
//             setResult(data);
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'An error occurred');
//         }
//         setLoading(false);
//     };

//     return (
//         <div className="p-8">
//             <h1 className="text-2xl font-bold mb-4">Test Cron Job</h1>
//             <button
//                 onClick={testCron}
//                 disabled={loading}
//                 className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
//             >
//                 {loading ? 'Testing...' : 'Test Cron Job Now'}
//             </button>

//             {error && (
//                 <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
//                     {error}
//                 </div>
//             )}

//             {result && (
//                 <div className="mt-4 p-4 bg-gray-100 rounded">
//                     <h2 className="font-bold mb-2">Results:</h2>
//                     <pre className="whitespace-pre-wrap">
//                         {JSON.stringify(result, null, 2)}
//                     </pre>
//                 </div>
//             )}
//         </div>
//     );
// }


'use client';

import { useState } from 'react';

interface TestResult {
    success: boolean;
    message?: string;
    details?: {
        emailsSent: number;
        processedUsers: number;
        errorCount: number;
        errors: string[];
    };
    error?: string;
}

export default function TestCronPage() {
    const [result, setResult] = useState<TestResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testCron = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/test-cron', {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Cron Job</h1>
            <button
                onClick={testCron}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {loading ? 'Testing...' : 'Test Cron Job Now'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h2 className="font-bold mb-2">Results:</h2>
                    <div className="space-y-2">
                        <p>Status: {result.success ? 'Success' : 'Failed'}</p>
                        {result.message && <p>Message: {result.message}</p>}
                        {result.details && (
                            <>
                                <p>Emails Sent: {result.details.emailsSent}</p>
                                <p>Users Processed: {result.details.processedUsers}</p>
                                <p>Errors: {result.details.errorCount}</p>
                                {result.details.errors.length > 0 && (
                                    <div>
                                        <p className="font-bold">Error Details:</p>
                                        <ul className="list-disc pl-5">
                                            {result.details.errors.map((err, index) => (
                                                <li key={index}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}