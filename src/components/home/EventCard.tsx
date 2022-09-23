import { Card,  Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface EventType {
	_id: string;
	location: string;
	host: {
		firstName: string;
		lastname: string;
	};
	ticketPrice: number;
    maxGuests: number;
	title: string;
	startDate: string;
	endDate: string;
	image: string;
	tags: string[];
	__v: number;
}

interface EventCardProps {
	event: EventType;
}

const DateContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 10px;
	color: #909090;

	.text {
		margin-left: 5px;
	}
`;


const TitleContainer = styled.div`
	font-size: 1.4rem;
	font-weight: bold;
`;

const Location = styled.div`
	font-size: 1rem;
	color: #878787;
`;

const Attending = styled.div`

`

const Footer = styled.div`
	display: flex;
	width: 100%;
	height: 55px;
	align-items: center;
	justify-content: space-between;

	.price {
		color: #b32535;
		font-weight: 500;
		font-size: 1.2rem;
	}
`


const { Meta } = Card;

function EventCard({ event }: EventCardProps) {
	const router = useRouter();
	return (
			<Card
				style={{ width: '21vw', maxWidth: '400px', height: '430px', borderRadius: 10, overflow: 'hidden' }}
				hoverable
				cover={
				<Image alt="example" height={250} width={500} src={event.image} objectFit={'cover'}/>			
			}
			>
				<Location>{event.location}</Location>
				<TitleContainer>{event.title}</TitleContainer>

				<DateContainer>
							<CalendarOutlined />
<span className='text'>{moment(event.startDate).format('DD MMMM YYYY')}</span>
				</DateContainer>

				<Attending>
				</Attending>
				<Footer>
					<div className='price'>{event.ticketPrice === 0 ? "FREE" : `$${event.ticketPrice.toFixed(2)}`}</div>
				<Button
					value="default"
					shape="round"
					style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px 25px' }}
					onClick={() => {
						router.push('/event/' + event._id);
					}}
				>
					View
				</Button>
				</Footer>

			</Card>
	);
}

export default EventCard;
