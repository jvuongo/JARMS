import { useState, useEffect } from 'react';
import { Typography, Space, Button, notification } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import MiniEventView from '@/components/event/MiniEventView';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import UserModal from '@/components/user/UserModal';


const { Title, Text, Paragraph } = Typography;

interface UserInfoType {
    _id: string;
    firstName: string;
    lastName: string;
}

const SmallUserTitle = styled(Text)`
    color: #C43444 !important; 
    cursor: pointer;
    &:hover {
        text-decoration: underline;
      }
`

interface ViewTicketTradeRequestProps {
    requestData: any;
    requestType: string | undefined;
    hideViewRequestModal: () => void;
    reloadRequests: () => void;
}

const ViewTicketTradeRequest = ({requestData, requestType, hideViewRequestModal, reloadRequests}: ViewTicketTradeRequestProps) => {
    const [tradeWithUserData, setTradeWithUserData] = useState<UserInfoType | undefined>();
    const [userModalVisible, setUserModalVisible] = useState(false);
	const [userModalData, setUserModalData] = useState();
    
    const router = useRouter();    

    // get cookies for logged in user id
    const [cookies] = useCookies(['userObj']);
    
    // this useEffect runs whenever requestData is updated
    // get user information of user associated with ticket trade request
    useEffect(() => {
        // only fetch user information requestData exists
        if (requestData) {
            if (requestType === "incoming") {
                var uid = requestData.offeredTicket.uid;
            } else if (requestType === "outgoing") { 
                var uid = requestData.requestedTicket.uid;
            } else {
                return;
            }
            // console.log("uid = " + uid);

            // Make fetch request
            fetch('http://localhost:2102/user?uid=' + uid, {method: 'GET', headers: {
                'Authorization': `${getToken(cookies['userObj'])}`
            }})
                // parse response JSON object
                .then((res) => res.json())
                // Set userData to the parsed JSON object
                .then((userData) => {
                    // console.log('userData inside modal', userData);
                    setTradeWithUserData(userData);
                });
        }
    }, [requestData]);

    const requestAcceptedNotification = () => {
        notification['success']({
            message: 'Ticket Trade Request Accepted',
            description:
                'You have traded tickets. View your new ticket below.',
        });
    };

    // complete the proposed ticket trade request
    function handleExecuteTicketTradeRequest() {
        fetch('http://localhost:2102/tickettrade', {
            method: 'PATCH', 
            headers: {
                'Authorization': `${getToken(cookies['userObj'])}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        }).then(() => {
            requestAcceptedNotification();
            hideViewRequestModal();
            reloadRequests();
            // todo: reload my tickets table
        });
    }

    function showUser(user: any) {
		setUserModalData(user)
		setUserModalVisible(true)
	}


    return (
        <>
            <Space style={{ width: "100%" }} direction="vertical" align="center">
                <Space direction="horizontal">
                    <Space direction="vertical" align="center">
                        <Text><strong>Your</strong> ticket</Text>
                        {(requestType === "incoming") ? (
                            <MiniEventView eid={requestData.requestedTicket.eid} />
                        ) : (
                            <MiniEventView eid={requestData.offeredTicket.eid} />
                        )}
                    </Space>
                    <SwapOutlined />
                    <Space direction="vertical" align="center">
                        <Space direction="horizontal">
                            <SmallUserTitle strong onClick={() => { showUser(tradeWithUserData) }}>
                                {tradeWithUserData?.firstName}
                        </SmallUserTitle>
                            <Text style={{ marginLeft: "-8px" }}>'s ticket</Text>
                        </Space>
                        {(requestType === "incoming") ? (
                            <MiniEventView eid={requestData.offeredTicket.eid} />
                        ) : (
                            <MiniEventView eid={requestData.requestedTicket.eid} />
                        )}
                    </Space>
                </Space>
                {(requestType === "incoming") && (
                    <Button type="primary" size={'large'} style={{ marginTop: "30px" }} onClick={handleExecuteTicketTradeRequest}>
                        <Text strong style={{ color: 'white' }}>TRADE TICKETS</Text>
                    </Button>
                )}
            </Space>
            <UserModal visible={userModalVisible} setModalVisibe={setUserModalVisible} data={userModalData} />

        </>
    )
};

export default ViewTicketTradeRequest;
