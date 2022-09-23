import { useEffect, useState } from 'react';
import { Avatar, Button, Typography, Space, Tooltip, Form, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import UserModal from '@/components/user/UserModal';

const { Title } = Typography;

const BigUserTitle = styled(Title)`
    color: #C43444 !important; 
    margin: 5px 0 0 0;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
      }
`

interface UserInfoType {
    _id: string;
    firstName: string;
    lastName: string;
    age: string;
    email: string;
    avatar: String;
}

interface UserGoingProps {
	userID: string;
    showTradeSelectModal: () => void;
    setTradeWithUserData: (userData: UserInfoType) => void;
    loggedInAttendingStatus: boolean;
}

const GoingListUser = ({userID, showTradeSelectModal, setTradeWithUserData, loggedInAttendingStatus}: UserGoingProps) => {
    const router = useRouter();
    const [userData, setUserData] = useState<UserInfoType | undefined>();
    const [isLoading, setLoading] = useState(false);
    const [cookies] = useCookies(['userObj']);

    // variables and helper function for view user profile modal
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [userModalData, setUserModalData] = useState();
    function showUser(user: any) {
        setUserModalData(user)
        setUserModalVisible(true)
    }

    // This useEffect runs on page load once router is ready
	useEffect(() => {
        setLoading(true);

        // Make fetch request
        fetch('http://localhost:2102/user?uid=' + userID, {method: 'GET', headers: {
			'Authorization': `${getToken(cookies['userObj'])}`
		}})
            // parse response JSON object
            .then((res) => res.json())
            // Set userData to the parsed JSON object
            .then((userData) => {
                // console.log('userData', userData);
                setUserData(userData);
                setLoading(false);
            });
	}, []);
    

    // Show loading message if waiting for response from backend
	if (isLoading || userData == undefined) {
		return(<div>Loading...</div>);
	}

    return (
        <>
            {/* User Profile Modal */}
            <UserModal visible={userModalVisible} setModalVisibe={setUserModalVisible} data={userModalData} />
            
            <div>
                <Space direction="horizontal" style={{marginBottom: 20}}>
                    <Avatar
                        size={48}
                        src={
                            userData?.avatar ??
                            'https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png'
                        }
                    />
                    <BigUserTitle level={3} onClick={() => { showUser(userData) }}>
                            {userData.firstName} {userData.lastName}
                    </BigUserTitle> 
                    {(cookies['userObj']._id === userData._id) && (
                        <Title level={3} type="secondary" style={{marginTop: "5px", fontWeight: "normal"}}>
                            (you)
                        </Title> 
                    )}
                </Space>
                {(cookies['userObj']._id !== userData._id) && (
                    <Space direction="horizontal" style={{float: "right", marginTop: 8}}>
                        {(!(loggedInAttendingStatus)) && (
                            <Button onClick={() => { setTradeWithUserData(userData); showTradeSelectModal() }}>Trade Ticket</Button>
                        )}
                    </Space>
                )}
            </div>
        </>
    )
}

export default GoingListUser;