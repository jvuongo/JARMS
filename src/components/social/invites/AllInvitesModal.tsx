import React, {useState} from 'react'
import {Button, Modal, List, Skeleton} from 'antd'
import { ArrowsAltOutlined } from '@ant-design/icons';
import FriendInviteCard from './FriendInviteCard';
import EventInviteCard from './EventInviteCard';
import Title from 'antd/lib/typography/Title';

interface Props {
	invites: {
		events: any[];
		friends: any[];
	};
	loading: boolean;
}

const AllInvitesModal = ({ invites, loading }: Props) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false)

    const showModal = () => {
        setIsModalVisible(true)
    };

    const handleCancel = () => {
        setIsModalVisible(false)
    };

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
			title={<Title level={3} style={{margin: 0}}>All Invites</Title>}
        > 
        	{
				invites?.events.length  > 0 &&
				<List
				className="demo-loadmore-list"
				size='default'
				loading={loading}
				itemLayout="horizontal"
				dataSource={invites?.events}
				renderItem={item => (
					<EventInviteCard data={item} />
				)}
			  />
			}
            {
				invites?.friends.length > 0 &&
				<List
				className="demo-loadmore-list"
				size='default'
				loading={loading}
				itemLayout="horizontal"
				dataSource={invites?.friends}
				renderItem={item => (
					<FriendInviteCard data={item} />
				)}
			  />
			}
        </Modal>
       </>
    )

}

export default AllInvitesModal
