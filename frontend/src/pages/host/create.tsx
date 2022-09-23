import HostLayout from '@/components/layouts/HostLayout';
import { WidgetLoader } from 'react-cloudinary-upload-widget';
import UploadWidget from '@/components/host/UploadWidget';
import {
	Row,
	Col,
	Input,
	PageHeader,
	Typography,
	Select,
	Form,
	DatePicker,
	InputNumber,
	Switch,
	Tooltip,
	Avatar,
	Button,
	Skeleton,
	Divider,
	Space,
	notification,
} from 'antd';
import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from 'react';
import styled from 'styled-components';
import { DEFAULT_EVENT_TYPES, LETTER_COLOURS } from '@/lib/utils/constants';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { PlusOutlined } from '@ant-design/icons';
import { Base64 } from 'js-base64';
import getToken from '@/lib/helpers/getToken';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DatePickContainer = styled.div`
	display: flex;
`;

const PrivateEventContainer = styled.div`
	display: flex;
`;

interface FriendType {
	_id: string;
	firstName: string;
	lastName: string;
}

const CreateEvent = () => {
	const [form] = Form.useForm();
	const [imageUrl, setImageUrl] = useState(
		'https://res.cloudinary.com/dwiv2vrtr/image/upload/c_scale,w_353/v1647937839/icon-no-image_b2gask.svg',
	);
	const [isPrivate, setIsPrivate] = useState(false);
	const [invited, setInvited] = useState<string[]>([]);
	const [customTag, setCustomTag] = useState('');

	const [cookies] = useCookies(['userObj']);

	const user = cookies.userObj;
	const router = useRouter();

	if (!cookies) {
		return <Skeleton active />;
	}

	const friendsList: FriendType[] = user ? user.friends : [];

	const [friends, setFriends] = useState<any[]>([]);

	useEffect(() => {
		const requestOptions = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		};
		fetch('http://localhost:2102/friends', requestOptions)
			.then((response) => response.json())
			.then((arrayOfFriends) => {
				setFriends(arrayOfFriends);
			});
	}, []);

	const onFinish = async (values: any) => {

		const token = Base64.encode(JSON.stringify(cookies['userObj']));

		await fetch('http://localhost:2102/events', {
			headers: {
				'Content-Type': 'application/json',
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify({
				...values,
				imageUrl,
				user_id: user._id,
			}),
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				// Attach the event to the host's hostedEvents list
				fetch('http://localhost:2102/attachhostevents?_id=' + data._id + '&uid=' + user._id, {
					method: 'PATCH',
					headers: {
						Authorization: `${getToken(cookies['userObj'])}`,
					},
				});
				router.push('/host');
				notification.success({ message: 'Event created successfully!' });
			});
	};

	function handleTagChange(value: string) {
		value = String(value);

		if (value === '') {
			form.setFieldsValue({ eventTags: [] });
		} else {
			const tagsSplit = value.split(',');
			form.setFieldsValue({ eventTags: tagsSplit });
		}
	}

	function handleInviteChange(selectedItems) {
		setInvited(selectedItems);
	}

	function onCustomTagChange(event: React.ChangeEvent<HTMLInputElement>) {
		setCustomTag(event.target.value);
	}

	function addCustom() {
		form.setFieldsValue({ eventTags: [...form.getFieldValue('eventTags'), customTag] });
		setCustomTag('');
	}

	return (
		<>
			<PageHeader title={<Title level={3}>Create an Event</Title>} />
			<WidgetLoader />
			<Row style={{ padding: '0px 25px' }}>
				<Col span={14}>
					<Form
						requiredMark={false}
						initialValues={{ eventTags: [] }}
						onFinish={onFinish}
						id="bulk-item-edit"
						form={form}
						layout="vertical"
					>
						<Form.Item
							label="Event Name"
							name="eventName"
							rules={[{ required: true, message: 'Please enter an Event name' }]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="Description"
							name="eventDescription"
							rules={[{ required: true, message: 'Please enter a description' }]}
						>
							<TextArea />
						</Form.Item>
						<Form.Item label="Ticket Price" name="ticketPrice">
							<InputNumber placeholder="FREE" />
						</Form.Item>
						<Form.Item label="Tags" name="eventTags">
							<Select
								mode="multiple"
								style={{ width: '100%' }}
								placeholder="Add Tags"
								onChange={handleTagChange}
								optionLabelProp="label"
								dropdownRender={(menu) => (
									<>
										{menu}
										<Divider style={{ margin: '8px 0' }} />
										<Space align="center" style={{ padding: '0 8px 4px' }}>
											<Input placeholder="Please enter item" value={customTag} onChange={onCustomTagChange} />
											<Typography.Link onClick={addCustom} style={{ whiteSpace: 'nowrap' }}>
												<PlusOutlined /> Add Custom Tag
											</Typography.Link>
										</Space>
									</>
								)}
							>
								{DEFAULT_EVENT_TYPES.map((type) => (
									<Option value={type} label={type}>
										<div>{type}</div>
									</Option>
								))}
								;
							</Select>
						</Form.Item>
						<DatePickContainer>
							<Form.Item
								label="Start date"
								style={{ width: '230px' }}
								name="eventStartDate"
								rules={[{ required: true, message: 'Please choose a date' }]}
							>
								<DatePicker />
							</Form.Item>
							<Form.Item
								label="End date"
								name="eventEndDate"
								rules={[{ required: true, message: 'Please choose a date' }]}
							>
								<DatePicker />
							</Form.Item>
						</DatePickContainer>
						<PrivateEventContainer>
							<Form.Item label="Private Event?" name="isPrivate" style={{ width: '230px' }}>
								<Switch
									onChange={(checked) => {
										setIsPrivate(checked);
									}}
								/>
							</Form.Item>
							{!isPrivate && (
								<Form.Item label="Max Guests" name="maxGuests">
									<InputNumber />
								</Form.Item>
							)}
						</PrivateEventContainer>
						<Form.Item
							label="Location"
							name="eventLocation"
							rules={[{ required: true, message: 'Please provide a location' }]}
						>
							<Input />
						</Form.Item>
						<Form.Item label="Invite friends" name="eventInvites">
							<Select
								mode="multiple"
								placeholder="Add friends by name"
								value={invited}
								onChange={handleInviteChange}
								style={{ width: '100%' }}
								optionLabelProp="label"
							>
								{friends.map((item) => {
									return (
										<Select.Option key={item._id} value={item._id} label={item.firstName}>
											{`${item.firstName} ${item.lastName}`}
										</Select.Option>
									);
								})}
							</Select>
						</Form.Item>
						<div>
							<Avatar.Group
								maxCount={3}
								size="large"
								maxStyle={{
									color: '#f56a00',
									backgroundColor: '#fde3cf',
								}}
							>
								{invited?.map((item) => {

									const object = friends.find((friend) => friend._id === item);
									const firstLetter: string = object?.firstName.charAt(0).toUpperCase() ?? '';
									return (
										<Tooltip title={`${object.firstName} ${object.lastName}`} placement="top">
											<Avatar
												src={object?.avatar ?? "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1649839717/g3zikqheqxndsygxr2i8.webp"}
											>
											</Avatar>
										</Tooltip>
									);
								})}
							</Avatar.Group>
							<Button htmlType="submit" style={{ float: 'right' }}>
								Create
							</Button>
						</div>
					</Form>
				</Col>
				<Col span={10} style={{ padding: '30px 60px' }}>
					<Title level={5}>Edit cover photo</Title>
					{imageUrl && (
						<img src={imageUrl} alt="avatar" style={{ width: '100%', maxWidth: '200px', margin: '20px 0px' }} />
					)}
					<UploadWidget
						onSuccessCallback={(url) => {
							setImageUrl(url);
						}}
					/>
				</Col>
			</Row>
		</>
	);
};

export default CreateEvent;
CreateEvent.Layout = HostLayout;
