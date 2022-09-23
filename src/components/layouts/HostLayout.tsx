import { Menu, Layout } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styled from 'styled-components';

interface Props {
	role?: string;
	id?: string;
	children: any;
}

const { Content, Sider } = Layout;
const { SubMenu: AntSubMenu, Item } = Menu;

const SideMenuHeading = styled.div`
	font-weight: bold;
	font-family: 'Lato', sans-serif;
	padding: 20px 15px 10px 15px;
	color: rgb(47, 47, 47);
`;

const SubMenu = styled(AntSubMenu)`
	.ant-menu-sub.ant-menu-inline {
		background: #edeef2;
	}
`;

const AdminLayout = ({ children }: Props) => {
	const router = useRouter();
	console.log("PATH", router.pathname);
	return (
		<Layout style={{paddingTop: 60}}>
			<Sider
				style={{ height: 'fit-content', minHeight: '100%' }}
				breakpoint={'md'}
				className="sidemenu"
				collapsedWidth={0}
			>
				<Menu
					mode="inline"
					defaultSelectedKeys={['1']}
					selectedKeys={[router.pathname === '/host/create' ? '2' : '1']}
					defaultOpenKeys={['sub1']}
					style={{ height: '100%', borderRight: 0, paddingBottom: '40px', color: '#616161' }}
				>
					<Menu.Item icon={<CalendarOutlined/>} onClick={()=> {router.push('/host')}} key="1">
						Events
					</Menu.Item>
					<Menu.Item icon={<PlusOutlined />} onClick={()=> {router.push('/host/create')}} key="2">
						Create New Event
					</Menu.Item>
				</Menu>
			</Sider>
			<Layout style={{ padding: '10px' }}>
				<Content
					className="site-layout-background"
					style={{
						padding: 20,
						margin: 0,
						minHeight: 280,
						overflow: 'auto',
					}}
				>
					{children}
				</Content>
			</Layout>
		</Layout>
	);
};

export default AdminLayout;
