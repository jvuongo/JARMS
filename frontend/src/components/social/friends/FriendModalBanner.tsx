import styles from '../../../styles/account/SettingsBanner.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import getToken from '@/lib/helpers/getToken';
import moment from 'moment';
interface Props {
	user?: any;
}

const FriendHeader = ({ user }: Props) => {
	return (
		<div className={styles.settings_banner_container} style={{margin: '20px', marginBottom: '35px'}}>
			<div className={styles.settings_banner_image_container}>
				<Image src={user?.avatar ?? 'https://res.cloudinary.com/dwiv2vrtr/image/upload/v1648973068/blank_profile_image_goz124.png'} layout="fill" objectFit="cover" />
			</div>
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

export default FriendHeader;
