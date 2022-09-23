import styled from 'styled-components';
import { Typography } from 'antd';

const { Title } = Typography;

const Container = styled.div``;

const Friends = () => {
	return (
		<Container>
			<Title level={2}>Friends</Title>
            You have no friends yet
		</Container>
	);
};

export default Friends;
