import styled from 'styled-components';
import { Button, Col, Modal, Popconfirm, Rate, Result, Row, Space, Tag, Typography } from 'antd';
import getToken from '@/lib/helpers/getToken';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import { UserType } from '@/lib/utils/types';
import { CalendarFilled, EnvironmentFilled, LikeFilled } from '@ant-design/icons';
import moment from 'moment';
import { useEffect, useState } from 'react';

const ProfileImage = styled.img`
	width: 120px;
	height: 120px;
	margin: 8px 0 0 0;
	border-radius: 50%;
	border: 4px solid white;
	object-fit: cover;
	display: block;
	margin-left: auto;
	margin-right: auto;
`;

const ReviewContainer = styled.div`
	display: flex;
	align-items: center;
`;

interface Props {
	visible: boolean;
	data?: UserType;
	setModalVisibe: (value: boolean) => void;
}

const { Text, Title } = Typography;

const FriendModal = ({ visible, data, setModalVisibe }: Props) => {
	const [loading, setLoading] = useState(false);
	const [cookies] = useCookies(['userObj']);
	const router = useRouter();
	const [reviewsData, setReviewsData] = useState();
	const [reviewsLoading, setReviewsLoading] = useState(false);
	// This useEffect 'hook' with an empty array means it runs the code under
	// as soon as the page loads
	useEffect(() => {
		if (data === undefined) {
			return;
		}


		// While waiting for the server to send the data, show a loading message
		setReviewsLoading(true);
		fetch('http://localhost:2102/userreviews?uid=' + String(data?._id), {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// The response is a JSON object, so we can use .json() to parse it
			.then((res) => res.json())
			// Set the data to the parsed JSON object
			.then((data) => {
				setReviewsData(data);
				setReviewsLoading(false);
			});
	}, [data]);

	function removeFriend() {
		// While waiting for the server to send the data, show a loading message
		setLoading(true);
		fetch('http://localhost:2102/friends/remove?friend=' + String(data._id), {
			method: 'POST',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// The response is a JSON object, so we can use .json() to parse it
			.then(() => {
				setLoading(false);
				location.reload();
			})
			// Set the data to the parsed JSON object
			.catch((error) => {
				return (
					<Result
						status="403"
						title="403"
						subTitle="Sorry, you are not authorized to access this page."
						extra={
							<Button
								type="primary"
								onClick={() => {
									router.push('/login');
								}}
							>
								Login
							</Button>
						}
					/>
				);
			});
	}

	return (
		<Modal
			visible={visible}
			okText="Message"
			style={{
				overflow: 'auto',
				borderRadius: '10% 10%',
			}}
			onCancel={() => {
				setModalVisibe(false);
			}}
			bodyStyle={{
				backgroundImage: 'url(https://i.ibb.co/LNQ3F9Y/profiletemplate.png)',
			}}
			closable={false}
			footer={null}
		>
			<ProfileImage src={data?.avatar} />
			<Title style={{ textAlign: 'center', fontWeight: 'bold' }}>
				{' '}
				{data?.firstName} {data?.lastName}
			</Title>
			<Title level={5} style={{ textAlign: 'center' }}>
				{' '}
				{data?.bio ?? <span style={{ color: 'grey' }}>User has no biography</span>}
			</Title>
			<p></p>

			<Row>
				<Col span={8}>
					<Title level={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
						{' '}
						{data?.friends?.length}
					</Title>
					<p></p>
					<Title level={5} style={{ textAlign: 'center' }}>
						{' '}
						Friends
					</Title>
					<p></p>
				</Col>
				<Col span={8}>
					<Title level={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
						{' '}
						{data?.tickets?.length}
					</Title>
					<p></p>
					<Title level={5} style={{ textAlign: 'center' }}>
						{' '}
						Events Attended
					</Title>
					<p></p>
				</Col>
				<Col span={8}>
					<Title level={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
						{' '}
						{data?.hostedEvents?.length}
					</Title>
					<p></p>
					<Title level={5} style={{ textAlign: 'center' }}>
						{' '}
						Events Hosted
					</Title>
					<p></p>
				</Col>
			</Row>

			<Row
				justify="center"
				style={{ alignItems: 'center', backgroundColor: '#ecddf4', borderRadius: '24px', padding: '15px' }}
			>
				<Col>
					<Title level={5} style={{ textAlign: 'center', margin: '10px' }}>
						{' '}
						Recent event reviews{' '}
					</Title>
					<p></p>

					{!reviewsData ||
						(reviewsData?.length === 0 && (
							<span style={{ color: 'grey', padding: '20px', textAlign: 'center' }}>User has no reviews</span>
						))}

					{reviewsData?.length > 0 && (
						<>
							<ReviewContainer>
								<Text strong style={{ textAlign: 'center' }}>
									{' '}
									{'Event: ' + reviewsData?.at(-1).eid.title}{' '}
								</Text>
								<Text italic style={{ textAlign: 'center' }}>
									{'- ' + reviewsData?.at(-1).review}{' '}
								</Text>{' '}
								<Rate
									style={{ color: '#C43444', fontSize: '10px', margin: 'auto 10px' }}
									disabled
									value={reviewsData?.at(-1).rating}
								/>
							</ReviewContainer>

							{reviewsData?.length > 1 && (
								<ReviewContainer>
									<Text strong style={{ textAlign: 'center' }}>
										{'Event: ' + reviewsData?.at(-2).eid.title}{' '}
									</Text>
									<Text italic style={{ textAlign: 'center' }}>
										{'- ' + reviewsData?.at(-2).review}{' '}
									</Text>{' '}
									<Rate
										style={{ color: '#C43444', fontSize: '10px', margin: 'auto 10px' }}
										disabled
										value={reviewsData?.at(-2).rating}
									/>
								</ReviewContainer>
							)}
						</>
					)}
				</Col>
			</Row>
			<p></p>

			<Popconfirm
				title={`Are you sure you want to unfriend ${data?.firstName}?`}
				onConfirm={() => {
					removeFriend();
				}}
				okText="Yes"
			>
				<Button
					type="primary"
					shape="round"
					size="large"
					block={true}
					style={{ background: '#C43444' }}
					key="submit"
					loading={loading}
				>
					Unfriend
				</Button>
			</Popconfirm>

			<p></p>
			<Title level={5} style={{ textAlign: 'center' }}>
				{' '}
				{<CalendarFilled style={{ fontSize: '24px', color: '#BEC6EB' }} />} <Space> </Space> Joined{' '}
				{moment(data?.createdAt).fromNow()}
			</Title>

			<Title level={5} style={{ textAlign: 'center' }}>
				{' '}
				{<EnvironmentFilled style={{ fontSize: '24px', color: '#A020F0' }} />} <Space> </Space>
				Lives in{' '}
				{data?.location === undefined || data?.location === '' ? (
					<span style={{ color: 'grey' }}>N/A</span>
				) : (
					data?.location
				)}
			</Title>

			<Title level={5} style={{ textAlign: 'center' }}>
				{' '}
				{<LikeFilled style={{ fontSize: '24px', color: '#E8BEAC' }} />} <Space> </Space>
				Interested in{' '}
				{data?.interestedEventTypes?.length === 0 ? (
					<span style={{ color: 'grey' }}>N/A</span>
				) : (
					data?.interestedEventTypes?.map((eventType: string) => <Tag color={'red'}>{eventType}</Tag>)
				)}
			</Title>
		</Modal>
	);
};

export default FriendModal;
