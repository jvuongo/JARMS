import styled from 'styled-components';
import { Skeleton, Typography, List, Avatar, Button, Popover } from 'antd';
import FindFriendCard from './findFriends/FindFriendCard';
import { InfoCircleFilled } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useState } from 'react';
import UserModal from '../user/UserModal';

const { Title } = Typography;

interface Props {
	friends: any[];
	loading: boolean;
}

const count = 3;

const Container = styled.div`
	width: 100%;
`;

const content = (
	<div>
	  <Title level={5}>Meetic recommends friends based on:</Title>
	  <a style={{color: '#C43444'}}>❶</a> Common interested event types.
	  <p></p><a style={{color: '#C43444'}}>❷</a> Common previously attended events.
	  <p></p><a style={{color: '#C43444'}}>❸</a> Mutual friends.
	</div>
);

const FindFriends = ({friends, loading}: Props) => {
	const [userModalVisible, setUserModalVisible] = useState(false)
	const [userModalData, setUserModalData] = useState();

	function showUser(user: any) {
		setUserModalData(user)
		setUserModalVisible(true)
	}	

	if (loading) {
		return(<Skeleton active />)
	}
	return (
		<Container>
			<a style={{display: 'flex', alignItems: 'center', margin: '20px 0px 15px 0px'}}><Title level={2}>Find Friends <a style={{fontSize: '1.5rem'}}></a><Popover content={content}><InfoCircleFilled style={{ fontSize: '24px', color: '#C43444' }}/> </Popover></Title></a>

			{
				friends.length === 0 ?                         <Paragraph italic style={{marginTop: "20px", color: "#555555"}}>You have no friend suggestions right now :(</Paragraph>
				: 
				<List
				size='default'
				loading={loading}
				grid={{gutter: 64, column: 2}}
				itemLayout="horizontal"
				dataSource={friends.slice(0,4)}
				renderItem={item => (
					<FindFriendCard data={item} showUser={showUser} />
				)}
			  />
			}
         	<UserModal visible={userModalVisible} setModalVisibe={setUserModalVisible} data={userModalData} />   
		</Container>
	);
};

export default FindFriends;
