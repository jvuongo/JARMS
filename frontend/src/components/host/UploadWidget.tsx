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
      buttonText={'Upload Cover Photo'}
      style={{
        color: 'white',
        width: '150px',
        border: 'none',
        backgroundColor: '#C63643',
        padding: '10px',
        borderRadius: '10px',
        cursor: 'pointer',
      }}
      className={'cloudinary-button'}
      cropping={false}
      onSuccess={(result: CloudinarySuccessResult) => {
        onSuccessCallback(result.info.url);
      }}
      onFailure={() => {
        notification.error({ message: 'Something went wrong while uploading images. Please try again.' });
      }}
      multiple
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