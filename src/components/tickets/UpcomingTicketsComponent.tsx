import { useState, useEffect } from 'react';
import { Table, Button, Space } from 'antd'
import { Base64 } from 'js-base64';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';

const UpcomingTicketsComponent = () => {
    const router = useRouter();
    const [ticketData, setTicketData] = useState<undefined>();
    const [isLoading, setLoading] = useState(false);
    const [cookies] = useCookies(['userObj']);

    // This useEffect 'hook' with an empty array means it runs the code under
    // as soon as the page loads
    useEffect(() => {
        const token = Base64.encode(JSON.stringify(cookies['userObj']));
        // While waiting for the server to send the data, show a loading message
        setLoading(true);
        fetch('http://localhost:2102/sortusertickets', {method: 'GET', headers: {
            'Authorization': `${getToken(cookies['userObj'])}`
        }})
            // The response is a JSON object, so we can use .json() to parse it
            .then((res) => res.json())
            // Set the data to the parsed JSON object
            .then((data) => {
                setTicketData(data.upcomingTickets)
                setLoading(false);
            });
    }, []);

    const columns = [
      {
          title: <b>Ticket ID</b>,
          dataIndex: '_id',
      },
      {
          title: <b>Event Name</b>,
          dataIndex: 'eventName',
      },
      {
          title: <b>Event Host</b>,
          dataIndex: 'eventHost',
      },
      {
          title: <b>Event Date</b>,
          dataIndex: 'eventDate',
      },
      {
        render: (text, record) => {
            const ticketLink = '/ticket/' + record._id
            return (
                <Space direction="horizontal">
                    <Button type = "primary" size = {'large'} href = {ticketLink}> View ticket </Button>
                    <Button type = "primary" size = {'large'} style = {{marginLeft:40}}
                        onClick = {() => { router.push('/event/' + record.eid) }}> 
                        View Event 
                    </Button>
                </Space>
            )
        }
      },
    ];

    return (
        <>
        <Table columns={columns} dataSource={ticketData}/>
        </>
    )
};

export default UpcomingTicketsComponent;
