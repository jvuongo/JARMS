import { useRouter } from 'next/router';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Request, Response } from 'express';
import { useState } from 'react';
import Notification from '../../components/signIn/Notification';

const Window = styled.div`
	display: flex;
	flex-direction: flex;
	justify-content: center;
	align-items: center;
	height: 50vh;
	width: 100vw;
`;

// Extract email from _id and show it in "reset password for ______"

const ResetPassword = () => {
	// Extract _id verify that its a user and then alter it
	// console.log(req.query.payload)

	const router = useRouter();
	// Send to another endpoint

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	function resetPassword() {
		var payload = {
			password: password,
			confirmedPassword: confirmPassword,
			userId: router.query.payload,
		};

		// Send email as body
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		};
		// Sending payload to endpoint
		fetch('http://localhost:2102/userResetPassword', requestOptions)
			.then((response) => response.json())
			.then((data) => {
				// No error message
				if (data[0] === undefined) {
					Notification('success', 'resetPasswordSuccess');
				}

				// Error in validation
				else {
					Notification('error', 'resetPassword', data);
				}
			});
	}

	return (
		<Window>
			<Form
				name="normal_login"
				className="login-form"
				initialValues={{ remember: true }}
				style={{ width: '50%', marginRight: 0 }}
			>
				<Form.Item name="Password" rules={[{ required: true, message: 'Please input your new password!' }]}>
					<Input
						prefix={<UserOutlined className="site-form-item-icon" />}
						placeholder="New Password"
						onChange={(e) => setPassword(e.target.value)}
						type="password"
					/>
				</Form.Item>
				<Form.Item name="PasswordConfirm" rules={[{ required: true, message: 'Please confirm your password!' }]}>
					<Input
						prefix={<UserOutlined className="site-form-item-icon" />}
						placeholder="Confirm new Password"
						type="password"
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
				</Form.Item>
				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						className="login-form-button"
						style={{ background: 'green', borderColor: 'green' }}
						block
						onClick={resetPassword}
					>
						Reset password
					</Button>
				</Form.Item>
			</Form>
		</Window>
	);
};

export default ResetPassword;
