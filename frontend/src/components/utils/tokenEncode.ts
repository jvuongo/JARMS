import { useCookies } from 'react-cookie';
import { Base64 } from 'js-base64';

export function tokenEncode() {
  const [cookies] = useCookies(['userObj']);

  return(
    Base64.encode(JSON.stringify(cookies['userObj']))
  );
}