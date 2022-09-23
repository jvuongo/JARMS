import { useRouter } from 'next/router';
import Friends from '@/components/social/Friends';
import Invites from '@/components/social/Invites';
import FindFriends from '@/components/social/FindFriends';
import styled from 'styled-components';
import { Row, Col, Result, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import Head from 'next/head';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 1300px;
	margin: 0 auto;
`;

const Social = () => {
	const [data, setData] = useState();
	const [recommendedFriendsData, setRecommendedFriendsData] = useState();
	const [isLoading, setLoading] = useState(false);

	const router = useRouter();

	const [cookies] = useCookies(['userObj']);

	useEffect(() => {
		// While waiting for the server to send the data, show a loading message
		setLoading(true);
		fetch('http://localhost:2102/social', {method: 'GET', headers: {
			'Authorization': `${getToken(cookies['userObj'])}`
		}})
			// The response is a JSON object, so we can use .json() to parse it
			.then((res) => res.json())
			// Set the data to the parsed JSON object
			.then((data) => {
				setData(data);
				setLoading(false);
			}).catch(
				(error) => {
					return(  <Result
						status="403"
						title="403"
						subTitle="Sorry, you are not authorized to access this page."
						extra={<Button type="primary" onClick={() => {router.push('/login')}}>Login</Button>}
					  />)
				}
			);
	}, []);

	// This useEffect 'hook' with an empty array means it runs the code under
	// as soon as the page loads
	useEffect(() => {
		// While waiting for the server to send the data, show a loading message
		setLoading(true);
		fetch('http://localhost:2102/recommendedfriends', {
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// The response is a JSON object, so we can use .json() to parse it
			.then((res) => res.json())
			// Set the data to the parsed JSON object
			.then((data) => {
				setRecommendedFriendsData(data);
				setLoading(false);
			});
	}, []);

	return (
		<Container>
			<Row gutter={[16, 16]}>
				<Col span={12}>
					<Friends loading={isLoading} friends={data?.user?.friends ?? []} />
				</Col>
				<Col span={12}>
					<Invites loading={isLoading} invites={data?.invites ?? {
						events: [],
						friends: [],
						trades: []
					}}/>
				</Col>
				<Col span={24}>
					<FindFriends loading={isLoading} friends={recommendedFriendsData ?? []} />
				</Col>
			</Row>
		</Container>
	);
};

export default Social;
Social.layout = DefaultLayout
