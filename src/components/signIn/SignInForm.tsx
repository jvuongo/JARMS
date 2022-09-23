import { Form, Input, Button, Modal, Typography } from 'antd';
import { useCookies } from 'react-cookie';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Notification from './Notification';
import styled from 'styled-components';

const Window = styled.div`
	height: 75vh;
	width: 30vw;
	background: white;
	border-radius: 10px;
	display: flex;
	flex-direction: column;
	position: absolute;
`;

const { Title } = Typography;

const SignInForm = () => {
	const router = useRouter();

	const [cookies, setCookies, removeCookie] = useCookies();

	const [resetEmail, setResetEmail] = useState('');

	function onChangeResetEmail(event: React.ChangeEvent<HTMLInputElement>) {
		setResetEmail(event.target.value);
	}

	const [password, setPassword] = useState('');

	const [resetPasswordScreen, setResetPasswordScreen] = useState(false);

	const [email, setEmail] = useState('');

	function onChangeEmail(event: React.ChangeEvent<HTMLInputElement>) {
		setEmail(event.target.value);
	}

	function onChangePassword(event: React.ChangeEvent<HTMLInputElement>) {
		setPassword(event.target.value);
	}

	var payload = {
		email: email,
		password: password,
	};

	function submit() {
		console.log(payload);

		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		};

		// Sending payload to endpoint
		fetch('http://localhost:2102/login', requestOptions)
			.then((response) => response.json())
			.then((data) => {
				console.log('LOGGED IN', data);
				// There is no error
				if (data[0] === undefined) {
					// Store user object and store as cookie
					// middleware
					// store user object
					// removeCookie('userObj', { path: '/' });
					setCookies('userObj', data, { path: '/' });

					// Redirect to homepage
					router.push('/');
				}
				// Check if error
				else {
					// Show notification
					Notification('error', 'signIn', data);
				}
			});
	}

	// Send grid to attached email with password reset link and _id
	// That is how we will verify the use email
	function sendResetLink() {
		console.log('email ' + resetEmail);

		var payload = {
			email: resetEmail,
		};

		// Send email as body
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		};
		console.log(requestOptions);
		// Sending payload to endpoint
		fetch('http://localhost:2102/userResetPasswordLink', requestOptions)
			.then((response) => response)
			.then((data) => {
				Notification('success', 'resetLink', data);
			});
	}

	return (
		<>
			<Modal
				title="Reset password"
				visible={resetPasswordScreen}
				onCancel={(e) => setResetPasswordScreen(false)}
				footer={null}
			>
				<Form initialValues={{ remember: true }} style={{ width: '100%', marginRight: 0 }}>
					<Form.Item name="Email" rules={[{ required: true, message: 'Please input your Email!' }]}>
						<Input
							prefix={<UserOutlined className="site-form-item-icon" />}
							placeholder="Email"
							onChange={onChangeResetEmail}
						/>
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" className="login-form-button" block onClick={sendResetLink}>
							Send Reset password link
						</Button>
					</Form.Item>
				</Form>
			</Modal>

			<Form
				name="normal_login"
				className="login-form"
				initialValues={{ remember: true }}
				style={{ width: '60%', marginRight: 0 }}
				size="large"
			>
				{/* <Title style={{fontFamily: 'lato', margin: '25px 0px'}} level={3}> Log in </Title> */}
				<Form.Item
					name="Email"
					rules={[{ required: true, message: 'Please input your Email!' }]}
					style={{ marginBottom: 10, marginTop: 55 }}
				>
					<Input
						prefix={<UserOutlined className="site-form-item-icon" />}
						placeholder="Email"
						onChange={onChangeEmail}
					/>
				</Form.Item>
				<Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
					<Input
						prefix={<LockOutlined className="site-form-item-icon" />}
						type="password"
						placeholder="Password"
						onChange={onChangePassword}
					/>
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" className="login-form-button" block onClick={submit}>
						Sign In
					</Button>
				</Form.Item>

				<Form.Item>
					<Button onClick={() => setResetPasswordScreen(true)} type="link" className="login-form-button" block>
						Reset password
					</Button>
				</Form.Item>
			</Form>
		</>
	);
};

export default SignInForm;
