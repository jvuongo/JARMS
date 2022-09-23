import HostLayout from '@/components/layouts/HostLayout';
import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Switch } from 'antd';
import { useRouter } from 'next/router';
import { StringNullableChain } from 'lodash';
import moment from 'moment';
import { Base64 } from 'js-base64';
import { useCookies } from 'react-cookie';
import styled from 'styled-components';
import PastEventsComponent from '@/components/host/PastEventsComponent'
import UpcomingEventsComponent from '@/components/host/UpcomingEventsComponent'
import getToken from '@/lib/helpers/getToken'

interface EventType {
	_id: string;
	location: string;
	ticketPrice: number;
    maxGuests: number;
	title: string;
	startDate: string;
	endDate: string;
	image: string;
	tags: string[];
	__v: number;
}

const ButtonToggle = styled(Button)`
	padding: 20px 25px;
	display: flex;
	justify-content: center;
	align-items: center;

	&:nth-of-type(2) {
		margin-left: 10px;
	}
`;

const ButtonContainer = styled.div`
	display: flex;
	margin: 20px 10px;

	.ant-btn-primary:hover,
	.ant-btn-primary:focus {
		color: #fff;
		border-color: #c63643;
		background: #c63643;
	}
`;

/*
  TODO:
  - Need to retrieve the events using the host ID i.e. "Search for events under this host id then present it" since we need events created by the host - Done
*/

const Host = () => {
	const router = useRouter();
	const [data, setData] = useState<EventType[] | undefined>();
	const [isLoading, setLoading] = useState(false);
	const [table, setTable] = useState('upcoming');

	const [cookies] = useCookies(['userObj']);

	// This useEffect 'hook' with an empty array means it runs the code under
	// as soon as the page loads
	useEffect(() => {
		// While waiting for the server to send the data, show a loading message
		setLoading(true);
		fetch('http://localhost:2102/myevents', {
			headers: {
				'Authorization': `${getToken(cookies['userObj'])}`
			}
		})
		// The response is a JSON object, so we can use .json() to parse it
		.then((res) => res.json())
		// Set the data to the parsed JSON object
		.then((data) => {
			setData(data);
			setLoading(false);
		});
	}, []);

	const value = cookies['userObj'];
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
			render: (_, data) => {
				return (
					<span>
						{value.firstName} {value.lastName}{' '}
					</span>
				);
			},
			key: 'firstname',
		},
		{
			title: 'Date',
			render: (_, data) => {
				return <span>{moment(data.startDate).format('DD MMMM YYYY')}</span>;
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

			render: (_, data) => (
				<Space size="middle">
					<Button
						onClick={() => {
							router.push('/event/' + data._id);
						}}
					>
						View
					</Button>
				</Space>
			),
		},
	];

	return (
		<>
			<ButtonContainer>
				<ButtonToggle
					type={table === 'upcoming' ? 'primary' : 'default'}
					onClick={() => {
						setTable('upcoming');
					}}
				>
					Upcoming
				</ButtonToggle>
				<ButtonToggle
					type={table === 'past' ? 'primary' : 'default'}
					onClick={() => {
						setTable('past');
					}}
				>
					Past Events
				</ButtonToggle>
			</ButtonContainer>
			{/* Need to use Steven's method for loading data from index then passing it into PastEventsComponent */}
      {/* <PastEventsComponent/> #loading={isLoading} events={data ?? []}/> */}
      {table === 'upcoming' ? <UpcomingEventsComponent loading={isLoading} events={data ?? []}/> : <PastEventsComponent loading={isLoading}/>}
		</>
	);
};

export default Host;
Host.Layout = HostLayout;
