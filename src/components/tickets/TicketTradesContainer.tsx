import { useState, useEffect } from 'react';
import { Base64 } from 'js-base64';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import { Typography, Modal, Space, Row, Col, Button, Pagination } from 'antd';
import TicketTradeRequestContainer from '@/components/tickets/TicketTradeRequestContainer';
import ViewTicketTradeRequest from '@/components/tickets/ViewTicketTradeRequest';

const { Title, Text, Paragraph } = Typography;

interface TicketTradeType {
    _id: string;
    incoming: any;
    outgoing: any;
}

const TicketTradesContainer = () => {
    const [cookies] = useCookies(['userObj']);
    const [isLoading, setLoading] = useState(false);
    const [ticketTradesData, setTicketTradesData] = useState<TicketTradeType | undefined>();
    const [selectedRequestData, setSelectedRequestData] = useState<undefined>();
    const [selectedRequestType, setSelectedRequestType] = useState<string>();
    const [isViewRequestModalVisible, setIsViewRequestModalVisible] = useState(false);


    const showViewRequestModal = () => {
        setIsViewRequestModalVisible(true);
    };
    const hideViewRequestModal = () => {
        setIsViewRequestModalVisible(false);
    };

    // This useEffect 'hook' with an empty array means it runs the code under
    // as soon as the page loads
    useEffect(() => {
        const token = Base64.encode(JSON.stringify(cookies['userObj']));
        // While waiting for the server to send the data, show a loading message
        setLoading(true);
        fetch('http://localhost:2102/usertickettrades?uid=' + cookies['userObj']._id, {
            method: 'GET',
            headers: {
                Authorization: `${getToken(cookies['userObj'])}`,
            },
        })
            // The response is a JSON object, so we can use .json() to parse it
            .then((res) => res.json())
            // Set the data to the parsed JSON object
            .then((data) => {
                setTicketTradesData(data)
                // console.log("ticketTradesData", ticketTradesData);
                setLoading(false);
            });
    }, []);

    function fetchUpdatedTicketTradeRequests() {
        fetch('http://localhost:2102/usertickettrades?uid=' + cookies['userObj']._id, {
            method: 'GET',
            headers: {
                Authorization: `${getToken(cookies['userObj'])}`,
            },
        })
            // The response is a JSON object, so we can use .json() to parse it
            .then((res) => res.json())
            // Set the data to the parsed JSON object
            .then((data) => {
                setTicketTradesData(data)
                // console.log("ticketTradesData", ticketTradesData);
            });
    }

    // Show loading message if waiting for response from backend
	if (isLoading || ticketTradesData == undefined) {
		return(<div>Loading...</div>);
	}

    return (
        <>
            {/* "View  Ticket Trade Request" Modal */}
            <Modal
            visible={isViewRequestModalVisible}
            onCancel={hideViewRequestModal}
            footer={null}
            width={"700px"}
            >
                <Title level = {2} style={{textAlign: "center"}}>
                    TICKET TRADE REQUEST
                </Title>
                {selectedRequestData ? (
                    <>
                        <ViewTicketTradeRequest 
                            requestData={selectedRequestData}
                            requestType={selectedRequestType}
                            hideViewRequestModal={hideViewRequestModal}
                            reloadRequests = {fetchUpdatedTicketTradeRequests}
                        />
                    </>
                ) : (
                    <Text>loading...</Text>
                )}
            </Modal>

            {/* Main Content */}
            <Title level = {1}>
                Ticket Trade Requests
            </Title>

            <Row>
                <Col span={11}>
                    {/* Incoming Ticket Trade Requests */}
                    <Title level = {3} style={{ margin: 0 }}>
                        Incoming Requests: <span style={{ color: "#555555" }}>({ticketTradesData?.incoming.length})</span>
                    </Title>
                    {ticketTradesData.incoming.map((ticketTradeRequest) => (
                        <TicketTradeRequestContainer 
                            requestData = {ticketTradeRequest}
                            showViewRequestModal={showViewRequestModal}
                            setSelectedRequestData={setSelectedRequestData}
                            setSelectedRequestType={setSelectedRequestType}
                            requestType = "incoming"
                            reloadRequests = {fetchUpdatedTicketTradeRequests}
                        />
                    ))}
                    {(ticketTradesData?.incoming.length > 0) ? (
                        <Pagination defaultCurrent={1} total={ticketTradesData.incoming.length} />

                    ) : (
                        <Paragraph italic style={{marginTop: "20px", color: "#555555"}}>You have no pending incoming ticket trade requests.</Paragraph>
                    )}
                </Col>
                <Col span={2}/>
                <Col span={11}>
                    {/* Outgoing Ticket Trade Requests */}
                    <Title level = {3} style={{ margin: 0 }}>
                        Outgoing Requests: <span style={{ color: "#555555" }}>({ticketTradesData.outgoing.length})</span>
                    </Title>
                    {ticketTradesData.outgoing.map((ticketTradeRequest) => (
                        <TicketTradeRequestContainer 
                            requestData = {ticketTradeRequest}
                            showViewRequestModal={showViewRequestModal}
                            setSelectedRequestData={setSelectedRequestData}
                            setSelectedRequestType={setSelectedRequestType}
                            requestType = "outgoing"
                            reloadRequests = {fetchUpdatedTicketTradeRequests}
                        />
                    ))}
                    {(ticketTradesData?.outgoing.length > 0) ? (
                        <Pagination defaultCurrent={1} total={ticketTradesData?.outgoing.length} />

                    ) : (
                        <Paragraph italic style={{marginTop: "20px", color: "#555555"}}>You have no pending outgoing ticket trade requests.</Paragraph>
                    )}
                </Col>
            </Row>
            <br/><br/>
        </>
    )
};

export default TicketTradesContainer;
