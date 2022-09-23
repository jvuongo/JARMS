import {
	Avatar,
	Button,
	Modal,
	Image,
	Divider,
	Typography,
	Space,
	Row,
	Col,
	Tag,
	Rate,
	Radio,
	notification,
	Card,
	Tooltip,
} from 'antd';
import { SwapOutlined, CalendarOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { Base64 } from 'js-base64';
import moment from 'moment';
import CommentSection from '@/components/event/CommentSection';
import FriendGoing from '@/components/event/FriendGoing';
import GoingListUser from '@/components/event/GoingListUser';
import MiniEventView from '@/components/event/MiniEventView';
import styled from 'styled-components';
import getToken from '@/lib/helpers/getToken';
import _ from 'lodash';
import Particles from 'react-tsparticles';
import UserModal from '@/components/user/UserModal';

const { Title, Text, Paragraph } = Typography;

const CommentSectionContainer = styled.div`
	margin-left: -50px;
`;

const BigUserTitle = styled(Title)`
	color: #c43444 !important;
	margin: auto 0;
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
`;

const HostDetailsContainer = styled.div`
	display: flex;
	align-items: center;
`;

const SmallUserTitle = styled(Text)`
	color: #c43444 !important;
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
`;

const SmallEventTitle = styled(Title)`
	color: #c43444 !important;
`;

const DividerBannerContainer = styled.div`
	width: 100vw;
	margin-left: -30px;
	margin-top: 20px;
	margin-bottom: 30px;
`;

const TopContainer = styled.div`
	background: white;
`;

interface EventInfoType {
	_id: string;
	host: {
		firstName: string;
		lastName: string;
		avatar: string;
		avgRating?: number;
	};
	ticketPrice: number;
	ticketsAvailable: number;
	isPrivate: boolean;
	maxGuests: number;
	title: string;
	description: string;
	location: string;
	startDate: string;
	endDate: string;
	image: string;
	tags: string[];
	comments: [];
	attendees: string[];
	__v: number;
}

interface UserInfoType {
	_id: string;
	firstName: string;
	lastName: string;
	age: string;
	email: string;
}

const ParticlesContainer = styled.div`
	height: fit-content;
	position: absolute;
	top: 0;
	left: 0;
	padding: 0;
	width: 100%;
	z-index: 0;
	overflow: hidden;
`;

const bookingErrorNotification = () => {
	notification['error']({
		message: 'Something went wrong',
		description: 'There was an error while making your booking. Please try again.',
	});
};

const bookingSuccessNotification = () => {
	notification['success']({
		message: 'Ticket Booked!',
		description: 'Click "See My ticket" to view your ticket.',
	});
};

const ticketTradeSuccessNotification = () => {
	notification['success']({
		message: 'Trade Request Made!',
		description: 'You can see the status of this request in the "My Tickets" tab.',
	});
};

const viewEvent = () => {
	const router = useRouter();
	const [eventData, seteventData] = useState<EventInfoType | undefined>();
	const [commentData, setCommentData] = useState<string | undefined>();
	const [eventID, setEventID] = useState<string | undefined>();
	const [newTicketID, setNewTicketID] = useState<string | undefined>();
	const [isLoading, setLoading] = useState(false);
	const [isConfirmBookingModalVisible, setIsConfirmBookingModalVisible] = useState(false);
	const [isGoingModalVisible, setIsGoingModalVisible] = useState(false);
	const [isTradeSelectModalVisible, setIsTradeSelectModalVisible] = useState(false);
	const [isConfirmTradeModalVisible, setIsConfirmTradeModalVisible] = useState(false);
	const [isBookingMadeModalVisible, setIsBookingMadeModalVisible] = useState(false);
	const [tradeWithUserData, setTradeWithUserData] = useState<UserInfoType | undefined>();
	const [loggedInTicketData, setLoggedInTicketData] = useState<undefined>();
	const [tradeWithTicketData, setTradeWithTicketData] = useState<undefined>();
	const [ticketRadioData, setTicketRadioData] = useState<undefined>();
	const [ticketRadioGroupSelected, setTicketRadioGroupSelected] = useState<undefined>();

    // variables and helper function for view user profile modal
	const [userModalVisible, setUserModalVisible] = useState(false);
	const [userModalData, setUserModalData] = useState();

	const [cookies] = useCookies(['userObj']);

	// Helper functions for modals
	const showConfirmBookingModal = () => {
		setIsConfirmBookingModalVisible(true);
	};
	const handleCancelConfirmBookingModal = () => {
		setIsConfirmBookingModalVisible(false);
	};

	const showBookingMadeModal = () => {
		setIsConfirmBookingModalVisible(false);
		setIsBookingMadeModalVisible(true);
	};
	const handleCancelBookingMadeModal = () => {
		setIsBookingMadeModalVisible(false);
	};

	const showGoingModal = () => {
		setIsGoingModalVisible(true);
	};
	const handleCancelGoingModal = () => {
		setIsGoingModalVisible(false);
	};

	const showTradeSelectModal = () => {
		setIsGoingModalVisible(false);
		setIsTradeSelectModalVisible(true);
	};

	const handleCancelTradeSelectModal = () => {
		setIsTradeSelectModalVisible(false);
		setTicketRadioGroupSelected(undefined);
	};

	const showConfirmTradeModal = () => {
		setIsTradeSelectModalVisible(false);
		setIsConfirmTradeModalVisible(true);
	};

	const handleCancelConfirmTradeModal = () => {
		setIsConfirmTradeModalVisible(false);
	};

	// Condition for ticket booking
	// Checkout flow is skipped for free events
	const bookTicketCondition = () => {
		if (eventData?.ticketPrice > 0) {
			router.push(eventData?._id + '/checkout');
		} else {
			showConfirmBookingModal();
		}
	};

	const bookTicket = () => {
		// Get id of current event from url
		const eid = router.query.eid;
		const token = Base64.encode(JSON.stringify(cookies['userObj']));

		var ticketPayload = {
			eid: eid,
			uid: cookies['userObj']._id,
			email: cookies['userObj'].email,
			eventName: eventData?.title,
			eventHost: eventData?.host.firstName + ' ' + eventData?.host.lastName,
			eventDate: moment(eventData?.startDate).format('DD MMMM YYYY'),
		};

		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(ticketPayload),
		};

		// Sending payload to endpoint
		fetch('http://localhost:2102/tickets', requestOptions)
			.then((response) => response.json())
			.then((data) => {
				// console.log("data", data);
				// If no error
				if (data[0] == undefined) {
					// console.log("_id", data._id);

					// set newTicketID
					setNewTicketID(data._id);
					// Show booking success notification
					bookingSuccessNotification();
					// Show "Booking Made" modal
					showBookingMadeModal();

					// Sending payload to endpoint to attach ticket to user
					fetch('http://localhost:2102/attachticket?_id=' + data._id + '&uid=' + cookies['userObj']._id, {
						method: 'PATCH',
						headers: {
							Authorization: `${getToken(cookies['userObj'])}`,
						},
					});

					// Sending payload to endpoint to attach associated tickets to event.
					fetch('http://localhost:2102/attendevent?eid=' + eid + '&_id=' + data._id, {
						method: 'PATCH',
						headers: {
							Authorization: `${getToken(cookies['userObj'])}`,
						},
					});

					// Sending payload to endpoint to attach user to event
					fetch('http://localhost:2102/attachuser?eid=' + eid, {
						method: 'PATCH',
						headers: {
							Authorization: `${getToken(cookies['userObj'])}`,
						},
					});
				} else {
					bookingErrorNotification();
					// Check if 403 forbidden
					if (data === 403) {
						// Show notification
						console.log('403 ERROR');
					}
				}
			});
	};

	function fetchUpdatedComments() {
		if (eventID) {
			// Make fetch request
			fetch('http://localhost:2102/event?eid=' + eventID, {
				method: 'GET',
				headers: {
					Authorization: `${getToken(cookies['userObj'])}`,
				},
			})
				// parse response JSON object
				.then((res) => res.json())
				// Set eventData to the parsed JSON object
				.then((eventData) => {
					// console.log('eventData', eventData);
					setCommentData(JSON.stringify(eventData.comments));
				});
		}
	}

	// Set loading as soon as page loads
	useEffect(() => {
		setLoading(true);
	}, []);

	// fetch event data from backend
	// This useEffect runs on page load once router is ready
	useEffect(() => {
		// console.log(cookies['userObj']);
		const { eid } = router.query;
		setEventID(eid);

		// console.log("cookies", cookies);

		// Don't make fetch request until event ID loads
		if (!eid) {
			return;
		}
		// Make fetch request
		fetch('http://localhost:2102/event?eid=' + eid, {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// parse response JSON object
			.then((res) => res.json())
			// Set eventData to the parsed JSON object
			.then((eventData) => {
				seteventData(eventData);
				setCommentData(JSON.stringify(eventData.comments));
				setLoading(false);
			});
	}, [router.isReady]);

	// fetch ticket information for logged in user
	// used to determine if user is already attending event and for ticket trade system
	// This useEffect runs once eventData is fetched
	useEffect(() => {
		// Don't make fetch request until eventData loads
		if (!eventData) {
			return;
		}
		// Make fetch request
		fetch('http://localhost:2102/sortusertickets', {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// parse response JSON object
			.then((res) => res.json())
			// Set loggedInTicketData to the parsed JSON object
			.then((loggedInTicketData) => {
				// console.log('loggedInTicketData', JSON.stringify(loggedInTicketData));
				setLoggedInTicketData(loggedInTicketData);
			});
	}, [eventData]);

	// get list of IDs for friends who are also going to the same event
	function getFriendsGoingIDs() {
		if (eventData) {
			const friendIDs = cookies['userObj'].friends;
			const attendeeIDs = eventData.attendees;
			if (friendIDs && attendeeIDs) {
				const friendsGoingIDs = friendIDs.filter((friend) => attendeeIDs.includes(friend));
				return friendsGoingIDs;
			}
			return [];
		}
		return [];
	}

	function checkRemainingCapacity() {
		if (eventData?.maxGuests) {
			if (eventData?.maxGuests - eventData?.attendees.length > 0) {
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	}

	function isLoggedInUserAttendingEvent(eid) {
		if (loggedInTicketData && eid) {
			for (var i = 0; i < loggedInTicketData?.upcomingTickets.length; i++) {
				let ticket = loggedInTicketData?.upcomingTickets[i];
				if (ticket.eid === eid) {
					return true;
				}
			}
		}
		return false;
	}

	function didEventAlreadyHappen(eventEndDate) {
		const eventEnd = new Date(eventEndDate);
		const now = new Date();
		if (now.valueOf() - eventEnd.valueOf() > 0) {
			return true;
		} else {
			return false;
		}
	}

	// handle "select ticket to trade" radio group onChange
	const handleTicketRadioGroupChange = (event) => {
		setTicketRadioData(event.target.value);
		setTicketRadioGroupSelected(event.target.value);
	};

	// handle radio group submission (that is, moving on to the "Confirm Ticket Trade" Modal)
	const handleSubmitUserTicketRadioButtons = () => {
		showConfirmTradeModal();
		// reset which radio button is selected from radio group
		setTicketRadioGroupSelected(undefined);
	};

	// fetch ticket information for the user the trade request is to be made with
	// used to get ticket id for current event
	// This useEffect runs once eventData is fetched
	useEffect(() => {
		// Don't make fetch request until tradeWithUserData loads
		if (!tradeWithUserData) {
			return;
		}
		// Make fetch request
		fetch('http://localhost:2102/sortusertickets?uid=' + tradeWithUserData._id, {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// parse response JSON object
			.then((res) => res.json())
			// Set tradeWithTicketData to the parsed JSON object
			.then((tradeWithTicketData) => {
				// console.log('tradeWithTicketData', JSON.stringify(tradeWithTicketData));
				setTradeWithTicketData(tradeWithTicketData);
			});
	}, [tradeWithUserData]);

	function getRequestedTicketID(eid) {
		if (loggedInTicketData && eid) {
			for (var i = 0; i < tradeWithTicketData?.upcomingTickets.length; i++) {
				let ticket = tradeWithTicketData?.upcomingTickets[i];
				if (ticket.eid === eid) {
					return ticket;
				}
			}
		}
		return null;
	}

	// handle ticket trade request
	function handleTicketTradeRequest(offeredTicket: object, requestedTicket: object) {
		var tradeRequestPayload = {
			offeredTicket: offeredTicket,
			requestedTicket: requestedTicket,
		};

		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${getToken(cookies['userObj'])}`,
			},
			body: JSON.stringify(tradeRequestPayload),
		};

		// Sending payload to endpoint
		fetch('http://localhost:2102/tickettrade', requestOptions)
			.then((response) => response.json())
			.then((data) => {
				// console.log("Ticket Trade Request", data);
				ticketTradeSuccessNotification();
				handleCancelConfirmTradeModal();
			});
	}

	// reload the event page if user is routed to a new event while already on an event page
	// WARNING: if the event page ever reloads unexpectedly, check this useEffect
	useEffect(() => {
		if (router.query && eventID) {
			if (router.query.eid !== eventID) {
				location.reload();
			}
		}
	}, [router.query]);

	// Show loading message if waiting for response from backend
	if (isLoading || eventData == undefined) {
		return <div>Loading...</div>;
	}


	function showUser(user: any) {
		setUserModalData(user);
		setUserModalVisible(true);
	}


	return (
		<>
			{/* "Confirm Booking" Modal */}
			<Modal visible={isConfirmBookingModalVisible} onCancel={handleCancelConfirmBookingModal} footer={null}>
				<Title level={2} style={{ textAlign: 'center' }}>
					Confirm Booking
				</Title>
				<Space style={{ width: '100%' }} direction="vertical" align="center">
					<SmallEventTitle level={4}>{eventData.title}</SmallEventTitle>
					<Space direction="horizontal">
						<CalendarOutlined style={{ color: '#949494' }} />
						{Math.abs(new Date(eventData.endDate).valueOf() - new Date(eventData.startDate).valueOf()) <=
						1000 * 60 * 60 * 23 ? (
							<Text type="secondary">{moment(eventData.startDate).format('MMMM DD, YYYY')}</Text>
						) : (
							<Text type="secondary">
								{moment(eventData.startDate).format('MMMM DD, YYYY')} -{' '}
								{moment(eventData.endDate).format('MMMM DD, YYYY')}
							</Text>
						)}
					</Space>
				</Space>
				<Row justify="center">
					<Col>
						<Space direction="horizontal">
							{_.isEmpty(cookies?.userObj) ? (
								<Button
									type="primary"
									size={'large'}
									style={{ alignItems: 'center', marginTop: 40 }}
									onClick={() => {
										router.push('/login');
									}}
								>
									<Text strong style={{ color: 'white' }}>
										SIGN IN TO BOOK
									</Text>
								</Button>
							) : (
								<Button
									type="primary"
									size={'large'}
									style={{ alignItems: 'center', marginTop: 40 }}
									onClick={() => {
										bookTicket();
									}}
								>
									<Text strong style={{ color: 'white' }}>
										BOOK NOW
									</Text>
								</Button>
							)}

							<Button
								type="default"
								size={'large'}
								style={{ alignItems: 'center', marginTop: 40, marginLeft: 40 }}
								onClick={() => {
									handleCancelConfirmBookingModal();
								}}
							>
								<Text>Cancel</Text>
							</Button>
						</Space>
					</Col>
				</Row>
			</Modal>

			{/* "Booking Made" Modal */}
			<Modal visible={isBookingMadeModalVisible} onCancel={handleCancelBookingMadeModal} footer={null}>
				<Title level={2} style={{ textAlign: 'center' }}>
					Ticket Booked!
				</Title>
				<p style={{ textAlign: 'center' }}>We've saved you a seat</p>
				<Row justify="center">
					<Col>
						<Space direction="horizontal">
							<Button
								type="primary"
								size={'large'}
								style={{ alignItems: 'center', marginTop: 40 }}
								onClick={() => {
									router.push('/ticket/' + newTicketID);
								}}
							>
								<Text strong style={{ color: 'white' }}>
									See my Ticket
								</Text>
							</Button>
						</Space>
					</Col>
				</Row>
			</Modal>

			{/* "Going List" Modal */}
			<Modal visible={isGoingModalVisible} onCancel={handleCancelGoingModal} footer={null}>
				<Title level={2} style={{ textAlign: 'center' }}>
					GUEST LIST
				</Title>
				<div>
					{eventData.attendees.map((id) => (
						<GoingListUser
							showTradeSelectModal={() => {
								showTradeSelectModal();
							}}
							setTradeWithUserData={setTradeWithUserData}
							userID={id}
							loggedInAttendingStatus={isLoggedInUserAttendingEvent(eventID)}
						/>
					))}
				</div>
			</Modal>

			{/* "Select Ticket to Trade" Modal */}
			<Modal visible={isTradeSelectModalVisible} onCancel={handleCancelTradeSelectModal} footer={null}>
				<Title level={2} style={{ textAlign: 'center' }}>
					TRADE TICKET
				</Title>
				{/* only render once response received from backend */}
				{loggedInTicketData && (
					<>
						{/* case where user has no upcoming tickets */}
						{loggedInTicketData.upcomingTickets.length === 0 ? (
							<>
								<Space direction="vertical" align="center" style={{ width: '100%' }}>
									<Text>To trade tickets, you must have a valid ticket for an upcoming event.</Text>
									<div style={{ height: '20px' }} />
									<SmallUserTitle
										strong
										onClick={() => {
											router.push('/');
										}}
									>
										Book a ticket for an event now!
									</SmallUserTitle>
									<div style={{ height: '50px' }} />
								</Space>
							</>
						) : (
							// case where user has upcoming tickets
							<>
								<Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>
									<Text>Select the ticket you would like to offer to</Text>
									<SmallUserTitle
										strong
										style={{ marginLeft: '-3px' }}
										onClick={() => {
											router.push('/user/' + tradeWithUserData?._id);
										}}
									>
										{tradeWithUserData?.firstName} {tradeWithUserData?.lastName}
									</SmallUserTitle>
								</Space>
								<div style={{ width: '100%', justifyContent: 'center' }}>
									<Radio.Group
										onChange={handleTicketRadioGroupChange}
										value={ticketRadioGroupSelected}
										buttonStyle="solid"
										style={{ width: '100%', marginTop: '30px' }}
									>
										<Space style={{ width: '100%' }} direction="vertical" align="center">
											{loggedInTicketData.upcomingTickets.map((ticket) => (
												<>
													<Radio.Button value={ticket}>
														<strong>{ticket.eventName}</strong>,<span style={{ marginLeft: '10px' }} />
														{ticket.eventDate}
													</Radio.Button>
												</>
											))}
										</Space>
									</Radio.Group>
									<Space style={{ width: '100%' }} direction="vertical" align="center">
										<Button
											type="primary"
											size={'large'}
											style={{ marginTop: '30px' }}
											onClick={() => {
												handleSubmitUserTicketRadioButtons();
											}}
										>
											<Text strong style={{ color: 'white' }}>
												CONTINUE
											</Text>
										</Button>
									</Space>
								</div>
							</>
						)}
					</>
				)}
			</Modal>

			{/* "Confirm Ticket Trade" Modal */}
			<Modal
				visible={isConfirmTradeModalVisible}
				onCancel={handleCancelConfirmTradeModal}
				footer={null}
				width={'700px'}
			>
				<Title level={2} style={{ textAlign: 'center' }}>
					CONFIRM TRADE
				</Title>
				{ticketRadioData ? (
					<>
						<Space style={{ width: '100%' }} direction="vertical" align="center">
							<Space direction="horizontal">
								<Space direction="vertical" align="center">
									<Text>
										<strong>Your</strong> ticket
									</Text>
									<MiniEventView eid={ticketRadioData.eid} />
								</Space>
								<SwapOutlined />
								<Space direction="vertical" align="center">
									<Space direction="horizontal">
										<SmallUserTitle
											strong
											onClick={() => {
												router.push('/user/' + tradeWithUserData?._id);
											}}
										>
											{tradeWithUserData?.firstName}
										</SmallUserTitle>
										<Text style={{ marginLeft: '-8px' }}>'s ticket</Text>
									</Space>
									<MiniEventView eid={eventID} />
								</Space>
							</Space>
							<Button
								type="primary"
								size={'large'}
								style={{ marginTop: '30px' }}
								onClick={() => {
									handleTicketTradeRequest(ticketRadioData, getRequestedTicketID(eventID));
								}}
							>
								<Text strong style={{ color: 'white' }}>
									REQUEST TRADE
								</Text>
							</Button>
						</Space>
					</>
				) : (
					<Text>loading...</Text>
				)}
			</Modal>

			<ParticlesContainer>
				<Particles
					width="100vw"
					height="100vh"
					style={{ position: 'fixed', display: 'block', zIndex: '1' }}
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

			{/* Main Content */}
			<Card
				className="ticket-card"
				style={{
					width: '70%',
					borderRadius: 5,
					boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
					margin: '0 auto',
					padding: '10px',
				}}
			>
				<Row style={{ fontFamily: 'lato' }}>
					<Col span={8}>
						<Title level={1} style={{ margin: 0 }}>
							{eventData.title}
						</Title>
						{/* Display date range for event */}
						<Space direction="horizontal">
							<CalendarOutlined style={{ color: '#949494' }} />
							{Math.abs(new Date(eventData.endDate).valueOf() - new Date(eventData.startDate).valueOf()) <=
							1000 * 60 * 60 * 23 ? (
								<Text type="secondary">{moment(eventData.startDate).format('MMMM DD, YYYY')}</Text>
							) : (
								<Text type="secondary">
									{moment(eventData.startDate).format('MMMM DD, YYYY')} -{' '}
									{moment(eventData.endDate).format('MMMM DD, YYYY')}
								</Text>
							)}
						</Space>
						<Paragraph style={{ marginTop: 10, marginBottom: 40, fontSize: '1rem' }}>{eventData.description}</Paragraph>
						<Space direction="horizontal">
							{/* case where event is in the past */}
							{didEventAlreadyHappen(eventData.endDate) ? (
								<div style={{ marginTop: '20px' }}>
									<Text type="secondary" italic>
										this event already happened
									</Text>
								</div>
							) : (
								<>
									{/* case where user is already attending event */}
									{isLoggedInUserAttendingEvent(eventID) ? (
										<div style={{ marginTop: '20px' }}>
											<Text type="secondary" italic>
												you are attending this event
											</Text>
										</div>
									) : (
										<>
											{checkRemainingCapacity() ? (
												<>
													{/* case where user is not attending and there is remaining capacity */}
													{_.isEmpty(cookies?.userObj) ? (
														<Button
															type="primary"
															size={'large'}
															style={{ marginRight: 20 }}
															onClick={() => {
																router.push('/login');
															}}
														>
															<Text strong style={{ color: 'white' }}>
																SIGN IN TO BOOK
															</Text>
														</Button>
													) : (
														<Button
															type="primary"
															size={'large'}
															style={{ marginRight: 20 }}
															onClick={bookTicketCondition}
														>
															<Text strong style={{ color: 'white' }}>
																BOOK NOW
															</Text>
														</Button>
													)}

													<Paragraph
														copyable={{ text: 'http://localhost:3000/event/' + router.query.eid }}
														style={{ marginTop: 10 }}
													>
														<Text strong>Share Event</Text>
													</Paragraph>
												</>
											) : (
												<>
													{/* case where user is not attending and there is no remaining capacity */}
													<Space direction="vertical">
														<Text>
															It looks like <strong>{eventData.title}</strong> is full, but you might not have to miss
															out! Try requesting a ticket trade with someone who is already going.
														</Text>
														<Button type="primary" size={'large'} style={{ marginRight: 20 }} onClick={showGoingModal}>
															<Text strong style={{ color: 'white' }}>
																TRADE TICKET
															</Text>
														</Button>
													</Space>
												</>
											)}
										</>
									)}
								</>
							)}
						</Space>
					</Col>
					<Col span={4}></Col>
					<Col span={10}>
						<Image
							width={600}
							height={250}
							style={{ objectFit: 'cover', objectPosition: '25% 0%', float: 'right' }}
							src={eventData.image}
							fallback="https://res.cloudinary.com/dwiv2vrtr/image/upload/v1647069465/ufwlez63v1qiiw5zwt58.png"
						/>
					</Col>
				</Row>
			</Card>

			<Card
				className="ticket-card"
				style={{
					width: '70%',
					borderRadius: 5,
					boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
					margin: '0 auto',
					marginTop: '25px',
					padding: '15px',
					paddingBottom: '90px',
				}}
			>
				<Row style={{ background: 'white' }}>
					<Col span={12}>
						<Title level={2} style={{ marginBottom: 0 }}>
							DETAILS
						</Title>
						<Space direction="horizontal" style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
							<Title level={4} style={{ marginRight: 20, marginBottom: 0, color: 'grey', fontWeight: 'normal' }}>
								Hosted by
							</Title>
						</Space>
						<HostDetailsContainer>
							<Avatar
								size={42}
								src={
									eventData.host?.avatar ??
									'https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png'
								}
							/>
							<BigUserTitle
								level={4}
								onClick={() => {
									showUser(eventData.host);
								}}
								style={{ margin: 'auto 10px' }}
							>
								{eventData.host.firstName} {eventData.host.lastName}
							</BigUserTitle>
							<Tooltip title={`Average Rating: ${eventData.host?.avgRating.toFixed(2)}`}>
								<div>
									<Rate
										disabled
										value={eventData.host?.avgRating}
										style={{ display: 'flex', color: '#C43444', fontSize: '16px' }}
									/>
								</div>
							</Tooltip>
						</HostDetailsContainer>
						<div style={{margin: '20px 0px'}}>
							{eventData.tags.map((tag) => (
								<>
									<Tag color="processing">{tag}</Tag>
								</>
							))}
						</div>
					</Col>
					<Col span={2}></Col>
					<Col span={7}>
						<Space direction="horizontal" size="large">
							<Title level={2} style={{ margin: 0 }}>
								GUEST LIST
							</Title>
							{eventData.maxGuests && <Text type="secondary">Max Capacity: {eventData.maxGuests}</Text>}
						</Space>
						{eventData.attendees.length > 0 ? (
							<BigUserTitle level={3} onClick={() => showGoingModal()}>
								{eventData.attendees.length} going
							</BigUserTitle>
						) : (
							<Title level={4} style={{ margin: 0, fontWeight: 'normal', color: 'grey' }}>
								No guests yet.
							</Title>
						)}
						<Divider style={{ marginTop: '81px' }} />

						{!_.isEmpty(cookies?.userObj) && (
							<>
								<Space direction="horizontal" size="middle">
									<Title level={2} style={{ marginBottom: 10, fontWeight: '100' }}>
										{`FRIENDS GOING - ${getFriendsGoingIDs().length}`}{' '}
									</Title>
								</Space>
								{/* Friends attending. */}
								{getFriendsGoingIDs().length > 0 ? (
									<div>
										{getFriendsGoingIDs().map((id) => (
											<FriendGoing friendID={id}></FriendGoing>
										))}
									</div>
								) : (
									<Title level={4} style={{ margin: 0, fontWeight: 'normal', color: 'grey' }}>
										No friends going yet. Invite them!
									</Title>
								)}
							</>
						)}
					</Col>
				</Row>
                <Divider />
                <Title level={2} style={{ marginTop: 20 }}>
                    DISCUSSION
                </Title>
                <CommentSectionContainer>
                    <CommentSection
                        reloadComments={() => {
                            fetchUpdatedComments();
                        }}
                        comments={commentData ?? ''}
                        isLoggedIn={!_.isEmpty(cookies?.userObj)}
                    />
                </CommentSectionContainer>
			</Card>
			<UserModal visible={userModalVisible} setModalVisibe={setUserModalVisible} data={userModalData} />
		</>
	);
};

export default viewEvent;
