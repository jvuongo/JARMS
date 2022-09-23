import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Button, Card, Modal, Result, Row, Skeleton, PageHeader, Divider, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Base64 } from 'js-base64';
import { useRouter } from 'next/router';
import moment from 'moment';
import getToken from '@/lib/helpers/getToken';
import styled from 'styled-components';

const initialOptions = {
	'client-id': 'AXN1SL082upVZCwkiJ9LAYR3boYr3d5_amfDUlu-Xx8fbeMjU6Ft6Rt2RYvG_RLdCcg7qMKBq73qNMFU',
	currency: 'AUD',
	intent: 'capture',
};

const SelectPayment = styled.div`
	display: flex;
	margin: 50px 0px 20px 0px;
	font-size: 1.1rem;
    font-weight: 400;
`;

const EventInfo = styled.div`
	display: flex;
	justify-content: space-between;\
    

	.body {
		width: 75%;
        padding-top: 40px;
		margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 500;
	}

    .image-container {
        width: 40%;
        display: flex;
		margin: 0 auto;
        justify-content: center;
        align-items: center;
    }

    .subtitle {
        color: #909090;
        font-size: 1rem;
        font-weight: 400;
    }

	.price {
		font-size: 1.6rem;
	}

	img {
		object-fit: contain;
		width: 200px;
	}

    .price-text {
        padding-right: 40px;
        font-size: 1rem;
        display: flex;
        width: 100%;
        justify-content: space-between;
    }

    .price-text-title {
        color: #949494;
    }
`;

const ticketErrorNotification = () => {
	notification['error']({
		message: 'Something went wrong',
		description: 'There was an error while making your ticket. Please try again.',
	});
};

const Checkout = () => {
	const [eventData, setEventData] = useState<undefined>();
	const [isLoading, setLoading] = useState(false);
	const [cookies] = useCookies(['userObj']);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const router = useRouter();

	const showModal = () => {
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	// This useEffect 'hook' with an empty array means it runs the code under
	// as soon as the page loads
	useEffect(() => {
		if (!router.isReady) return;
		const { eid } = router.query;

		// While waiting for the server to send the data, show a loading message
		setLoading(true);

		fetch('http://localhost:2102/event?eid=' + eid, {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			// The response is a JSON object, so we can use .json() to parse it
			.then((res) => res.json())
			// Set the data to the parsed JSON object
			.then((eventData) => {
				setEventData(eventData);
				setLoading(false);
			})
			.catch((err) => {
				console.log("Couldn't fetch event data at checkout");
			});
	}, [router.isReady]);

	const createTicket = () => {
		// Get id of current event from url
		const eid = router.query.eid;

        if (!cookies['userObj']) {
            ticketErrorNotification();
            return;
        }

		var ticketPayload = {
			eid: eid,
            uid: cookies['userObj']?._id,
			email: cookies['userObj']?.email,
			eventName: eventData?.title,
			eventHost: eventData?.host.firstName + ' ' + eventData?.host.lastName,
			eventDate: moment(eventData?.startDate).format('DD MMMM YYYY'),
		};

		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(ticketPayload),
		};

		// Sending payload to endpoint
		fetch('http://localhost:2102/tickets', requestOptions)
			.then((res) => res.json())
			.then((data) => {
				// Sending payload to endpoint to attach ticket to user
				fetch('http://localhost:2102/attachticket?_id=' + data._id + '&uid=' + cookies['userObj']._id, {
					method: 'PATCH',
					headers: {
						Authorization: `${getToken(cookies['userObj'])}`,
					},
				});
			});
	};

	const ticketRedirect = () => {
		// Sending payload to endpoint
		fetch('http://localhost:2102/tickets', {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				// Redirect to ticket page
				router.push('/ticket/' + data.slice(-1)[0]._id);
			});
	};

	const attachPaymentID = (paymentID) => {
		const eid = router.query.eid;
		// Sending payload to endpoint
		fetch('http://localhost:2102/tickets', {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				// Sending payload to endpoint to attach payment ID to ticket
				fetch('http://localhost:2102/payment?_id=' + data.slice(-1)[0]._id + '&paymentID=' + paymentID, {
					method: 'PATCH',
					headers: {
						Authorization: `${getToken(cookies['userObj'])}`,
					},
				});

				// Sending payload to endpoint to attach ticket to event
				fetch('http://localhost:2102/attendevent?eid=' + eid + '&_id=' + data.slice(-1)[0]._id, {
					/////
					method: 'PATCH',
					headers: {
						Authorization: `${getToken(cookies['userObj'])}`,
					},
				});
			});
	};

	if (isLoading || !eventData) {
		return <Skeleton active />;
	}


	return (
		<div style={{fontFamily: 'lato'}}>
			<Modal visible={isModalVisible} onCancel={handleCancel} footer={null}>
				<Result
					status="success"
					title="Successfully Booked Ticket!"
					extra={[
						<Button type="primary" onClick={ticketRedirect}>
							Go To Ticket
						</Button>,
					]}
				/>
			</Modal>

			<Row type="flex" justify="center" align="middle" style={{ minHeight: '75vh' }}>
				<Card
					title={
						<PageHeader
							style={{ padding: 0 }}
							onBack={() => {
								history.back();
							}}
							title={<span style={{ fontSize: '1.4rem', fontWeight: '400' }}>Checkout</span>}
						/>
					}
					style={{ width: '40%', borderRadius: 10 }}
					cover={
						<EventInfo>
                            <div className='image-container'>
							<img alt="example" src={eventData?.image ?? ''} />

                            </div>
							<div className="body">
                                <div>
								<div className="title">{eventData?.title}</div>
                                <div className="subtitle">{eventData?.location}</div>
                                </div>

                                <Divider style={{paddingRight: '20px', width: '40%'}}></Divider>

								<div className="price">
                                    <div className='price-text'>
                                        <span className='price-text-title'>Ticket price: </span>
                                        <span className='price-text-value'>${eventData?.ticketPrice.toFixed(2)}</span>
                                    </div>
                                    <div className='price-text'>
                                        <span className='price-text-title'>Booking fee: </span>
                                        <span className='price-text-value'>$0.00</span>
                                    </div>
                                    <Divider style={{paddingRight: '20px', width: '40%'}}></Divider>

                                    <div className='price-text'>
                                        <span className='price-text-title'>Total: </span>
                                        <span className='price-text-value'>${eventData?.ticketPrice.toFixed(2)}</span>
                                    </div>
                                </div>
							</div>
						</EventInfo>
					}
				>
					<SelectPayment>Please select a payment method:</SelectPayment>

					<PayPalScriptProvider options={initialOptions}>
						<PayPalButtons
							createOrder={(data, actions) => {
								return actions.order.create({
									purchase_units: [
										{
											amount: {
												value: eventData?.ticketPrice,
											},
										},
									],
								});
							}}
							onApprove={(data, actions) => {
								return actions.order.capture().then((details) => {
									createTicket();
									// Paypal Transaction ID
									attachPaymentID(details.purchase_units[0].payments?.captures[0].id);
									showModal();
								});
							}}
						/>
					</PayPalScriptProvider>
				</Card>
			</Row>
		</div>
	);
};

export default Checkout;
