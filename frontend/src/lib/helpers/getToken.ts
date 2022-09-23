import _ from 'lodash';
import { Base64 } from 'js-base64';

export default function getToken(cookie) {
    // console.log("cookiezz", cookie);
    const user = _.pick(cookie, ['_id', 'firstName', 'lastName', 'email']);

    // console.log('USER', user);
	const token = Base64.encode(JSON.stringify(user));
    // console.log("TOKENNN", token)

    return token;
}