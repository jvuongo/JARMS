import { useState, useEffect } from 'react';
import { Button, List, Avatar, notification } from 'antd';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import UserModal from '@/components/user/UserModal';

interface UserInfoType {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
}

interface TicketTradeRequestContainerProps {
    requestData: any;
    showViewRequestModal: () => void;
    setSelectedRequestData: (active: any) => void;
    setSelectedRequestType: (active: any) => void;
    requestType: string;
    reloadRequests: () => void;
}

const TicketTradeRequestContainer = ({ requestData, showViewRequestModal, setSelectedRequestData, setSelectedRequestType, requestType, reloadRequests }: TicketTradeRequestContainerProps) => {
    const [tradeWithUserData, setTradeWithUserData] = useState<UserInfoType | undefined>();

    // variables and helper function for view user profile modal
    const [userModalVisible, setUserModalVisible] = useState(false);
	const [userModalData, setUserModalData] = useState();
    function showUser(user: any) {
		setUserModalData(user)
		setUserModalVisible(true)
	}
    
    // get cookies for logged in user id
    const [cookies] = useCookies(['userObj']);
    
    // this useEffect runs whenever requestData is updated
    // get user information of user associated with ticket trade request
    useEffect(() => {
        if (requestType === "incoming") {
            var uid = requestData.offeredTicket.uid;
        } else if (requestType === "outgoing") { 
            var uid = requestData.requestedTicket.uid;
        } else {
            return;
        }
        // console.log("uid = " + uid);

        // only fetch user information requestData exists
        if (requestData) {
            // Make fetch request
            fetch('http://localhost:2102/user?uid=' + uid, {method: 'GET', headers: {
                'Authorization': `${getToken(cookies['userObj'])}`
            }})
                // parse response JSON object
                .then((res) => res.json())
                // Set userData to the parsed JSON object
                .then((userData) => {
                    setTradeWithUserData(userData);
                });
        }
    }, [requestData]);
    
    function handleViewTicketTradeRequest() {
        setSelectedRequestData(requestData);
        setSelectedRequestType(requestType);
        showViewRequestModal();
    }

    function requestDescription(requestData: any, requestType: string) {
        if (requestType === "incoming") {
            return <>wants to trade their <strong>{requestData.offeredTicket.eventName}</strong> ticket for your <strong>{requestData.requestedTicket.eventName}</strong> ticket.</>;
        }
        if (requestType === "outgoing") {
            return <>has a ticket to <strong>{requestData.requestedTicket.eventName}</strong> that you want to trade for your <strong>{requestData.offeredTicket.eventName}</strong> ticket.</>;
        }
    }

    function requestAvatar() {
        if (tradeWithUserData) {
            if (tradeWithUserData.avatar) {
                return tradeWithUserData.avatar;
            }
        }
        return "https://res.cloudinary.com/dwiv2vrtr/image/upload/v1649839717/g3zikqheqxndsygxr2i8.webp";
    }

    function getActionForRequestType() {
        if (requestType === "incoming") {
            return "Decline";
        }
        if (requestType === "outgoing") {
            return "Cancel";
        }
    }

    const requestDeletedNotification = () => {
        notification['success']({
            message: 'Ticket Trade Request Deleted',
            description:
                '',
        });
    };

    // delete a ticket trade request then reload request list
    function handleDeleteTicketTradeReqest() {
        // Send payload to endpoint to delete ticket trade request
        fetch('http://localhost:2102/tickettrade?_id=' + requestData?._id, {
            method: 'DELETE',
            headers: {
                Authorization: `${getToken(cookies['userObj'])}`,
            },
        })  .then(() => {
                reloadRequests();
                requestDeletedNotification();
            });
    }
    
    return (
        <>
            <List.Item
                style={{position: 'relative', height: '120px', paddingBottom: '40px'}}
                actions={[
                    <a onClick={handleDeleteTicketTradeReqest}>{getActionForRequestType()}</a>, 
                    <Button type='primary' onClick={handleViewTicketTradeRequest}>View Request</Button>
                ]}
            >
                <List.Item.Meta
                    avatar={<Avatar src={requestAvatar()} />}
                    title={<a onClick={() => { showUser(tradeWithUserData) }}>{tradeWithUserData?.firstName + " " + tradeWithUserData?.lastName}</a>}
                    description={requestDescription(requestData, requestType)}
                />

            </List.Item>
            <UserModal visible={userModalVisible} setModalVisibe={setUserModalVisible} data={userModalData} />

        </>
    )
};

export default TicketTradeRequestContainer;
