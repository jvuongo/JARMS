import React, {useState} from 'react'
import {Button, Modal, List, Skeleton} from 'antd'
import { ArrowsAltOutlined } from '@ant-design/icons';
import FriendCard from './FriendCard';
import FriendModal from './FriendModal';
import Title from 'antd/lib/typography/Title';

interface Props {
	friends?: any;
	loading: boolean;
}

const AllFriendsModal = ({ friends, loading }: Props) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [friendModalVisible, setFriendModalVisible] = useState(false)
	const [friendModalData, setFriendModalData] = useState();

    const showModal = () => {
        setIsModalVisible(true)
    };

    const handleCancel = () => {
        setIsModalVisible(false)
    };

    function showFriend(friend: any) {
		setFriendModalData(friend)
		setFriendModalVisible(true)
	}

	if (loading) {
		return <Skeleton active />;
	}

    return (
        <>
        <Button type="link" onClick = {showModal}><ArrowsAltOutlined style={{ fontSize: '24px'}}/></Button>
        <Modal 
            visible={isModalVisible} 
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            footer={null}
			bodyStyle={{
				maxHeight: 800,
                overflow: 'auto'
			}}
            title={<Title level={3} style={{margin: 0}}>All Friends</Title>}
        > 
			{friends.length === 0 ? (
				<div>You have no friends yet</div>
			) : (
				<List
					loading={loading}
					itemLayout="horizontal"
					dataSource={friends}
					renderItem={(item) => <FriendCard showFriend={showFriend} data={item} />}
				/>
				)}
        </Modal>
        <FriendModal visible={friendModalVisible} setModalVisibe={setFriendModalVisible} data={friendModalData} />
       </>
    )

}

export default AllFriendsModal
