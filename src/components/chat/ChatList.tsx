import React, { useState, useEffect, useContext } from 'react';
import { ChatCard, ChatEngineContext } from 'react-chat-engine';
import { Input, Skeleton } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const ChatList = (props) => {
	const [filteredChats, setFilteredChats] = useState<any[]>([]);
	const [search, setSearch] = useState('');
	const [dataLoading, setDataLoading] = useState(false);
	const [allChats, setAllChats] = useState(props.chats);
	const { chats } = useContext(ChatEngineContext);

	useEffect(() => {
		if (chats) {
			const arrayChats = Object.values(chats);
			if (Array.isArray(arrayChats) && arrayChats.length > 0) {
				setAllChats(arrayChats);
			}
		}
	}, [chats]);

	// Set loading screen
	useEffect(() => {

		setDataLoading(true);
		setTimeout(() => {
			setDataLoading(false);
		}, 1000);
	}, []);

	useEffect(() => {
		let searchChats = props.chats;
		searchChats = allChats.filter((chat) => {
			// person array within friend
			// annoying as theres no explicit field of who is the other (non user) account

			let nonUserAccObj = chat.people.find((user) => user.person.username !== props.userName);

			if (nonUserAccObj.person.username.includes(search)) {
				return chat;
			}
			// // If user searches based on first name and last name
			else if (nonUserAccObj.person.first_name.toLowerCase().includes(search)) {
				return chat;
			} else if (nonUserAccObj.person.last_name.toLowerCase().includes(search)) {
				return chat;
			}
		});

		setFilteredChats(searchChats);
	}, [search]);

	return (
		<>
			<Input
				placeholder="Search for chats"
				prefix={<UserOutlined />}
				onChange={(input) => setSearch(input.target.value.toLowerCase())}
				style={{ padding: '10px 5px' }}
				bordered={false}
			/>
			{dataLoading ? (
				<Skeleton active />
			) : (
				<div>
					{search.length <= 0
						? allChats.map((friend) => <ChatCard chat={friend} key={friend.id} />)
						: filteredChats.map((friend) => <ChatCard chat={friend} key={friend.id} />)}
				</div>
			)}
		</>
	);
};

export default ChatList;
