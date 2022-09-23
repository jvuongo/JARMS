import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { Request } from 'express';
import { Base64 } from 'js-base64';
import { useEffect } from 'react';

const userVerification = (req: Request) => {
	const [cookies, setCookies, removeCookie] = useCookies();
	const router = useRouter();
	// if(router.query.payload){
	//   const body = Base64.decode(router.query.payload.toString());
	//   console.log(body);
	//   //const user = await createUser(body)
	// }

	useEffect(() => {
		const payload = router.query.payload?.toString();

		fetch('http://localhost:2102/userVerification?payload=' + payload)
			.then((response) => response.json())
			.then((data) => {
				// Get response and set cookies
				setCookies('userObj', data, { path: '/' });

				// router.push('/');
				// We cannot just push as chat engine won't reload.
				window.location.assign('http://localhost:3000/');
			});
	}, [router.isReady]);

	return <></>;
};

export default userVerification;
