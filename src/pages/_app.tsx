import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
        {/* Example: simple container */}
        <div className="p-3">
            <Component {...pageProps} />
        </div>
        </>
    );
}
