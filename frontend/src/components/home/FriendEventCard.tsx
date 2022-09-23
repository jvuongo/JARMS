import { Card, Col, Row, Typography, Button} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;

interface EventType {
	_id: string;
	location: string;
	host: {
		firstName: string,
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

function FriendEventCard({event}: EventCardProps) {
	return (
	<><Title style={{margin: '30px 0px'}} level={2}>What your friends are attending</Title>
		<Row gutter={[32, 32]}>
			<Col span={6}>
				<Card
					title="Placeholder"
					style={{ width: '100%', borderRadius: 10 }}
					onClick={() => alert('In progress')}
					hoverable={true}
				>
					<p>Ticket price: Placeholder</p>
					<p>Event start date: Placholder</p>
				</Card>
			</Col>
		</Row></>
	);
}

export default FriendEventCard;