import styled from 'styled-components';
import { Typography, List, Skeleton, Avatar, Button } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

interface Props {
	data: any;
	showFriend: any;
}

const Container = styled.div``;

const FriendCard = ({data, showFriend} : Props) => {
	return (
		<List.Item
		actions={[<Button type="primary" onClick={() => {showFriend(data)}}>View</Button>]}
	  >
		  <List.Item.Meta
			avatar={<Avatar src={data.avatar ?? "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png"} />}
			title={<a onClick={() => {showFriend(data)}}>{data.firstName}</a>}
			description={data.bio ?? "User has no status"}
		  />
	  </List.Item>
	);
};

export default FriendCard;
