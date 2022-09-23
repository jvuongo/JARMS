import { Button, Card, Row } from "antd";
import Title from "antd/lib/typography/Title";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { useCookies } from 'react-cookie';
import { Base64 } from 'js-base64';
import getToken from "@/lib/helpers/getToken";

const gridStyle = {
    width: '100%',
    textAlign: 'center',
  };

const VerifiedTicket = () => {
    const [isLoading, setLoading] = useState(false);
    const router = useRouter();
    const [cookies] = useCookies(['userObj']);

    // Set loading as soon as page loads
    useEffect(() => {
        setLoading(true);
    }, []);

    // Get id of current ticket from url
    const tid = router.query.tid;

    // This useEffect runs on page load once router is ready
    useEffect(() => {
        const token = Base64.encode(JSON.stringify(cookies['userObj']));
        
        // Sending payload to endpoint
        fetch('http://localhost:2102/ticket?_id=' + tid, {method: 'PATCH', headers: {
            'Authorization': `${getToken(cookies['userObj'])}`
        }})
    }, [router.isReady]);

    return (
        <Row type="flex" justify="center" align="middle" style={{minHeight: '75vh'}}>
            <Card style={{ borderRadius: 10 }}>
                <Card.Grid style={gridStyle} hoverable={false}>
                    <p><img src="https://i.ibb.co/D7hXghm/check-1.png"/></p>
                    <Title level={1}>Ticket #{tid?.substring(0, 12)} has been verified.</Title>
                    <p><Button type = "primary" size={'large'} href= "./"> Back to ticket </Button></p>
                </Card.Grid>
            </Card>
        </Row>
    )
}

export default VerifiedTicket;
