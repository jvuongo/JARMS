import React, {useState} from 'react'
import {Button, Modal, Form, Input, notification} from 'antd'
import styled from 'styled-components';

const StarRatingContainer = styled.div` 
    margin-left: 300px
`;
const InputRadioContainer = styled.div` 
    display: none;
`;


const BroadcastModal = (eid) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm()
    const [confirmLoading, setConfirmLoading] = useState(false)

    const showModal = () => {
        setIsModalVisible(true)
    };

    const handleFinish = async (values) => {
        setIsModalVisible(false)
        
        await fetch('http://localhost:2102/broadcast?eid=' + eid.eid, {
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				...values
			}),
			method: 'POST',
		})
        .then(response => response.json())
        .then((data)=> {
            notification.success({ message: 'You have successfully broadcasted your message!' });
            form.resetFields()
        })

    }

    const handleCancel = () => {
        setIsModalVisible(false)
    };

    return (
        <>
        <Button type="primary" onClick= {showModal}>
            Broadcast
        </Button>
        <Modal 
            title = "Broadcast a message to all customers of your event." 
            visible={isModalVisible} 
            okText="Broadcast message" 
            onOk={() => {
                void form.validateFields().then(handleFinish)
            }} 
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
        > 
            <Form layout="vertical" form={form} onFinish={void handleFinish}>
                <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Please enter a message.' }]}>
                    <Input.TextArea showCount/>
                </Form.Item>
            </Form>
        </Modal>
       </>
    )

}

export default BroadcastModal
