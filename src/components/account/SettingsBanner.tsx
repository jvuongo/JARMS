import styles from '../../styles/account/SettingsBanner.module.css';
import BlankProfileImage from '@/public/blank_profile_image.png';
import UploadWidget from '@/components/account/UploadWidget';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import getToken from '@/lib/helpers/getToken';
import moment from 'moment';
interface Props {
	user?: any;
}

const SettingsHeader = ({ user }: Props) => {
	const [image, setImage] = useState(
		'https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png',
	);

	const [cookies, setCookie] = useCookies(['userObj']);


	const userData = cookies.userObj;
	const router = useRouter();


	useEffect(() => {
		if (userData?.avatar) {
			setImage(userData.avatar);
		}
	}, []);

	return (
		<div className={styles.settings_banner_container}>
			<div className={styles.settings_banner_image_container}>
				<Image src={image} layout="fill" objectFit="cover" />
			</div>
			<UploadWidget
				onSuccessCallback={(url) => {
					setImage(url);
					setCookie('userObj', {...userData, avatar: url}, {path: '/'});
					fetch('http://localhost:2102/avatar', {
						method: 'POST',
						headers: {
							'Authorization': `${getToken(cookies['userObj'])}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({src: url})
					});
					
				}}
			/>
			<div className={styles.settings_banner_main}>
				<div className={styles.settings_banner_name}>
					{' '}
					{user?.firstName} {user?.lastName}{' '}
				</div>
				<div className={styles.settings_banner_subscription}>{`Joined ${moment(user?.createdAt).fromNow()}`} </div>
			</div>
		</div>
	);
};

export default SettingsHeader;
