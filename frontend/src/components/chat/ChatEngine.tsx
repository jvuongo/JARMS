import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import { ChatEngineWrapper, Socket, ChatFeed } from 'react-chat-engine';
import ChatList from './ChatList';
import { Row, Col } from 'antd';

import styled from 'styled-components';

const ChatContainer = styled.div`
	width: 100%;
	height: 92%;
	background: white;

	.ce-chat-title-container {
		color: #c43444 !important;
	}

	.ce-message-timestamp {
		color: #c43444 !important;
	}

	.ce-their-message-timestamp {
		color: black !important;
	}

	.ce-my-message-bubble {
		background: #c43444 !important;
		color: white !important;
	}

	.ce-their-message-bubble {
		background: #d8d8d8 !important;
		color: black !important;
	}

	.ce-chat-unread-dot {
		background: #c43444 !important;
	}

	#ce-send-message-button {
		background-color: #c43444 !important;
	}
`;

const ChatFeedBox = styled.div`
	overflow-x: hidden;
	height: 550px;
`;

const ChatEngine = (props) => {
	const [cookies, removeCookie, setCookies] = useCookies(['userObj']);

	return (
		<ChatContainer>
			<ChatEngineWrapper>
				<Socket projectID={props.projectID} userName={props.userName} userSecret={props.userSecret} />
				<Row style={{ height: '100%' }}>
					<Col span={8} style={{ background: 'white', overflow: 'auto', height: '100%' }}>
						<ChatList
							projectID={props.projectID}
							userName={props.userName}
							userSecret={props.userSecret}
							chats={props.chats}
						/>
					</Col>
					<Col span={16}>
						<ChatFeedBox>
							<ChatFeed />
						</ChatFeedBox>
					</Col>
				</Row>
			</ChatEngineWrapper>
		</ChatContainer>
	);
};

export default ChatEngine;

// When user opens messenger for the first time we populate it with all their friends
// - important detail, what is going to be user name?
// have a search bar
