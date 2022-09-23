import { useEffect, useState } from 'react';
import { Avatar, Button, Typography, Space, Tooltip, Form, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import getToken from '@/lib/helpers/getToken';
import FriendModal from '@/components/social/friends/FriendModal';

const { Title } = Typography;

const BigUserTitle = styled(Title)`
	color: #c43444 !important;
	margin: 5px 0 0 0;
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
	font-size: 15px !important;
`;

interface UserInfoType {
	_id: string;
	firstName: string;
	lastName: string;
	age: string;
	email: string;
}

interface FriendGoingProps {
	friendID: string;
}

const FriendGoing = ({ friendID }: FriendGoingProps) => {
	const router = useRouter();
	const [userData, setUserData] = useState<UserInfoType | undefined>();
	const [isLoading, setLoading] = useState(false);
	const [cookies] = useCookies(['userObj']);


	// This useEffect runs on page load once router is ready

    // variables and helper function for view friend profile modal
    const [friendModalVisible, setFriendModalVisible] = useState(false)
    const [friendModalData, setFriendModalData] = useState();
    function showFriend(friend: any) {
        setFriendModalData(friend)
        setFriendModalVisible(true)
    }

    // This useEffect runs on page load once router is ready

	useEffect(() => {
		setLoading(true);

		// Make fetch request
		fetch('http://localhost:2102/user?uid=' + friendID, {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
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
		return <div>Loading...</div>;
	}


    return (
        <>
            <div>
                <Space direction="horizontal" style={{marginBottom: 20}}>
                    {/* Todo: profile picture once user data is updated */}
                    <Avatar size={48} src={userData.avatar ?? 'https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png'} />
                    <BigUserTitle level={3} onClick={() => { showFriend(userData) }}>
                            {userData.firstName} {userData.lastName}
                    </BigUserTitle> 
                </Space>
                <FriendModal visible={friendModalVisible} setModalVisibe={setFriendModalVisible} data={friendModalData} />
            </div>
        </>
    )
}

export default FriendGoing;
