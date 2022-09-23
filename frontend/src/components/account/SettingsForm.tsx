import { Button, Form, Input, Row, notification, Select, Divider, Space, Typography } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { isEqual } from 'lodash';
import ChangePasswordModal from './ChangePasswordModal';
import getToken from '@/lib/helpers/getToken';
import { useCookies } from 'react-cookie';
import _ from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import { DEFAULT_EVENT_TYPES } from '@/lib/utils/constants';
import { useForm } from 'antd/lib/form/Form';

const { Option } = Select;
interface UserFormValue {
	firstName: string;
	lastName: string;
	bio: string;
	gender: string;
	age: string | number;
	email: string;
	location: string;
	interestedEventTypes: string[];
}

interface UserFormProps {
	user?: any;
}

const UserForm = ({ user }: UserFormProps) => {
	const [cookies, setCookie] = useCookies(['userObj']);
	const userData = cookies.userObj;
	const [form] = useForm();
	const [customTag, setCustomTag] = useState('');

	const initialValues: UserFormValue = useMemo(
		() => ({
			firstName: user?.firstName ?? '',
			lastName: user?.lastName ?? '',
			bio: user?.bio ?? '',
			age: user?.age ?? '',
			gender: user?.gender ?? '',
			email: user?.email ?? '',
			location: user?.location ?? '',
			interestedEventTypes: user?.interestedEventTypes ?? '',
		}),
		[user],
	);

	const [updateDisabled, setUpdatedDisabled] = useState(true);
	const [passwordModalVisible, setPasswordModalVisible] = useState(false);

	const handleFinish = useCallback(async (values: UserFormValue) => {
		const updatedFields = {
			firstName: values.firstName,
			lastName: values.lastName,
			email: values.email,
			bio: values.bio,
			age: values.age,
			gender: values.gender,
			location: values.location,
			interestedEventTypes: values.interestedEventTypes,
		};

		fetch('http://localhost:2102/me', {
			method: 'POST',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedFields),
		}).then(() => {

			notification.success({ message: 'Profile updated!' });
			setCookie('userObj', _.merge(userData, updatedFields), { path: '/' });
			setUpdatedDisabled(true);
		});
	}, []);

	const handleChange = (changed: UserFormValue, allValues: UserFormValue) => {
		if (isEqual(initialValues, allValues)) {
			setUpdatedDisabled(true);
		} else {
			setUpdatedDisabled(false);
		}
	};

	function onCustomTagChange(event: React.ChangeEvent<HTMLInputElement>) {
		setCustomTag(event.target.value);
	}

	function addCustom() {
		form.setFieldsValue({ interestedEventTypes: [...form.getFieldValue('interestedEventTypes'), customTag] });
		setCustomTag('');
	}

	function handleTagChange(value: string) {
		value = String(value);

		if (value === '') {
			form.setFieldsValue({ interestedEventTypes: [] });
		} else {
			const tagsSplit = value.split(',');
			form.setFieldsValue({ interestedEventTypes: tagsSplit });
		}
	}
	return (
		<>
			<Form
				layout="vertical"
				initialValues={initialValues}
				requiredMark={false}
				style={{ width: '100%', fontWeight: 'bold' }}
				onFinish={handleFinish}
				onValuesChange={handleChange}
				form={form}
			>
				<Form.Item required label="Bio" name="bio">
					<Input bordered={false} placeholder="Update your bio" style={{ padding: 0 }} />
				</Form.Item>
				<Row justify="space-between">
					<Form.Item
						label="First Name"
						name="firstName"
						requiredMark={false}
						required
						style={{ width: '47%' }}
						rules={[{ required: true, message: 'Please enter a first name' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						required
						label="Last Name"
						name="lastName"
						style={{ width: '47%' }}
						rules={[{ required: true, message: 'Please enter a last name' }]}
					>
						<Input />
					</Form.Item>
				</Row>

				<Form.Item
					required
					label="Email"
					name="email"
					rules={[
						{ required: true, message: 'Please enter an email address' },
						{ type: 'email', message: 'Please enter a valid email address' },
					]}
				>
					<Input />
				</Form.Item>

				<Row justify="space-between">
					<Form.Item label="Age" name="age" requiredMark={false} required style={{ width: '27%' }}>
						<Input placeholder='N/A'  />
					</Form.Item>

					<Form.Item required label="Gender" name="gender" style={{ width: '67%' }}>
						<Input placeholder='N/A' />
					</Form.Item>
				</Row>
				<Form.Item required label="Location" name="location">
					<Input placeholder='N/A' />
				</Form.Item>

				<Form.Item required label="Interested event types" name="interestedEventTypes">
					<Select
						mode="multiple"
						style={{ width: '100%', fontWeight: 400 }}
						placeholder="Show people what type of events you're into"
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
				<div style={{ width: '100%', marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
					<Form.Item>
						<Button
							htmlType="submit"
							type="primary"
							disabled={updateDisabled}
							size="middle"
							style={{ borderRadius: '8px' }}
						>
							Update
						</Button>
					</Form.Item>
					<Form.Item>
						<Button
							style={{ borderRadius: '8px' }}
							type="primary"
							size="middle"
							onClick={() => {
								setPasswordModalVisible(true);
							}}
						>
							Change Password
						</Button>
					</Form.Item>
				</div>
			</Form>
			<ChangePasswordModal visible={passwordModalVisible} setModalVisible={setPasswordModalVisible} />
		</>
	);
};

export default UserForm;
