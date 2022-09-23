import { Cookies, useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
import { Card, Col, Row, Input, Space, Typography, Button, DatePicker, Skeleton, Select, Popover } from 'antd';
import moment from 'moment';
import FriendEventCard from '@/components/home/FriendEventCard';
import EventCard from '@/components/home/EventCard';
import getToken from '@/lib/helpers/getToken';
import Friends from '@/components/social/Friends';
import Particles from 'react-tsparticles';
import styled from 'styled-components';
import Icon, { HomeOutlined, InfoCircleFilled, SearchOutlined } from '@ant-design/icons';
import { DEFAULT_EVENT_TYPES } from '@/lib/utils/constants';
import { UserType } from '@/lib/utils/types';
import LoadingScreen from '@/components/LoadingScreen';
import Slider from 'react-slick';
import Settings from './account/settings';
import _ from 'lodash';

// Declare your types at the top
// Look at the response payload to determine what fields to put in
// If the type is optional add ? to the end of the type name
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
	attendees: UserType[];
	__v: number;
}

const { Title } = Typography;

const content = (
	<div>
	  <Title level={5}>Meetic recommends events based on:</Title>
	  <a style={{color: '#C43444'}}>❶</a> Event types booked in the past.
	  <p></p><a style={{color: '#C43444'}}>❷</a> Event hosts booked with in the past.
	  <p></p><a style={{color: '#C43444'}}>❸</a> Similar descriptions to events booked in the past.
	</div>
);

interface SearchFilterTypes {
	name: string;
	startDate: any;
	location: string;
	type: string;
}

const ParticlesContainer = styled.div`
	height: 755px;
	position: absolute;
	top: 0;
	left: 0;
	padding: 0;
	width: 100%;
	z-index: 0;
	overflow: hidden;
`;

const MainContainer = styled.div`
	margin-top: 90px;
	z-index: 555;
	padding: 0px 60px;
	padding-bottom: 100px;

	.slick-track {
		height: 450px;
		display: flex;
		justify-content: center;
	}

	.slick-slide {
		margin: 0 15px;
	}

	.slick-prev {
		position: absolute;

		z-index: 1;
	}

	.slick-prev:before {
		color: #c43444;
	}
	.slick-next {
		z-index: 1;
	}

	.slick-next:before {
		color: #c43444;
	}
`;

const HeadingContainer = styled.div`
	display: flex;
	padding: 0px 20px;
	flex-direction: column;
	margin-bottom: 100px;
`;

const HeadingSub = styled.div`
	position: relative;
	color: #b32535;
	font-weight: 500;
	font-size: 1.5rem;
`;

const HeadingMain = styled.div`
	position: relative;
	font-size: 4rem;
	font-weight: bold;
	width: 50%;
	line-height: 1.2;
	letter-spacing: -0.1rem;
	margin: 10px 0px 30px 0px;
`;

const HeadingBody = styled.div`
	position: relative;
	font-size: 1.4rem;
	width: 50%;
	font-weight: 400;
`;

const SlickSettings = (array) => {
	return {
		dots: false,
		slidesToShow: 4,
		slidesToScroll: array.length > 4 ? 4 : array.length,
		infinite: array.length > 4,
	}
};

const defaultSearchFilter: SearchFilterTypes = {
	name: '',
	startDate: '',
	location: '',
	type: '',
};

const Home = () => {
	const [data, setData] = useState<EventType[] | []>([]);
	const [isLoading, setLoading] = useState(false);
	const [dataLoading, setDataLoading] = useState(false);
	const [searchFilters, setSearchFilters] = useState<SearchFilterTypes>(defaultSearchFilter);
	const [filteredData, setFilteredData] = useState<EventType[]>();
	const [friendEventData, setFriendEventData] = useState<EventType[]>([]);
	const [recommendationData, setRecommendationData] = useState<EventType[]>([]);
	const [currUser, setCurrUser] = useState<UserType>();
	const [cookies] = useCookies(['userObj']);

	// This useEffect 'hook' with an empty array means it runs the code under
	// as soon as the page loads
	useEffect(() => {
		// While waiting for the server to send the data, show a loading message
		setLoading(true);
		fetch('http://localhost:2102/events', {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// The response is a JSON object, so we can use .json() to parse it
			.then((res) => res.json())
			// Set the data to the parsed JSON object
			.then((data) => {
				setData(data);
				setLoading(false);
			});
	}, []);

	// This useEffect 'hook' with an empty array means it runs the code under
	// as soon as the page loads
	useEffect(() => {
		// While waiting for the server to send the data, show a loading message
		setLoading(true);
		fetch('http://localhost:2102/recommendedevents', {
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// The response is a JSON object, so we can use .json() to parse it
			.then((res) => res.json())
			// Set the data to the parsed JSON object
			.then((data) => {
				// Filter data with host id equalling user id
				const filteredData = data.filter((event) => event.host !== cookies['userObj']._id);
				setRecommendationData(filteredData);
				setLoading(false);
			});
	}, []);

	useEffect(() => {

		setDataLoading(true);
		setTimeout(() => {
			setDataLoading(false);
		}, 1000);

		let newData = data;
		if (searchFilters.name && searchFilters.name !== '') {
			// Filter by name
			newData = newData?.filter((event) => {
				return event.title.toLowerCase().includes(searchFilters.name.toLowerCase());
			});
		}

		if (searchFilters.startDate && searchFilters.startDate !== '') {
			// Filter by date
			newData = newData?.filter((event) => {
				return moment(event.startDate).isSame(moment(searchFilters.startDate), 'day');
			});
		}

		if (searchFilters.location && searchFilters.location !== '') {
			// Filter by location
			newData = newData?.filter((event) => {
				return event.location.toLowerCase().includes(searchFilters.location.toLowerCase());
			});
		}

		if (searchFilters.type && searchFilters.type !== '') {
			// Filter by type
			newData = newData?.filter((event) => {
				return event.tags.includes(searchFilters.type);
			});
		}

		// If all filters are empty, reset data
		if (
			searchFilters.name === '' &&
			searchFilters.startDate === '' &&
			searchFilters.location === '' &&
			searchFilters.type === ''
		) {
			setFilteredData(undefined);
		}

		setFilteredData(newData);
	}, [searchFilters]);

	// This is a useEffect to retrieve the current user
	useEffect(() => {
		// If cookies exist then search the current user's friends list and retrieve the user._id from the friends list.
		var isCookieEmpty = JSON.stringify(cookies['userObj']);
		if (!_.isEmpty(cookies.userObj)) {
			setLoading(true);
			fetch('http://localhost:2102/currentuser', {
				method: 'GET',
				headers: {
					Authorization: `${getToken(cookies['userObj'])}`,
				},
			})
				// parse response JSON object
				.then((response) => response.json())
				// Set ticketData to the parsed JSON object
				.then((currUser) => {
					console.log('currUser: ', currUser);
					setCurrUser(currUser);
					setLoading(false);
				});
		}
	}, []);

	useEffect(() => {
		const friendIds = currUser?.friends?.map((friend) => friend._id);

		// Get events friends are attending
		const friendEvents = data?.filter((event) => {
			return event.attendees
				?.map((attendee) => attendee._id)
				.some((attendees) => {
					return friendIds?.includes(attendees);
				});
		});

		const filteredData = friendEvents.filter((event) => event.host !== cookies['userObj']._id);
		setFriendEventData(filteredData);
	}, [currUser]);

	// If its loading, show a loading message
	if (isLoading) {
		return <LoadingScreen />;
	}

	// Otherwise, show the data
	// Think of the .map() as a for loop through the object
	return (
		<>
			<ParticlesContainer>
				<Particles
					width="100vw"
					height="755px"
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
								repulse: { distance: 200, duration: 5 },
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
			<MainContainer>
				<HeadingContainer>
					<HeadingSub>{_.isEmpty(cookies.userObj) ? "Experience more" : `Welcome, ${cookies.userObj?.firstName}`}</HeadingSub>
					<HeadingMain>{_.isEmpty(cookies.userObj) ? "Join the largest social platform for groups and events." : "Ready to discover events and make new friends?"}</HeadingMain>
					<HeadingBody>Events made simple. Book and plan your next event without ever leaving Meetic.</HeadingBody>
				</HeadingContainer>
				<Input.Group size="large" compact style={{ margin: '0 auto', width: '70vw', marginBottom: '120px' }}>
					<Input
						style={{ width: '30%' }}
						size="large"
						placeholder="Name of event"
						suffix={<SearchOutlined style={{ color: '#c4c4c4' }} />}
						onChange={(e) => {
							setSearchFilters({ ...searchFilters, name: e.target.value });
						}}
					/>
					<DatePicker
						style={{ width: '20%', marginRight: 0 }}
						size="large"
						placeholder="Date"
						onChange={(date) => {
							setSearchFilters({ ...searchFilters, startDate: date });
						}}
					/>
					<Input
						style={{ width: '25%', marginLeft: 0 }}
						size="large"
						placeholder="Location"
						suffix={<HomeOutlined style={{ color: '#c4c4c4' }} />}
						onChange={(e) => {
							setSearchFilters({ ...searchFilters, location: e.target.value });
						}}
					/>
					<Select
						placeholder="Type of event"
						style={{ width: '25%' }}
						showSearch
						optionFilterProp="children"
						size="large"
						onChange={(value) => {
							setSearchFilters({ ...searchFilters, type: value });
						}}
					>
						{DEFAULT_EVENT_TYPES.map((type) => (
							<Select value={type}>{type}</Select>
						))}
						;<Select value="">No preference</Select>
					</Select>
				</Input.Group>

				{dataLoading ? (
					<LoadingScreen />
				) : (
					<>
						<Title style={{ margin: '30px 15px 30px 15px' }} level={2}>
							Popular
						</Title>

						<Slider {...SlickSettings(filteredData && filteredData.length > 0 ? filteredData : data)}>
							{!filteredData && !data && <div>No events</div>}
							{filteredData && filteredData.length > 0
								? filteredData?.map((event) => {
										// If event starting date or end date is in passed, don't show it
										if (moment(event.startDate).isBefore(moment()) || moment(event.endDate).isBefore(moment())) {
											return null;
										}
										return (
											<>
												<EventCard event={event} />
											</>
										);
								  })
								: data?.map((event) => {
										// If event starting date or end date is in passed, don't show it
										if (moment(event.startDate).isBefore(moment()) || moment(event.endDate).isBefore(moment())) {
											return null;
										}
										return (
											<>
												<EventCard event={event} />
											</>
										);
								  })}
						</Slider>

						{recommendationData?.length > 0 && (
							<>
								<Title style={{ margin: '50px 15px 30px 15px' }} level={2}>
									Recommended Events <Popover content={content}><InfoCircleFilled style={{ fontSize: '24px', color: '#C43444' }}/> </Popover>
								</Title>
								<Slider {...SlickSettings(recommendationData)}>
									{recommendationData?.map((event) => {
										// If event starting date or end date is in passed, don't show it
										if (moment(event.startDate).isBefore(moment()) || moment(event.endDate).isBefore(moment())) {
											return null;
										}
										return (
											<>
												<EventCard event={event} />
											</>
										);
									})}
								</Slider>
							</>
						)}

						{friendEventData?.length > 0 && (
							<>
								<Title style={{ margin: '50px 15px 30px 15px' }} level={2}>
									What your friends are attending
								</Title>

								<Slider {...SlickSettings(friendEventData)}>
									{friendEventData?.map((event) => {
										// If event starting date or end date is in passed, don't show it
										if (moment(event.startDate).isBefore(moment()) || moment(event.endDate).isBefore(moment())) {
											return null;
										}
										return (
											<>
												<EventCard event={event} />
											</>
										);
									})}

								</Slider>
							</>
						)}
					</>
				)}
			</MainContainer>
		</>
	);
};

export default Home;
