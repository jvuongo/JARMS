import styled from 'styled-components';
import { Typography, List, Skeleton, Avatar, Button, Space, Divider } from 'antd';
import {MessageOutlined, LikeOutlined, StarOutlined} from '@ant-design/icons';
import moment from 'moment';
import getToken from '@/lib/helpers/getToken';
import { useCookies } from 'react-cookie';
import FriendModal from '../friends/FriendModal';
import { useState } from 'react';

const { Title } = Typography;

interface Props {
	data: any;
}


const Container = styled.div``;

const FriendInviteCard = ({data} : Props) => {
	const [cookies] = useCookies(['userObj']);
	const [friendModalVisible, setFriendModalVisible] = useState(false)
	const [friendModalData, setFriendModalData] = useState();

	async function handleAccept() {
		await fetch('http://localhost:2102/friends/accept?from=' + data.from._id, {method: 'POST', headers: {
			'Authorization': `${getToken(cookies['userObj'])}`
		}})
		location.reload()

	}

	function handleDecline() {
		// Sending payload to endpoint to attach ticket to user
		fetch('http://localhost:2102/friends/decline?inviteId=' + data._id, {
			method: 'POST',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		});

		location.reload();
	}

	function showFriend(friend: any) {
		setFriendModalData(friend)
		setFriendModalVisible(true)
	}
	return (
		<>
		<List.Item
		actions={[<a onClick={() => {handleDecline()}}>Decline</a>, <Button type='primary' onClick={() => {handleAccept()}}>Accept</Button>]}
	  >
		  <List.Item.Meta
			avatar={<Avatar src={data.from?.avatar ?? "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png"} />}
			title={<a onClick={() => {showFriend(data.from)}}>{`${data.from.firstName} ${data.from.lastName}`}</a>}
			description="Sent you a friend request"
		  />

	  </List.Item>
	  <FriendModal visible={friendModalVisible} setModalVisibe={setFriendModalVisible} data={friendModalData} />

	  </>
	);
};

export default FriendInviteCard;
