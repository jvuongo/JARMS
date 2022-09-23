import Image from 'next/image';
import {
	AuditOutlined,
	CalendarOutlined,
	DownOutlined,
	HomeOutlined,
	TeamOutlined,
	UserOutlined,
} from '@ant-design/icons';
import MeeticLogo from '@/public/meetic_logo.svg';
import userImage from '@/public/blank_profile_image.png';
import { useRouter } from 'next/router';
import { Avatar, Menu, Layout, Dropdown, Space, Button, Skeleton } from 'antd';
import styled from 'styled-components';
import { TABLET_BREAKPOINT } from '@/lib/utils/constants';
import { LayoutProps } from 'antd/lib/layout';
import { useCookies } from 'react-cookie';
import logoutHandlerFactory from '@auth0/nextjs-auth0/dist/auth0-session/handlers/logout';
import { useCallback, useEffect, useState } from 'react';
import LoadingScreen from '../LoadingScreen';
import _ from 'lodash';

const { Header: AntHeader } = Layout;

const Container = styled(AntHeader)<LayoutProps>`
	display: flex;
	align-items: center;
	position: fixed;
	z-index: 999;
	width: 100%;
	justify-content: space-between;

	.ant-menu-horizontal {
		border-bottom: none;
	}

	.ant-menu {
		height: 100% !important;
	}

	.ant-menu-item {
		height: 100% !important;
	}

	@media (max-width: ${TABLET_BREAKPOINT}${'px'}) {
		.header {
			display: none;
		}
	}
`;

const LogoContainer = styled.div`
	height: 100%;
	display: flex;
	width: 200px;
	justify-content: center;
	align-items: center;
`;

const RightMenu = styled.div`
	display: flex;
	height: 100%;
	padding: 0px 40px;
	align-items: center;

	.ant-menu {
		color: grey;
	}

	.ant-menu-item {
		border-bottom: none;
	}

	.ant-menu-item :hover {
		color: #871b25;
	}

	.right_menu_icon {
		color: grey;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		margin: 0px 5px;
		height: 100%;
	}
`;

const IconContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	line-height: 1;
	padding-top: 6px;
	color: inherit;

	span {
		margin: 3px 10px;
	}
`;

const LoadingContainer = styled.div`
	width: 100vw;
	height: 100vh;
	background: white;
	position: absolute;
	left: 0;
	top: 0;
`;

const userMenu = (logout) => (
	<Menu style={{ position: 'relative', bottom: '8px', borderRadius: '10px' }}>
		<Menu.Item style={{ height: '40px', padding: '20px' }} key="1">
			<a href="/account/settings">Account</a>
		</Menu.Item>
		<Menu.Divider />
		<Menu.Item onClick={logout} style={{ height: '40px', padding: '20px' }} key="3">
			Logout
		</Menu.Item>
	</Menu>
);

const AppHeader = () => {
	// Check cookies, if none then show sign in button, else show the drop down.
	const [cookies, removeCookie, setCookies] = useCookies(['userObj']);
	const [showLoading, setShowLoading] = useState(false);
	const [userData, setUserData] = useState();

	const router = useRouter();

	useEffect(() => {
		console.log('cooookies change header', cookies);
		if (_.isEmpty(cookies.userObj)) {
			console.log('empty');
			setUserData(undefined);
		} else {
			console.log('not empty');
			setUserData(cookies?.userObj);
		}
	}, [cookies]);

	if (!cookies) {
		return <Skeleton active />;
	}


	// Sign in btn reroute
	function signIn() {
		router.push('/login');
	}

	// User is logged out by removing cookies
	function logout() {
		setShowLoading(true);
		setTimeout(() => {
			if (cookies) {
				const data = [];
				document.cookie = 'userObj=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
			}
			setShowLoading(false);
			router.push('/login');
			// document.cookie = 'userObj=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		}, 1000);
	}

	const page = router.pathname.substring(1).split('/')[0];
	//console.log((cookies['userObj']['_id']));

	const pageKey = {
		home: '1',
		tickets: '2',
		host: '3',
		social: '4',
	};

	return (
		<Container>
			<LogoContainer>
				<a href="/" style={{ height: 40 }}>
					<Image src={MeeticLogo} alt={'Meetic'} width={145} height={40} />
				</a>
			</LogoContainer>

			<RightMenu>
				<Menu
					style={{ width: 'fit-content', position: 'relative' }}
					mode="horizontal"
					disabledOverflow
					defaultSelectedKeys={pageKey[page]}
				>
					{userData ? (
						<>
							<Menu.Item key="1" onClick={() => router.push('/')}>
								<IconContainer>
									<HomeOutlined style={{ fontSize: '20px' }} />
									<span>Home</span>
								</IconContainer>
							</Menu.Item>
							<Menu.Item key="2" onClick={() => router.push('/tickets')}>
								<IconContainer>
									<AuditOutlined style={{ fontSize: '20px' }} />
									<span>My Tickets</span>
								</IconContainer>
							</Menu.Item>

							<Menu.Item key="3" onClick={() => router.push('/host')}>
								<IconContainer>
									<CalendarOutlined style={{ fontSize: '20px' }} />
									<span>Organise</span>
								</IconContainer>
							</Menu.Item>
							<Menu.Item key="4" onClick={() => router.push('/social')}>
								<IconContainer>
									<TeamOutlined style={{ fontSize: '20px' }} />
									<span>Social</span>
								</IconContainer>
							</Menu.Item>
						</>
					) : null}
				</Menu>
				{userData ? (
					<Dropdown overlay={userMenu(logout)} trigger={['click']}>
						<a className="right_menu_icon">
                            <Avatar
								size={42}
								src={
									cookies['userObj'].avatar ??
									'https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png'
								}
							/>
							<span style={{ margin: '0px 8px' }}>{userData.firstName + ' ' + userData.lastName}</span>
							<DownOutlined style={{ fontSize: '10px' }} />
						</a>
					</Dropdown>
				) : (
					<Button onClick={signIn} type="primary">
						Sign In
					</Button>
				)}
			</RightMenu>
			{showLoading && (
				<LoadingContainer>
					<LoadingScreen />
				</LoadingContainer>
			)}
		</Container>
	);
};

export default AppHeader;
