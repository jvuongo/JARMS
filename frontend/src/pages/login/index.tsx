import MeeticLogo from '@/public/meetic_logo.svg';
import Image from 'next/image';
import styled from 'styled-components';
import { BiCalendarAlt } from 'react-icons/bi';
import { Button, Result } from 'antd';
import { useEffect, useState } from 'react';
import MultiForm from '@/components/signIn/MultiForm';
import { useRouter } from 'next/router';
import { ArrowLeftOutlined } from '@ant-design/icons';

const PageContainer = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: flex;
	justify-content: center;
	align-items: center;
	font-family: 'Lato', sans-serif;

	background: linear-gradient(
		90deg,
		rgba(138, 49, 216, 1) 0%,
		rgba(236, 108, 108, 1) 25%,
		rgba(138, 49, 216, 1) 50%,
		rgba(206, 101, 59, 1) 75%,
		rgba(196, 52, 68, 1) 100%
	);
	background-size: 400%;
	animation: animate 20s ease infinite;

	@keyframes animate {
		0% {
			background-position: 0%;
		}
		50% {
			background-position: 100%;
		}
		100% {
			background-position: 0%;
		}
	}
`;

const LoginBox = styled.div`
	padding: 1%;
	width: 40vw;
	height: 93vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const TitleBox = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 40%;
	height: 15%;
	font-size: 2em;
	font-weight: bold;
	letter-spacing: -1px;
`;

const HomeButton = styled(Button)`
	position: fixed !important;
	top: 0;
	left: 0;
	margin: 1%;
	border-radius: 10px !important;
	display: flex;
	justify-content: center;
	align-items: center;
	background: linear-gradient(to right bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
	letter-spacing: -1px;
`;

const Login = () => {
	const [data, setData] = useState();
	const [isLoading, setLoading] = useState(false);

	const router = useRouter();

	// useEffect(() => {
	// 	// While waiting for the server to send the data, show a loading message
	// 	setLoading(true);
	// 	fetch('http://localhost:2102/social', {method: 'GET', headers: {
	// 		'Authorization': `ewogICAiX2lkIjp7CiAgICAgICIkb2lkIjoiNjIzOTgyOTY5YTlmM2IyMmUyYTg0N2EwIgogICB9LAogICAiZmlyc3ROYW1lIjoiSm9lIiwKICAgImxhc3ROYW1lIjoiTWFtYSIsCiAgICJhZ2UiOjIxLAogICAiZW1haWwiOiJqb2VAbWFpbC5jb20iLAogICAicGFzc3dvcmQiOiIkMmIkMTAkSTVuWXMwUXZjb1RZM1JZUUxkQlo3dWtTR2ZwVml2cDROeloxNDlLeHVkTDNiVzhjTlJadHEiLAogICAidGlja2V0cyI6WwogICAgICAKICAgXSwKICAgImZyaWVuZHMiOlsKICAgICAgewogICAgICAgICAiJG9pZCI6IjYyMzk4Mjk2OWE5ZjNiMjJlMmE4NDc5NCIKICAgICAgfSwKICAgICAgewogICAgICAgICAiJG9pZCI6IjYyMzk4Mjk2OWE5ZjNiMjJlMmE4NDc5OCIKICAgICAgfSwKICAgICAgewogICAgICAgICAiJG9pZCI6IjYyMzk4Mjk2OWE5ZjNiMjJlMmE4NDc5YSIKICAgICAgfSwKICAgICAgewogICAgICAgICAiJG9pZCI6IjYyMzk4Mjk2OWE5ZjNiMjJlMmE4NDc5YyIKICAgICAgfSwKICAgICAgewogICAgICAgICAiJG9pZCI6IjYyMzk4Mjk2OWE5ZjNiMjJlMmE4NDc5ZSIKICAgICAgfQogICBdLAogICAiX192IjowCn0=`
	// 	}})
	// 		// The response is a JSON object, so we can use .json() to parse it
	// 		.then((res) => res.json())
	// 		// Set the data to the parsed JSON object
	// 		.then((data) => {
	// 			console.log('SOCIAL', data);
	// 			setData(data);
	// 			setLoading(false);
	// 		}).catch(
	// 			(error) => {
	// 				return(  <Result
	// 					status="403"
	// 					title="403"
	// 					subTitle="Sorry, you are not authorized to access this page."
	// 					extra={<Button type="primary" onClick={() => {router.push('/login')}}>Login</Button>}
	// 				  />)
	// 			}
	// 		);
	// }, []);

	function returnHome() {
		void router.push('/');
	}

	return (
		<PageContainer>
			<HomeButton
				prefix={<ArrowLeftOutlined />}
				style={{
					fontFamily: 'lato',
					fontSize: '1.2rem',
					display: 'flex',
					height: '40px',
					alignItems: 'center',
					justifyContent: 'center',
				}}
				onClick={returnHome}
			>
				<span>Continue as Guest</span>
			</HomeButton>
			<LoginBox>
				{/* <Image src={MeeticLogo} alt={'Meetic'} width={145} height={40} /> */}
				<TitleBox>
					<BiCalendarAlt color="black" size={50} />
					Welcome to Meetic
				</TitleBox>
				<MultiForm />
			</LoginBox>
		</PageContainer>
	);
};

export default Login;
