import { Button, Typography } from 'antd'
import { Base64 } from 'js-base64';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import styled from 'styled-components';
import PastTicketsComponent from '@/components/tickets/PastTicketsComponent'
import UpcomingTicketsComponent from '@/components/tickets/UpcomingTicketsComponent'
import TicketTradesContainer from '@/components/tickets/TicketTradesContainer'
import getToken from '@/lib/helpers/getToken';

const { Title } = Typography;

const ButtonToggle = styled(Button)`
	padding: 20px 25px;
	display: flex;
	justify-content: center;
	align-items: center;
	&:nth-of-type(2) {
		margin-left: 10px;
	}
`;

const ButtonContainer = styled.div`
	display: flex;
	margin: 20px 10px;
	.ant-btn-primary:hover,
	.ant-btn-primary:focus {
		color: #fff;
		border-color: #c63643;
		background: #c63643;
	}
`;

const MyTickets = () => {
    const [data, setData] = useState<undefined>();
	const [isLoading, setLoading] = useState(false);
    const [cookies] = useCookies(['userObj']);
    const [table, setTable] = useState('upcoming');

    

    // Show loading message if waiting for response from backend
	if (isLoading) {
		return(<div>Loading...</div>);
	}

    return (
        <>
            <Title level = {1} style={{ margin: 0 }}>
                My Tickets
            </Title>
            <ButtonContainer>
                <ButtonToggle
                    type={table === 'upcoming' ? 'primary' : 'default'}
                    onClick={() => {
                      setTable('upcoming');
                    }}
                >
                    Upcoming
                </ButtonToggle>
                <ButtonToggle
                    type={table === 'past' ? 'primary' : 'default'}
                    onClick={() => {
                      setTable('past');
                    }}
                >
                    Past
                </ButtonToggle>
            </ButtonContainer>
      
            {table === 'upcoming' ? <UpcomingTicketsComponent/> : <PastTicketsComponent/>}

            {/* List of active ticket trade requests */}
            <TicketTradesContainer/>
        </>
    )
};

export default MyTickets;
