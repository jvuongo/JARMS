import styled from 'styled-components';
import { Row, Col, Divider, Input, Button, Menu, Dropdown } from 'antd';
import { ShrinkOutlined, MessageOutlined, UserOutlined, DownOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getOrCreateChat, getChats } from 'react-chat-engine';
import { useCookies } from 'react-cookie';
import ChatEngine from './ChatEngine';

import getToken from '@/lib/helpers/getToken';
import { useRouter } from 'next/router';
// Cookies is where I can get user

/*
  Enlarged chat box
*/
const OpenedChatBox = styled.div`
	position: fixed;
	bottom: 0;
	right: 0;
	width: 40vw;
	min-width: 500px;
	height: 650px;
	max-height: 650px;
	background: ;
	z-index: 10;
`;

const Header = styled.div`
	height: 8%;
	background: #c43444;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-end;
	padding: 10px;
`;

/*
  Minimised chat box
*/
const MinimisedChatBox = styled(Row)`
	font-family: 'Lato', sans-serif;
	position: fixed;
	font-size: 1.4rem;
	display: flex;
	align-items: center;
	justify-content: space-around;
	bottom: 20px;
	right: 20px;
	width: 130px;
	padding: 0px 10px;
	height: 60px;
	background: #c43444;
	border-radius: 10px;
	cursor: pointer;
	color: white;

	:hover {
		background: #a32231;
	}
`;

const ChatBox = () => {
	const [cookies, removeCookie, setCookies] = useCookies(['userObj']);
	const [dataLoading, setDataLoading] = useState(false);

	// Chat engine api
	// Connecting to chat engine api
	useEffect(() => {
		if (cookies.userObj) {
			const requestOptions = {
				method: 'GET',
				headers: {
					'project-id': '8fbcf52f-2a40-47da-8bd1-4ae103e6fa4f',
					'user-name': cookies.userObj?.firstName + ' ' + cookies.userObj?.lastName,
					'user-secret': cookies.userObj?._id,
				},
			};

			fetch('https://api.chatengine.io/users/me', requestOptions)
				.then(() => {
					setDataLoading(false);
				})
				.catch(() => {
					console.log('Account not created within chat engine api!');
				});
		}
	}, []);

	// Use effect to get friends and populate chat list on window open
	const [chats, setChats] = useState<any[]>([]);
	useEffect(() => {
		const props = {
			projectID: '8fbcf52f-2a40-47da-8bd1-4ae103e6fa4f',
			userName: cookies.userObj?.firstName + ' ' + cookies.userObj?.lastName,
			userSecret: cookies.userObj?.email,
		};
		setDataLoading(true);
		const requestOptions = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		};
		fetch('http://localhost:2102/friends', requestOptions)
			.then((response) => response.json())
			.then((arrayOfFriends) => {
				arrayOfFriends.map((friendObj) => {
					getOrCreateChat(props, {
						is_direct_chat: true,
						usernames: [friendObj['firstName'] + ' ' + friendObj['lastName']],
					});
				});
			})
			.then(() => {

				getChats(props, (c) => {

					//let filteredChat = c.filter((friend) => !friend.admin.username.includes(props.username));
					setChats(c);
					setDataLoading(false);
				});
			});
	}, []);

	// Setting chats or initialising chats

	const router = useRouter();

	const [minimised, setMinimised] = useState(true);

	if (!cookies || !cookies.userObj) {
		return null;
	}

	if (!router.isReady) {
		return (
			<MinimisedChatBox onClick={(e) => setMinimised(false)}>
				Chat
				<MessageOutlined style={{ fontSize: '30px' }} />
			</MinimisedChatBox>
		);
	}

	return (
		<>
			<MinimisedChatBox style={{ display: `${minimised ? 'flex' : 'none'}` }} onClick={(e) => setMinimised(false)}>
				Chat
				<MessageOutlined style={{ fontSize: '30px' }} />
			</MinimisedChatBox>
			<OpenedChatBox style={{ display: `${minimised ? 'none' : 'block'}` }}>
				<Header>
					<ShrinkOutlined style={{ fontSize: '30px', color: 'white' }} onClick={(e) => setMinimised(true)} />
				</Header>
				<ChatEngine
					projectID={'8fbcf52f-2a40-47da-8bd1-4ae103e6fa4f'}
					userName={cookies.userObj?.firstName + ' ' + cookies.userObj?.lastName}
					userSecret={cookies.userObj?.email}
					chats={chats}
				/>
			</OpenedChatBox>
		</>
	);
};

export default ChatBox;
