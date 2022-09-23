import { Button, Card, Divider, Modal, notification, Row, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import Title from 'antd/lib/typography/Title';
import { useCookies } from 'react-cookie';
import { Base64 } from 'js-base64';
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons/lib/icons';
import getToken from '@/lib/helpers/getToken';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import styled from 'styled-components';
import Particles from 'react-tsparticles';

interface EventInfoType {
	_id: string;
	host: {
		firstName: string;
		lastName: string;
	};
	ticketPrice: number;
    maxGuests: number;
	isPrivate: boolean;
	title: string;
	description: string;
	location: string;
	startDate: string;
	endDate: string;
	image: string;
	tags: string[];
	__v: number;
}

interface TicketType {
	_id: string;
	eid: string;
	paymentID: string;
}

const gridStyle = {
	width: '33.33%',
	height: '400px',
	textAlign: 'center',
	borderTop: 'none',
};

const ParticlesContainer = styled.div`
	height: 100vh;
	position: absolute;
	top: 0;
	left: 0;
	padding: 0;
	width: 100%;
	z-index: 0;
	overflow: hidden;
`;

const Container = styled.div`
    z-index: 555;
`;

const MyTicket = () => {
	const [ticketData, setticketData] = useState<TicketType[] | undefined>();
	const [eventData, seteventData] = useState<EventInfoType[] | undefined>();
	const [isLoading, setLoading] = useState(false);
	const router = useRouter();
	const [cookies] = useCookies(['userObj']);

	// Dynamic QR Code landing page based on ticket id.
	const qrLink =
		'https://api.qrserver.com/v1/create-qr-code/?data=http://localhost:3000/ticket/' +
		ticketData?._id +
		'/verified&size=200x200';

	// Set loading as soon as page loads
	useEffect(() => {
		setLoading(true);
	}, []);

	// Condition for ticket cancellation
	// Ticket can only be cancelled when the event is seven or more days into the future
	function ticketCancelCondition() {
		var dateCancelCondition = moment().add(7, 'days').format('DD MMMM YYYY');
		if (moment(ticketData?.eventDate).isSameOrAfter(dateCancelCondition)) {
			showCancelConfirm();
		} else {
			showCancelDeny();
		}
	}

	// Ticket Cancellation Error Modal
	function showCancelDeny() {
		Modal.error({
			title: 'You cannot cancel your ticket as the event is scheduled to occur within 7 days.',
		});
	}

	// Ticket Cancellation Success Modal
	function showCancelConfirm() {
		const token = Base64.encode(JSON.stringify(cookies['userObj']));
		Modal.confirm({
			title: 'Are you sure you want to cancel your ticket?',
			icon: <ExclamationCircleOutlined />,
			content: <i>You will be redirected to the 'Tickets' tab.</i>,
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk() {
				// Send payload to endpoint to refund ticket transaction.
				const requestOptions = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization:
							'Basic QVhOMVNMMDgydXBWWkN3a2lKOUxBWVIzYm9ZcjNkNV9hbWZEVWx1LVh4OGZiZU1qVTZGdDZSdDJSWXZHX1JMZENjZzdxTUtCcTczcU5NRlU6RU90WElLUVJGaWxKcmw0cEVLZFUtQnNXVlprbkdISGtGZUZ5VHlrVFUyMW95bjZ3RGdsSzh0MUFuWFR3amVJY2NCTlFlQnRXQ05IVUt6SVM=',
					},
				};
				fetch(
					'https://api-m.sandbox.paypal.com/v2/payments/captures/' + ticketData?.paymentID + '/refund',
					requestOptions,
				);

				// Send payload to endpoint to cancel ticket transaction.
				fetch('http://localhost:2102/ticket?_id=' + ticketData?._id + '&eid=' + ticketData?.eid, {
					method: 'DELETE',
					headers: {
						Authorization: `${getToken(cookies['userObj'])}`,
					},
				});
				// Redirect to 'My Tickets' tab
				router.push('/tickets/');
				notification.success({ message: 'You have successfully cancelled your ticket.' });
			},
			onCancel() {
				console.log('Cancel');
			},
		});
	}

	// This useEffect runs on page load once router is ready
	useEffect(() => {
		const ticketId = router.query.tid;
		const token = Base64.encode(JSON.stringify(cookies['userObj']));

		// Don't make fetch request until ticket ID loads
		if (!ticketId) {
			return;
		}
		// Make fetch request
		fetch('http://localhost:2102/ticket?_id=' + ticketId, {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// parse response JSON object
			.then((res) => res.json())
			// Set ticketData to the parsed JSON object
			.then((ticketData) => {
				setticketData(ticketData);
			});
	}, [router.isReady]);

	// This useEffect runs when ticketData is set
	useEffect(() => {
		const token = Base64.encode(JSON.stringify(cookies['userObj']));
		// Don't make fetch request until ticketData loads
		if (!ticketData) {
			return;
		}
		// Make fetch request
		fetch('http://localhost:2102/event?eid=' + ticketData.eid, {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// parse response JSON object
			.then((res) => res.json())
			// Set ticketData to the parsed JSON object
			.then((eventData) => {
				seteventData(eventData);
				setLoading(false);
			});
	}, [ticketData]);

	// Show loading message if waiting for response from backend
	if (isLoading || ticketData == undefined) {
		return <Skeleton active />;
	}

	return (
		<Container>
			<ParticlesContainer>
				<Particles
					width="100vw"
					height="100vh"
					style={{ display: 'block' }}
					options={{
						backgroundMode: {
							enable: false,
							zIndex: 0,
						},
						background: {
							color: '#f9f4f5',
						},
						fpsLimit: 60,
						interactivity: {
							detectsOn: 'canvas',
							events: {
								onClick: { enable: true, mode: 'repulse' },
								onHover: {
									enable: true,
									mode: 'bubble',
									parallax: { enable: false, force: 2, smooth: 10 },
								},
								resize: true,
							},
							modes: {
								bubble: {
									distance: 400,
									duration: 0.3,
									opacity: 1,
									size: 4,
									speed: 3,
								},
								grab: { distance: 400, line_linked: { opacity: 0.5 } },
								push: { particles_nb: 4 },
								remove: { particles_nb: 2 },
								repulse: { distance: 200, duration: 0.4 },
							},
						},
						particles: {
							color: { value: '#EC6C6C' },
							links: {
								color: '#ffffff',
								distance: 1200,
								enable: false,
								opacity: 0.4,
								width: 2,
							},
							move: {
								attract: { enable: false, rotateX: 600, rotateY: 1200 },
								direction: 'none',
								enable: true,
								outMode: 'out',
								random: false,
								size: true,
								speed: 1,
								straight: false,
							},
							number: { density: { enable: true, area: 800 }, value: 50 },
							opacity: {
								random: true,
								value: 0.5,
							},
							shape: {
								type: 'circle',
							},
							size: {
								random: true,
								value: 12,
							},
						},
						detectRetina: true,
					}}
				/>
			</ParticlesContainer>
			<Row type="flex" justify="center" align="middle" style={{ minHeight: '75vh' }}>
				<Card
					className="ticket-card"
					style={{ width: '50%', borderRadius: 10, boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
				>
					<Card.Grid
						style={{
							gridStyle,
							display: 'flex',
							justifyContent: 'space-between',
							flexDirection: 'column',
							height: '400px',
						}}
						hoverable={false}
					>
						<div>
							<p style={{ textAlign: 'left' }}>
								<b>EVENT NAME</b>
							</p>
							<Title
								style={{
									color: 'grey',
									fontWeight: '300',
									marginTop: '-15px',
									marginBottom: '25px',
									textAlign: 'left',
								}}
								level={2}
							>
								{eventData?.title}
							</Title>
							<p style={{ textAlign: 'left' }}>
								<b>EVENT ID</b>
							</p>
							<Title
								style={{
									color: 'grey',
									fontWeight: '300',
									marginTop: '-10px',
									marginBottom: '25px',
									textAlign: 'left',
								}}
								level={2}
							>
								{eventData?._id.substring(0, 12)}
							</Title>
							<p style={{ textAlign: 'left' }}>
								<b>EVENT HOST</b>
							</p>
							<Title
								style={{
									color: 'grey',
									fontWeight: '300',
									marginTop: '-15px',
									marginBottom: '25px',
									textAlign: 'left',
								}}
								level={2}
							>
								{eventData?.host.firstName} {eventData?.host.lastName}
							</Title>
						</div>

						<div
							style={{
								display: 'flex',
								paddingBottom: '10px',
								fontSize: '20px',
								alignItems: 'center',
								cursor: 'pointer',
							}}
							onClick={() => {
								history.back();
							}}
						>
							<ArrowLeftOutlined style={{ fontSize: '15px', marginRight: '6px' }} /> Back
						</div>
					</Card.Grid>
					<Card.Grid style={gridStyle} hoverable={false}>
						<p style={{ textAlign: 'left' }}>
							<b>EVENT DATE</b>
						</p>
						<Title
							style={{ color: 'grey', fontWeight: '300', marginTop: '-15px', marginBottom: '25px', textAlign: 'left' }}
							level={2}
						>
							{moment(eventData?.startDate).format('DD MMMM YYYY')}
						</Title>
						<p style={{ textAlign: 'left' }}>
							<b>TICKET ID</b>
						</p>
						<Title
							style={{ color: 'grey', fontWeight: '300', marginTop: '-15px', marginBottom: '25px', textAlign: 'left' }}
							level={2}
						>
							{ticketData?._id.substring(0, 12)}
						</Title>
						<p style={{ textAlign: 'left' }}>
							<b>TICKET PRICE</b>
						</p>
						<Title
							style={{ color: 'grey', fontWeight: '300', marginTop: '-15px', marginBottom: '25px', textAlign: 'left' }}
							level={2}
						>
							{eventData?.ticketPrice === 0 ? 'FREE' : `$${eventData?.ticketPrice}`}
						</Title>
					</Card.Grid>
					<Card.Grid style={gridStyle} hoverable={false}>
						<p>
							<img src={qrLink} />
						</p>
						<p>
							<Button type="primary" size={'large'} onClick={ticketCancelCondition}>
								{' '}
								Cancel Ticket{' '}
							</Button>
						</p>
						<Divider />
						<img src="https://i.ibb.co/8zqFRnb/meetic-logo.png" />
					</Card.Grid>
				</Card>
			</Row>
		</Container>
	);
};

export default MyTicket;
MyTicket.layout = DefaultLayout;
