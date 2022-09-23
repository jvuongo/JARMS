import React, {useEffect, useState} from 'react'
import {Button, Modal, Form, Input, Rate, notification} from 'antd'
import { StarFilled, StarOutlined } from '@ant-design/icons'
// import StarRating from '@/components/review/StarRating';
import styled from 'styled-components';
import {useRouter} from 'next/router';
import { useCookies } from 'react-cookie';
import { Base64 } from 'js-base64';
import { route } from 'next/dist/server/router';
import getToken from '@/lib/helpers/getToken';

const StarRatingContainer = styled.div` 
    margin-left: 300px
`;
const InputRadioContainer = styled.div` 
    display: none;
`;


/*
TODO:
 - Need to include event_id, user_id
 - Create a review object containing the review, ratings etc
 - Need to create a review controller to view reviews, submit reviews
*/


const ReviewModal = (eid, disableButton) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const showModal = () => {
        setIsModalVisible(true)
    };

	const [cookies] = useCookies(['userObj']);
	//console.log(cookies);
//    console.log("eid", eid.eid)

	const user = cookies.userObj;
    const router = useRouter();

    // Currently the handleFinish does not send the event_id with the review
    const handleFinish = async (values) => {
        //console.log(values)
        setIsModalVisible(false)
        const token = Base64.encode(JSON.stringify(cookies['userObj']));

        await fetch('http://localhost:2102/reviews', {
			headers: {
				'Content-Type': 'application/json',
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify({
				...values,
                reviewer: user._id,
                eid: eid.eid
			}),
			method: 'POST',
		})
        .then(response => response.json())
        .then((data)=> {
            // Send payload to endpoint to attach review to event
            //console.log("data", data)
            //router.push("/")
            fetch('http://localhost:2102/attachreview?token=' + token + '&rid=' + data._id + '&eid=' + data.eid, {method: 'PATCH', headers: {
                'Authorization': `${getToken(cookies['userObj'])}`
            }})
            openNotification()
            // location.reload();
        })

    }

    const openNotification = () => {
        notification.open({
          message: 'Review submitted',
          description:
            'You have succesfully submitted a review!',
          onClick: () => {
            console.log('Notification Clicked!');
          },
        });
      };

    const handleCancel = () => {
        setIsModalVisible(false)
    };

    return (
        <>
        <Button type="primary" onClick= {showModal} size="large" disabled = {eid.disableButton}>
            Review
        </Button>
        <Modal 
            title = "Write a review" 
            visible={isModalVisible} 
            okText="Submit Review" 
            onOk={() => {
                void form.validateFields().then(handleFinish)
            }} 
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
        > 
            <Form layout="vertical" form={form} onFinish={void handleFinish}>
                <Form.Item name="rating" label="Rating">
                    <Rate
                        allowHalf
                    />
                </Form.Item>
                <Form.Item name="review" label="Review" rules={[{ required: true, message: 'Please enter a review' }]}>
                    <Input.TextArea autoSize showCount/>
                </Form.Item>
            </Form>
        </Modal>
       </>
    )

}

export default ReviewModal