import Particles from 'react-tsparticles';
import styled from 'styled-components';

const ParticlesContainer = styled.div`

`;

const EventParticles = () => {
    return (
        <>
            <ParticlesContainer>
				<Particles
					width="100vw"
					height="600px"
					style={{ display: 'block' }}
					options={{
						backgroundMode: {
							enable: false,
							zIndex: 0,
						},
						background: {
							color: '#f9f4f5',
						},
						fpsLimit: 60,
						interactivity: {
							detectsOn: 'canvas',
							events: {
								onClick: { enable: true, mode: 'repulse' },
								onHover: {
									enable: false,
									mode: 'bubble',
									parallax: { enable: false, force: 2, smooth: 10 },
								},
								resize: true,
							},
							modes: {
								bubble: {
									distance: 400,
									duration: 0.3,
									opacity: 1,
									size: 4,
									speed: 3,
								},
								grab: { distance: 400, line_linked: { opacity: 0.5 } },
								push: { particles_nb: 4 },
								remove: { particles_nb: 2 },
								repulse: { distance: 200, duration: 5 },
							},
						},
						particles: {
							color: { value: '#EC6C6C' },
							links: {
								color: '#ffffff',
								distance: 1200,
								enable: false,
								opacity: 0.4,
								width: 2,
							},
							move: {
								attract: { enable: false, rotateX: 600, rotateY: 1200 },
								direction: 'none',
								enable: true,
								outMode: 'out',
								random: false,
								size: true,
								speed: 1,
								straight: false,
							},
							number: { density: { enable: true, area: 800 }, value: 50 },
							opacity: {
								random: true,
								value: 0.5,
							},
							shape: {
								type: 'circle',
							},
							size: {
								random: true,
								value: 12,
							},
						},
						detectRetina: true,
					}}
				/>
			</ParticlesContainer>
        </>
    )
}

export default EventParticles;