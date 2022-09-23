import { useState, useEffect } from 'react';
import { Table, Button } from 'antd'
import { Base64 } from 'js-base64';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import ReviewModal from '../review/ReviewModal';
import getToken from '@/lib/helpers/getToken';

interface ReviewType {
	_id: string;
	eid: string;
}

const PastTicketsComponent = () => {
    const router = useRouter();
    const [ticketData, setTicketData] = useState<undefined>();
    const [reviewsData, setReviewsData] = useState<ReviewType[] | undefined>();
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
                setTicketData(data.pastTickets)
                setLoading(false);
            });
    }, [reviewsData]);

    useEffect(() => {
        const token = Base64.encode(JSON.stringify(cookies['userObj']));
        // While waiting for the server to send the data, show a loading message
        setLoading(true);
        fetch('http://localhost:2102/userreviews', {method: 'GET', headers: {
            'Authorization': `${getToken(cookies['userObj'])}`
        }})
            // The response is a JSON object, so we can use .json() to parse it
            .then((res) => res.json())
            // Set the data to the parsed JSON object
            .then((data) => {
                setReviewsData(data)
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

                const disableReviewButton = (record) => {
                    if (reviewsData != null) {
                        for (const review of reviewsData) {
                            if (review.eid == record.eid) {
                                return true
                            }
                        }
                        return false;
                    }
                    return false
                };
              return (
                  <>
                    <Button type="primary" style={{marginRight: '20px'}} size={'large'} onClick={() => { router.push('/event/' + record.eid) }}>
                        View Event
                    </Button>
                    <ReviewModal eid={record.eid} disableButton = {disableReviewButton(record)}/>
                  </>
              )
          }
      }
    ];

    return (
        <>
        <Table columns={columns} dataSource={ticketData}/>
        </>
    )
};

export default PastTicketsComponent;
