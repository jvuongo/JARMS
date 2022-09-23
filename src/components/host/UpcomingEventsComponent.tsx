import HostLayout from '@/components/layouts/HostLayout';
import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Skeleton, Popconfirm } from 'antd';
import { useRouter } from 'next/router';
import { StringNullableChain } from 'lodash';
import ReviewModal from '@/components/review/ReviewModal';
import moment from 'moment';
import { Base64 } from 'js-base64';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import BroadcastModal from './BroadcastModal';

interface EventType {
	_id: string;
	location: string;
	host: string;
	ticketPrice: number;
    maxGuests: number;
	title: string;
	startDate: string;
	endDate: string;
	image: string;
	tags: string[];
	__v: number;
}

interface TicketType {
	_id: string;
	eid: string;
}

/*
  TODO:

    - Similar to past events, need a way to track a users specific events via comparing current date to the date of the event
    - Currently this page is showing all events.

*/

const UpcomingEventsComponent = ({ events, loading }) => {
	const router = useRouter();
	const [eventData, setEventData] = useState<EventType[] | undefined>();
	const [ticketData, setTicketData] = useState<TicketType[] | undefined>();
	const [isLoading, setLoading] = useState(false);
	const [cookies] = useCookies(['userObj']);

	const upcomingEvents = events.filter((event) => {
		const startDate = moment(event.startDate);
		const endDate = moment(event.endDate);
		const now = moment();
		return now.isBefore(startDate) && now.isBefore(endDate);
	});

	const deleteEvent = (eid) => {
		fetch('http://localhost:2102/myevent?' + 'eid=' + eid, {
			method: 'DELETE',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		});
		location.reload();
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'title',
			key: 'title',
			render: (text) => <a>{text}</a>,
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
		},
		{
			title: 'Host',
			render: (_, eventData) => {
				return (
					<span>
						{eventData.host.firstName} {eventData.host.lastName}
					</span>
				);
			},
			key: 'firstname',
		},
		{
			title: 'Date',
			render: (_, eventData) => {
				return <span>{moment(eventData.startDate).format('DD MMMM YYYY')}</span>;
			},
			key: 'startDate',
		},
		{
			title: 'Location',
			dataIndex: 'location',
			key: 'location',
		},
		{
			title: 'Action',
			key: 'action',

			render: (_, eventData) => {
				return (
					<Space size="middle">
						{/* I would guess this button would redirect the user to the page holding the ticket of this event */}
						{/* onClick = {() => ticketRedirect(eventData._id)} */}
						<Button
							type="primary"
							onClick={() => {
								router.push(`event/${eventData._id}`);
							}}
						>
							View
						</Button>
						<BroadcastModal eid={eventData._id}/>
						<Popconfirm
							title="Are you sure to delete this event?"
							onConfirm={() => {deleteEvent(eventData._id)}}
							okText="Yes"
							cancelText="No"
						>
							<Button type="primary">Delete</Button>
						</Popconfirm>
					</Space>
				);
			},
		},
	];

	if (loading) {
		return <Skeleton active />;
	}

	return (
		<>
			<Table columns={columns} dataSource={upcomingEvents} />
		</>
	);
};

// upcomingEventsComponent.Layout = HostLayout
export default UpcomingEventsComponent;
