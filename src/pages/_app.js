import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid SSR rendering

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <div>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="Find travel buddies for your next adventure" />
          </Head>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default MyApp;