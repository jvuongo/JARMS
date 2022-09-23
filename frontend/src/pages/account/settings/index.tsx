import { PageHeader, Button, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SettingsContainer from '@/components/account/SettingsContainer';
import LoadingScreen from '@/components/LoadingScreen';
import { WidgetLoader } from 'react-cloudinary-upload-widget'
import UploadWidget from '@/components/host/UploadWidget';

export default function Settings() {
	const router = useRouter();
	return (
		<>
		<WidgetLoader />
			<PageHeader
				backIcon={<ArrowLeftOutlined style={{ padding: '5px', borderRadius: '5px', fontSize: '1.2rem' }} />}
				className="site-page-header"
				onBack={() => {history.back()}}
				title="My Account"
				style={{marginBottom: '-20px'}}
			/>
			<SettingsContainer/>
		</>
	);
}

