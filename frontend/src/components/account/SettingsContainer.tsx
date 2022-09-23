import { Card, Space, Button, Skeleton } from 'antd';
import SettingsForm from './SettingsForm';
import SettingsBanner from './SettingsBanner';
import { useEffect, useState } from 'react';
import getToken from '@/lib/helpers/getToken';
import { useCookies } from 'react-cookie';

const SettingsContainer = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [cookies] = useCookies(['userObj']);
	const [user, setUser] = useState();

	useEffect(() => {
		fetch('http://localhost:2102/me', {
			method: 'GET',
			headers: {
				Authorization: `${getToken(cookies['userObj'])}`,
			},
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				setLoading(false);
				setUser(data);
			});
	}, []);

	if (loading || !user) {
		return <Skeleton active />;
	}

	return (
		<Space direction="vertical" style={{ width: '100%' }} align="center" size={'small'}>
			<div style={{ width: '600px' }}>
				<Card bordered={false} style={{ borderRadius: '10px', marginBottom: '25px' }}>
					<SettingsBanner user={user ?? {}} />
					<SettingsForm user={user ?? {}} />
				</Card>
			</div>
		</Space>
	);
};

export default SettingsContainer;
