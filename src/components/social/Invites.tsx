import styled from 'styled-components';
import { Skeleton, Typography, List, Avatar, Button } from 'antd';
import EventInviteCard from './invites/EventInviteCard';
import FriendInviteCard from './invites/FriendInviteCard';
import AllInvitesModal from './invites/AllInvitesModal';
import { useState } from 'react';

const { Title } = Typography;

interface Props {
	invites: {
		events: any[];
		friends: any[];
	};
	loading: boolean;
}

const count = 3;

const Container = styled.div`
	width: 100%;
`;


const Invites = ({invites, loading}: Props) => {

	const events = invites?.events
	const friends = invites?.friends

	const showMore = events.length > 0 || friends.length > 0;

	const [isLoading, setLoading] = useState(false);

	if (loading) {
		return(<Skeleton active />)
	}
	return (
		<Container>
			<a style={{display: 'flex', alignItems: 'center'}}><Title level={2}>Invites <a style={{fontSize: '1.5rem'}}>({events?.length + friends?.length}){ showMore && <AllInvitesModal loading={isLoading} invites={invites ?? []}/>}</a></Title></a>
			<List
				className="demo-loadmore-list"
				size='default'
				loading={loading}
				itemLayout="horizontal"
				pagination={{
					pageSize:3,
					position: "bottom"
				  }}
			  >
			{
				invites?.events.length  > 0 && invites?.events.map((item) => (
					<EventInviteCard data={item} />
				))
			}

{
				invites?.friends.length > 0 && invites?.friends.map((item) => (
					<FriendInviteCard data={item} />
				))
			}
			</List>
            
            
		</Container>
	);
};

export default Invites;
