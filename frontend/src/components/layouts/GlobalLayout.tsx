import { Layout, Menu } from 'antd';
import Header from '../header/Header';
import {useRouter} from 'next/router'
import ChatBox from '@/components/chat/Chatbox'

interface Props {
	children: any;
}

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

const GlobalLayout = ({ children }: Props) => {
		return (
			<Layout style={{ height: '100vh', position: 'relative', background: 'white' }}>
				<Header></Header>
				<Layout>{children}</Layout>
				<ChatBox></ChatBox>
			</Layout>
		);
};

export default GlobalLayout;
