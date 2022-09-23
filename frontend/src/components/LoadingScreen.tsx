import React from 'react';
import MeeticLogo from '@/public/meetic_logo.svg';
import Image from 'next/image';
import styled from 'styled-components';
interface Props {
	text? : string;
}

const TextContainer = styled.div`
	color: #C43444;
`

const LoadingScreen = ({ text }: Props) => {
	const sellRoute = '/buyouts/sell/';
	return (
		<div>
			<div className="main-cont">
				<div className="content">
					<div className="image-container">
						<Image src={MeeticLogo} layout="fill" objectFit="contain" />
					</div>
					<TextContainer>
						{text}
					</TextContainer>
					
					<div className="double-lines-spinner"></div>
				</div>
			</div>

			<style jsx>{`
				.main-cont {
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.content {
					display: flex;
					flex-direction: column;
					height: 90vh;
					align-items: center;
					justify-content: center;
					transform: translateY(-30px);
				}

				.image-container {
					width: 180px;
					position: relative;
					height: 130px;
				}

				.loading-text {
					padding-bottom: 1.6em;
					font-size: 1.6em;
				}

				.double-lines-spinner {
					width: 64px;
					height: 64px;
					border-radius: 50%;
					position: relative;
				}
				.double-lines-spinner::after,
				.double-lines-spinner::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					display: block;
					border-radius: 50%;
					border: 2px solid rgba(0, 0, 0, 0.05);
				}

				.double-lines-spinner::before {
					border-right: 2px solid #C43444;
					animation: spin 1s 1s linear infinite;
				}

				.double-lines-spinner::after {
					border-bottom: 2px solid #C43444;
					/*   animation: spin 1s 0.15s ease-in-out infinite; */
					animation: spin 1s 0.3s cubic-bezier(0.46, 0.03, 0.52, 0.96) infinite;
				}

				@keyframes spin {
					100% {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</div>
	);
};

export default LoadingScreen;
