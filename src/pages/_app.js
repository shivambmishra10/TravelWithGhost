import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid SSR rendering

  return (
    <AuthProvider>
    <div>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Find travel buddies for your next adventure" />
      </Head>
      <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp;