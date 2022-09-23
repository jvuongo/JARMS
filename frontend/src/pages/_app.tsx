/* eslint-disable @typescript-eslint/no-require-imports */
import '../styles/globals.css';
import Head from 'next/head';
import GlobalLayout from '../components/layouts/GlobalLayout';
import { AppProps } from 'next/app';
import React, { Children, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DefaultLayout from '../components/layouts/DefaultLayout';
import { Layout } from 'antd';
import type { NextPage } from 'next';
import { CookiesProvider, useCookies } from 'react-cookie';

// import 'antd/dist/antd.css';

require('../styles/variables.less');

type NextPageWithLayout = NextPage & {
	Layout?: React.ElementType;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

const { Content } = Layout;
function MyApp({ Component, pageProps }: AppPropsWithLayout) {
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState('');
	const router = useRouter();

	const [cookies] = useCookies(['userObj']);


	/*
		Checks if current path is /login
	*/
	function loginPageCheck() {
		const { asPath } = useRouter();

		if (asPath === '/login') {
			return true;
		} else {
			return false;
		}
	}

	const Layout = Component.Layout ?? DefaultLayout;

	/*
		If on login route do not show default layout.
	*/
	if (loginPageCheck()) {
		return (
			<>
				<Component {...pageProps} />
			</>
		);
	} 

	return (
		<>
			<Head>
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />
				<title>Meetic</title>
			</Head>
			<Head>
				<link
					rel="stylesheet"
					type="text/css"
					charSet="UTF-8"
					href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
				/>
				<link
					rel="stylesheet"
					type="text/css"
					href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
				/>
			</Head>
			<CookiesProvider>
				<GlobalLayout>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</GlobalLayout>
			</CookiesProvider>
		</>
	);


}

export default MyApp;
