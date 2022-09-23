import styled from 'styled-components';
import { Skeleton, Typography, List, Avatar, Button, Modal, Form, Select, notification } from 'antd';
import FriendCard from './friends/FriendCard';
import { UserAddOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useForm } from 'antd/lib/form/Form';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import { UserType } from '@/lib/utils/types';
import FriendModal from './friends/FriendModal';
import AllFriendsModal from './friends/AllFriendsModal';

const { Title } = Typography;

interface Props {
	friends?: any;
	loading: boolean;
}

const count = 3;

const Container = styled.div`
	width: 90%;
`;

const HeaderContainer = styled.div`
	display: flex;
`;

interface FormValues {
	userId: string;
}

const Friends = ({ friends, loading }: Props) => {
	const [addFriendVisible, setAddFriendVisible] = useState(false);
	const [form] = useForm();
	const [cookies] = useCookies(['userObj']);
	const [allUsers, setAllUsers] = useState<UserType[]>([])
	const [friendModalVisible, setFriendModalVisible] = useState(false)
	const [friendModalData, setFriendModalData] = useState();
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		fetch('http://localhost:2102/users', {method: 'GET', headers: {
			'Authorization': `${getToken(cookies['userObj'])}`
		}}).then(res => res.json()).then(data => {
			setAllUsers(data)
		}).catch(error => {console.log("ERROR", error)})
	}, [])
	

	function handleFinish(values: FormValues) {
		fetch('http://localhost:2102/friends/add?id=' + values.userId, {method: 'POST', headers: {
			'Authorization': `${getToken(cookies['userObj'])}`
		}}).then(res => res.json()).then(data => {
			notification.success({message: 'Friend Request Sent'})
			form.resetFields();
			setAddFriendVisible(false);
		}).catch(error => {notification.error({message: 'Something went wrong'})})
	}

	function showFriend(friend: any) {
		setFriendModalData(friend)
		setFriendModalVisible(true)
	}

	if (loading) {
		return <Skeleton active />;
	}

	return (
		<Container>
			<HeaderContainer>
				<a style={{ display: 'flex', alignItems: 'center' }}>
					<Title level={2}>
						Friends <a style={{ fontSize: '1.5rem' }}>({friends.length})</a>{friends?.length > 0 && <AllFriendsModal loading={isLoading} friends={friends ?? []}/>}
					</Title>
				</a>
				<Button
					type="link"
					style={{ marginLeft: 'auto', marginTop: '5px' }}
					onClick={() => {
						setAddFriendVisible(true);
					}}
				>
					<UserAddOutlined />
					Add Friend
				</Button>
			</HeaderContainer>

			{friends.length === 0 ? (
				<div>You have no friends yet</div>
			) : (
				<List
					loading={loading}
					itemLayout="horizontal"
					dataSource={friends}
					renderItem={(item) => <FriendCard showFriend={showFriend} data={item} />}
					pagination={{
						pageSize:5,
						position: "bottom"
					  }}
				/>
			)}
			<Modal
				title="Add friend"
				visible={addFriendVisible}
				okText="Send Invite"
				onOk={() => {
					void form.validateFields().then(handleFinish);
				}}
				onCancel={() => {
					setAddFriendVisible(false);
				}}
			>
				<Form requiredMark={false} layout="vertical" onFinish={handleFinish} form={form}>
					<Form.Item rules={[{ required: true, message: 'Please select a user' }]} label="Find friends" name="userId">
						<Select showSearch placeholder="Search by name" optionFilterProp="children" allowClear>
							{allUsers.map((user) => {
								if (user._id !== cookies['userObj']._id && !friends.find((friend) => friend._id === user._id)) {
									return(								<Select.Option key={user._id} value={user._id}>
										{user.firstName} {user.lastName}
									</Select.Option>)
								}

							}

							)}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
			<FriendModal visible={friendModalVisible} setModalVisibe={setFriendModalVisible} data={friendModalData} />
		</Container>
	);
};

export default Friends;
