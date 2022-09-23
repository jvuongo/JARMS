import { useEffect, useState } from 'react';
import { Avatar, Button, Typography, Card, Image, Space, Tooltip, Form, Input } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';

const { Title, Text } = Typography;

const SmallEventTitle = styled(Title)`
    color: #C43444 !important; 
    cursor: pointer;
    &:hover {
        text-decoration: underline;
      }
`

interface EventInfoType {
    _id: string;
    host: {
        firstName: string;
        lastName: string;
    };
    ticketPrice: number;
    maxGuests: number;
    isPrivate: boolean;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    image: string;
    tags: string[];
    comments: [];
    attendees: string[];
    __v: number;
}

interface MiniEventViewProps {
	eid: string;
}

const MiniEventView = ({eid}: MiniEventViewProps) => {
    const [eventData, setEventData] = useState<EventInfoType | undefined>();
    const [cookies] = useCookies(['userObj']);
    const router = useRouter();

    // This useEffect runs whenever a new eid is passed into this component
	useEffect(() => {

        // Make fetch request
        fetch('http://localhost:2102/event?eid=' + eid, {method: 'GET', headers: {
            'Authorization': `${getToken(cookies['userObj'])}`
        }})
            // parse response JSON object
            .then((res) => res.json())
            // Set eventData to the parsed JSON object
            .then((eventData) => {
                // console.log('mini event view eventData', eventData);
                setEventData(eventData);
            });
	}, [eid]);
    

    // Show loading message if waiting for response from backend
	if (eventData == undefined) {
		return(<div>Loading...</div>);
	}

    return (
        <>
            <Card style={{ width: '300px', height: '200px', borderRadius: 10}} hoverable onClick={()=> {router.push('/event/' + eid)}}>
                <Space style={{width: "100%"}} direction="vertical" align="center">
                    <SmallEventTitle level = {4} style={{margin:0}}>
                        {eventData.title}
                    </SmallEventTitle>
                    <Space direction="horizontal">
                        <CalendarOutlined />
                        <Text type="secondary">{moment(eventData.startDate).format('DD MMMM YYYY')}</Text>
                    </Space>
                    <Image alt="example" height={70} width={280} style={{objectFit: 'contain'}} src={eventData.image} preview={false}/>
                    <Text type="secondary">Host: {eventData.host.firstName} {eventData.host.lastName}</Text>
                </Space>
            </Card>
        </>
    )
}

export default MiniEventView;