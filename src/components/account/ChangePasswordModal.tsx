import { Modal, Input, Form, Alert, Button, notification } from 'antd';
import { useState } from 'react';
import Notification from '../../components/signIn/Notification';
import { useCookies } from 'react-cookie';

interface Props {
	visible: boolean;
	setModalVisible: (visible: boolean) => void;
}

interface formValues {
	newPassword: string;
	confirmPassword: string;
}

const PasswordModal = ({ visible, setModalVisible }: Props) => {
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [cookies] = useCookies(['userObj']);

	function resetPassword(password: String) {
		var payload = {
			password: password,
			confirmedPassword: password,
			userId: cookies.userObj._id,
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

	const handleFinish = (values: formValues) => {
		if (values.newPassword !== values.confirmPassword) {
			setErrorMsg('Passwords do not match');
			return;
		}

		resetPassword(values.newPassword);

		setModalVisible(false);
	};
	const handleCancel = () => {
		setModalVisible(false);
	};

	return (
		<>
			<Modal
				title="Update Password"
				visible={visible}
				onCancel={handleCancel}
				cancelButtonProps={{ style: { display: 'none' } }}
				okButtonProps={{ style: { display: 'none' } }}
				okText={'Update'}
				centered
			>
				<Form layout="vertical" requiredMark={false} onFinish={handleFinish}>
					<Form.Item
						label="New Password"
						name="newPassword"
						requiredMark={false}
						required
						rules={[{ required: true, message: 'Password cannot be empty' }]}
						extra="At least 8 characters including a lower-case letter, an upper-case letter, and a number."
						validateStatus="success"
					>
						<Input.Password style={{ width: '100%' }} placeholder="*******" />
					</Form.Item>

					<Form.Item
						label="Confirm Password"
						name="confirmPassword"
						requiredMark={false}
						required
						rules={[{ required: true, message: 'Passwords must match' }]}
						extra="Both passwords must match."
						validateStatus="success"
					>
						<Input.Password placeholder="*******" />
					</Form.Item>
					{errorMsg && (
						<Alert
							onClose={() => {
								setErrorMsg(null);
							}}
							style={{ marginBottom: '15px' }}
							closable
							message="Passwords don't match"
							type="error"
							showIcon
						/>
					)}

					<Form.Item>
						<Button htmlType="submit" type="primary" size="middle" style={{ borderRadius: '8px', float: 'right' }}>
							Update
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default PasswordModal;
