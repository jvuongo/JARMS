import { Layout } from 'antd';
import { useRouter } from 'next/router';

interface Props {
	role?: string;
	id?: string;
	children: any;
}

const { Content } = Layout;

const DefaultLayout = ({ children }: Props) => {
	const router = useRouter();
	return (
		<Layout>
			<Layout style={{ padding: '10px' }}>
				<Content
					className="site-layout-background"
					style={{
						padding: 20,
						margin: 0,
						paddingTop: 90,
						minHeight: 280,
					}}
				>
					{children}
				</Content>
			</Layout>
		</Layout>
	);
};

export default DefaultLayout;
