import { EditOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import { Widget } from 'react-cloudinary-upload-widget';
import styled from 'styled-components';

interface Props {
  onSuccessCallback: (url: string) => void;
}

interface CloudinarySuccessResult {
  event: string;
  info: {
    url: string;
  };
}

const WidgetContainer = styled.div`
  margin: 20px 0px;
`;

const CloudinaryWidget = ({ onSuccessCallback }: Props) => (
  <WidgetContainer>
    <Widget
      sources={['local']}
      sourceKeys={{ dropboxAppKey: '1dsf42dl1i2', instagramClientId: 'd7aadf962m' }}
      resourceType={'image'}
      cloudName={'dwiv2vrtr'}
      uploadPreset={'meetic'}
      buttonText={<EditOutlined />}
      style={{
        color: 'white',
        border: 'none',
        backgroundColor: '#C63643',
        borderRadius: '50%',
        cursor: 'pointer',
        position: 'relative',
        top: '23px',
        right: '15px',
      }}
      className={'cloudinary-button'}
      cropping={false}
      onSuccess={(result: CloudinarySuccessResult) => {
        onSuccessCallback(result.info.url);
      }}
      autoClose={false}
      onFailure={() => {
        notification.error({ message: 'Something went wrong while uploading images. Please try again.' });
      }}
      widgetStyles={{
        palette: {
          window: '#FFFFFF',
          windowBorder: '#949494',
          tabIcon: '#C63643',
          menuIcons: '#D7D7D8',
          textDark: '#000000',
          textLight: '#FFFFFF',
          link: '#C63643',
          action: '#FF620C',
          inactiveTabIcon: '#000000',
          error: '#c43737',
          inProgress: '#0194c7',
          complete: '#000000',
          sourceBg: '#E4EBF1',
        },
      }}
    />
  </WidgetContainer>
);

export default CloudinaryWidget;