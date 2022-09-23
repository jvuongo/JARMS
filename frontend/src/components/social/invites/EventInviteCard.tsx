import styled from 'styled-components';
import { Typography, List, Skeleton, Avatar, Button, Space, Divider } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useRouter } from 'next/router';
import UserModal from '@/components/user/UserModal';
import { useState } from 'react';
import getToken from '@/lib/helpers/getToken';
import { useCookies } from 'react-cookie';

const { Title } = Typography;

interface Props {
	data: any;
}

const Container = styled.div``;

const EventInviteCard = ({ data }: Props) => {
	const [cookies] = useCookies(['userObj']);
	const router = useRouter();

	if (!data.event) {
		return null;
	}

	async function handleAccept() {
		await fetch('http://localhost:2102/event/accept?from=' + data.from._id, {method: 'POST', headers: {
			'Authorization': `${getToken(cookies['userObj'])}`
		}})
	}

	const [userModalVisible, setUserModalVisible] = useState(false);
	const [userModalData, setUserModalData] = useState();

	function showUser(user: any) {
		setUserModalData(user);
		setUserModalVisible(true);
	}

	function handleDecline() {
		// Sending payload to endpoint to attach ticket to user
		fetch('http://localhost:2102/event/decline?inviteId=' + data._id, {
			method: 'POST',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		});

		location.reload();
	}

	return (
		<>
			<List.Item
				style={{ position: 'relative', height: '120px', paddingBottom: '40px' }}
				actions={[
					<a
						key="list-loadmore-edit"
						onClick={() => {
							handleDecline();
						}}
					>
						Decline
					</a>,
					<Button
						type="primary"
						onClick={() => {
							handleAccept()
							router.push(`/event/${data.event?._id}`);
						}}
					>
						View
					</Button>,
				]}
				extra={
					<div style={{ position: 'absolute', bottom: 10, left: 48, color: 'rgba(0, 0, 0, 0.65)' }}>
						{data.event.title}
						<Divider type="vertical" />
						{moment(data.event.startDate).format('DD/MM/YYYY')} - {moment(data.event.endDate).format('DD/MM/YYYY')}
						<Divider type="vertical" />
						{`${data.event.attendees.length} Going`}
					</div>
				}
			>
				<List.Item.Meta
					avatar={
						<Avatar
							src={
								data.from?.avatar ??
								'https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png'
							}
						/>
					}
					title={
						<a
							onClick={() => {
								showUser(data.from);
							}}
						>{`${data.from.firstName} ${data.from.lastName}`}</a>
					}
					description="Invited you to an event"
				/>
			</List.Item>
			<UserModal visible={userModalVisible} setModalVisibe={setUserModalVisible} data={userModalData} />
		</>
	);
};

export default EventInviteCard;
